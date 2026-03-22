<template>
  <div class="welcome dashboard-scene">
    <HeaderBar :devices="devices" @search="handleSearch" @search-reset="handleSearchReset" />

    <el-main class="dashboard-main">
      <div class="dashboard-shell">
        <section class="hero-dashboard">
          <div class="hero-copy">
            <div class="hero-eyebrow">DeskBot Dashboard</div>
            <div class="hero-title">{{ $t('home.greeting') }}</div>
            <div class="hero-title">{{ $t('home.wish') }}</div>
            <div class="hero-subtitle">Trung tâm điều phối thiết bị, vai trò và vận hành AI trên một giao diện thống nhất.</div>
            <div class="hero-actions">
              <button class="hero-primary-btn" @click="showAddDialog">
                <span>{{ $t('home.addAgent') }}</span>
                <i class="el-icon-plus"></i>
              </button>
            </div>
          </div>

          <div class="hero-aside">
            <div class="hero-stat-card">
              <div class="hero-stat-label">Tổng agent</div>
              <div class="hero-stat-value">{{ devices.length }}</div>
            </div>
            <div class="hero-stat-card muted">
              <div class="hero-stat-label">Trạng thái</div>
              <div class="hero-stat-value">{{ isLoading ? 'Đang tải' : 'Sẵn sàng' }}</div>
            </div>
          </div>
        </section>

        <section class="device-panel">
          <div class="panel-head">
            <div>
              <div class="panel-eyebrow">Agent Workspace</div>
              <h2 class="panel-title">Danh sách thiết bị / agent</h2>
            </div>
            <div class="panel-meta">{{ devices.length }} mục</div>
          </div>

          <div class="device-list-container">
            <template v-if="isLoading">
              <div v-for="i in skeletonCount" :key="'skeleton-' + i" class="skeleton-item">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line-short"></div>
                </div>
              </div>
            </template>

            <template v-else>
              <DeviceItem
                v-for="(item, index) in devices"
                :key="index"
                :device="item"
                :feature-status="featureStatus"
                @configure="goToRoleConfig"
                @deviceManage="handleDeviceManage"
                @delete="handleDeleteAgent"
                @chat-history="handleShowChatHistory"
              />
            </template>
          </div>
        </section>
      </div>

      <AddWisdomBodyDialog :visible.sync="addDeviceDialogVisible" @confirm="handleWisdomBodyAdded" />
    </el-main>

    <el-footer>
      <version-footer />
    </el-footer>

    <chat-history-dialog :visible.sync="showChatHistory" :agent-id="currentAgentId" :agent-name="currentAgentName" />
  </div>
</template>

<script>
import Api from '@/apis/api';
import AddWisdomBodyDialog from '@/components/AddWisdomBodyDialog.vue';
import ChatHistoryDialog from '@/components/ChatHistoryDialog.vue';
import DeviceItem from '@/components/DeviceItem.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import VersionFooter from '@/components/VersionFooter.vue';
import featureManager from '@/utils/featureManager';

export default {
  name: 'HomePage',
  components: { DeviceItem, AddWisdomBodyDialog, HeaderBar, VersionFooter, ChatHistoryDialog },
  data() {
    return {
      addDeviceDialogVisible: false,
      devices: [],
      originalDevices: [],
      isSearching: false,
      searchRegex: null,
      isLoading: true,
      skeletonCount: localStorage.getItem('skeletonCount') || 8,
      showChatHistory: false,
      currentAgentId: '',
      currentAgentName: '',
      featureStatus: {
        voiceprintRecognition: false,
        voiceClone: false,
        knowledgeBase: false
      }
    }
  },

  async mounted() {
    this.fetchAgentList();
    await this.loadFeatureStatus();
  },

  methods: {
    async loadFeatureStatus() {
      await featureManager.waitForInitialization();
      const config = featureManager.getConfig();
      this.featureStatus = {
        voiceprintRecognition: config.voiceprintRecognition,
        voiceClone: config.voiceClone,
        knowledgeBase: config.knowledgeBase
      };
    },
    showAddDialog() {
      this.addDeviceDialogVisible = true
    },
    goToRoleConfig() {
      this.$router.push('/role-config')
    },
    handleWisdomBodyAdded() {
      this.fetchAgentList();
      this.addDeviceDialogVisible = false;
    },
    handleDeviceManage() {
      this.$router.push('/device-management');
    },
    handleSearch(keyword) {
      this.isSearching = true;
      this.isLoading = true;
      const isMac = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(keyword)
      const searchType = isMac ? 'mac' : 'name';
      Api.agent.searchAgent(keyword, searchType, ({ data }) => {
        if (data?.data) {
          this.devices = data.data.map(item => ({
            ...item,
            agentId: item.id
          }));
        }
        this.isLoading = false;
      }, (error) => {
        console.error('搜索智能体失败:', error);
        this.isLoading = false;
        this.$message.error(this.$t('message.searchFailed'));
      });
    },
    handleSearchReset() {
      this.isSearching = false;
      this.devices = [...this.originalDevices];
    },
    handleSearchResult(filteredList) {
      this.devices = filteredList;
    },
    fetchAgentList() {
      this.isLoading = true;
      Api.agent.getAgentList(({ data }) => {
        if (data?.data) {
          this.originalDevices = data.data.map(item => ({
            ...item,
            agentId: item.id
          }));

          this.skeletonCount = Math.min(
            Math.max(this.originalDevices.length, 3),
            10
          );

          this.handleSearchReset();
        }
        this.isLoading = false;
      }, (error) => {
        console.error('Failed to fetch agent list:', error);
        this.isLoading = false;
      });
    },
    handleDeleteAgent(agentId) {
      this.$confirm(this.$t('home.confirmDeleteAgent'), '提示', {
        confirmButtonText: this.$t('button.ok'),
        cancelButtonText: this.$t('button.cancel'),
        type: 'warning'
      }).then(() => {
        Api.agent.deleteAgent(agentId, (res) => {
          if (res.data.code === 0) {
            this.$message.success({
              message: this.$t('home.deleteSuccess'),
              showClose: true
            });
            this.fetchAgentList();
          } else {
            this.$message.error({
              message: res.data.msg || this.$t('home.deleteFailed'),
              showClose: true
            });
          }
        });
      }).catch(() => { });
    },
    handleShowChatHistory({ agentId, agentName }) {
      this.currentAgentId = agentId;
      this.currentAgentName = agentName;
      this.showChatHistory = true;
    }
  }
}
</script>

<style scoped>
.welcome.dashboard-scene {
  min-width: 1100px;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 14% 16%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 24%),
    radial-gradient(circle at 82% 12%, rgba(101, 141, 255, 0.18) 0%, rgba(101, 141, 255, 0) 24%),
    linear-gradient(145deg, #f7faff 0%, #edf4ff 48%, #f4f7ff 100%);
  color: #1d2a4d;
}

.dashboard-main {
  padding: 18px 20px 10px !important;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dashboard-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-dashboard {
  min-height: 240px;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
  gap: 20px;
  padding: 34px 38px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.58) 100%),
    url("@/assets/home/main-top-bg.png") center center / cover no-repeat;
  border: 1px solid rgba(109, 132, 214, 0.14);
  box-shadow: 0 26px 64px -34px rgba(33, 57, 122, 0.25);
}

.hero-dashboard::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.24) 44%, rgba(255,255,255,0.10) 100%);
  pointer-events: none;
}

.hero-copy,
.hero-aside {
  position: relative;
  z-index: 1;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-eyebrow,
.panel-eyebrow {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(41, 61, 122, 0.72);
  margin-bottom: 12px;
}

.hero-title {
  font-size: 36px;
  line-height: 1.14;
  font-weight: 800;
  color: #223054;
}

.hero-subtitle {
  margin-top: 14px;
  max-width: 640px;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(34, 48, 84, 0.72);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
}

.hero-primary-btn {
  height: 46px;
  border: none;
  padding: 0 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #4f78ff 0%, #6f8bff 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 18px 30px -20px rgba(79, 120, 255, 0.55);
}

.hero-aside {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14px;
}

.hero-stat-card {
  border-radius: 20px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(114, 138, 214, 0.16);
  box-shadow: 0 20px 48px -34px rgba(50, 71, 136, 0.3);
}

.hero-stat-card.muted {
  background: rgba(248, 251, 255, 0.65);
}

.hero-stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(44, 63, 121, 0.58);
  margin-bottom: 8px;
}

.hero-stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #223054;
}

.device-panel {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 26px 12px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(116, 137, 214, 0.14);
  box-shadow: 0 24px 60px -38px rgba(36, 61, 128, 0.28);
}

.panel-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.panel-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
  color: #223054;
}

.panel-meta {
  font-size: 13px;
  font-weight: 700;
  color: rgba(34, 48, 84, 0.58);
}

.device-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 22px;
  padding: 20px 0 10px;
}

.device-item {
  margin: 0 !important;
  width: auto !important;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-item {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(116, 137, 214, 0.12);
  border-radius: 20px;
  padding: 20px;
  height: 120px;
  position: relative;
  overflow: hidden;
}

.skeleton-image {
  width: 72px;
  height: 72px;
  background: #edf2fb;
  border-radius: 16px;
  float: left;
  position: relative;
  overflow: hidden;
}

.skeleton-content {
  margin-left: 92px;
}

.skeleton-line {
  height: 16px;
  background: #edf2fb;
  border-radius: 999px;
  margin-bottom: 12px;
  width: 70%;
  position: relative;
  overflow: hidden;
}

.skeleton-line-short {
  height: 12px;
  background: #edf2fb;
  border-radius: 999px;
  width: 50%;
}

.skeleton-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.45),
      rgba(255, 255, 255, 0));
  animation: shimmer 1.5s infinite;
}

@media (max-width: 1200px) {
  .hero-dashboard {
    grid-template-columns: 1fr;
  }

  .hero-aside {
    flex-direction: row;
  }
}

@media (max-width: 900px) {
  .welcome.dashboard-scene {
    min-width: 0;
    height: auto;
  }

  .dashboard-main {
    padding: 14px !important;
  }

  .hero-dashboard,
  .device-panel {
    border-radius: 22px;
    padding: 20px;
  }

  .hero-title {
    font-size: 28px;
  }

  .device-list-container {
    grid-template-columns: 1fr;
  }
}
</style>
