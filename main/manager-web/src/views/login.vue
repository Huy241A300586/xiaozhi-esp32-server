<template>
  <div class="welcome">
    <el-container style="height: 100%;">
      <el-header class="auth-header">
        <div class="auth-header-left">
          <img loading="lazy" alt="" src="@/assets/xiaozhi-logo.png" class="auth-logo" />
          <span class="auth-brand">DeskBot Console</span>
        </div>

        <div class="auth-header-right">
          <div class="theme-toggle" title="Theme toggle (visual)">
            <i class="sun-icon el-icon-sunrise"></i>
            <div class="toggle-knob"></div>
          </div>
        </div>
      </el-header>

      <div class="login-illustration-left">
        <img loading="lazy" alt="robot" src="@/assets/login/login-person.png" />
      </div>

      <el-main style="position: relative;">
        <div class="login-box" @keyup.enter="login">
          <div class="card-avatar">
            <i class="el-icon-user"></i>
          </div>

          <h1 class="login-title">CHÀO MỪNG ĐẾN VỚI ĐĂNG NHẬP</h1>

          <div class="form-wrap">
            <template v-if="!isMobileLogin">
              <div class="input-row">
                <img loading="lazy" alt="" class="input-icon" src="@/assets/login/username.png" />
                <el-input v-model="form.username" class="input-field" :placeholder="$t('login.usernamePlaceholder')" />
              </div>
            </template>

            <template v-else>
              <div class="input-row">
                <el-select v-model="form.areaCode" class="area-code-select">
                  <el-option v-for="item in mobileAreaList" :key="item.key" :label="`${item.name} (${item.key})`" :value="item.key" />
                </el-select>
                <el-input v-model="form.mobile" class="input-field" :placeholder="$t('login.mobilePlaceholder')" />
              </div>
            </template>

            <div class="input-row">
              <img loading="lazy" alt="" class="input-icon" src="@/assets/login/password.png" />
              <el-input v-model="form.password" class="input-field" :placeholder="$t('login.passwordPlaceholder')" type="password" show-password />
            </div>

            <div class="input-row captcha-row">
              <img loading="lazy" alt="" class="input-icon" src="@/assets/login/shield.png" />
              <el-input v-model="form.captcha" class="input-field" :placeholder="$t('login.captchaPlaceholder')" />
              <div class="captcha-image" v-if="captchaUrl" @click="fetchCaptcha">
                <img :src="captchaUrl" alt="captcha" />
              </div>
            </div>

            <div class="links-row">
              <div v-if="allowUserRegister" class="link-item" @click="goToRegister">
                {{ $t("login.register") }}
              </div>
              <div class="link-item" v-if="enableMobileRegister" @click="goToForgetPassword">
                {{ $t("login.forgetPassword") }}
              </div>
            </div>

            <div class="login-btn" @click="login">
              {{ $t("login.login") }}
            </div>

            <div class="login-type-container" v-if="enableMobileRegister">
              <div style="display: flex; gap: 10px">
                <el-tooltip :content="$t('login.mobileLogin')" placement="bottom">
                  <el-button :type="isMobileLogin ? 'primary' : 'default'" icon="el-icon-mobile" circle @click="switchLoginType('mobile')"></el-button>
                </el-tooltip>
                <el-tooltip :content="$t('login.usernameLogin')" placement="bottom">
                  <el-button :type="!isMobileLogin ? 'primary' : 'default'" icon="el-icon-user" circle @click="switchLoginType('username')"></el-button>
                </el-tooltip>
              </div>
            </div>

            <div class="agreement-text">
              {{ $t("login.agreeTo") }}
              <div class="link-inline" @click="openPage('/user-agreement.html')">{{ $t("login.userAgreement") }}</div>
              {{ $t("login.and") }}
              <div class="link-inline" @click="openPage('/privacy-policy.html')">{{ $t("login.privacyPolicy") }}</div>
            </div>
          </div>
        </div>
      </el-main>

      <el-footer>
        <version-footer />
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import Api from "@/apis/api";
import VersionFooter from "@/components/VersionFooter.vue";
import { getUUID, goToPage, showDanger, showSuccess, sm2Encrypt, validateMobile } from "@/utils";
import { mapState } from "vuex";

export default {
  name: "login",
  components: {
    VersionFooter,
  },
  computed: {
    ...mapState({
      allowUserRegister: (state) => state.pubConfig.allowUserRegister,
      enableMobileRegister: (state) => state.pubConfig.enableMobileRegister,
      mobileAreaList: (state) => state.pubConfig.mobileAreaList,
      sm2PublicKey: (state) => state.pubConfig.sm2PublicKey,
    }),
  },
  data() {
    return {
      activeName: "username",
      form: {
        username: "",
        password: "",
        captcha: "",
        captchaId: "",
        areaCode: "+86",
        mobile: "",
      },
      captchaUuid: "",
      captchaUrl: "",
      isMobileLogin: false,
    };
  },
  mounted() {
    this.fetchCaptcha();
    this.$store.dispatch("fetchPubConfig").then(() => {
      this.isMobileLogin = this.enableMobileRegister;
    });
  },
  methods: {
    openPage(url) {
      const lang = this.$i18n ? this.$i18n.locale : 'zh_CN';
      if (!lang.startsWith('zh')) {
        url = url.replace('.html', '-en.html');
      }
      window.open(url, '_blank');
    },
    fetchCaptcha() {
      const token = localStorage.getItem('token')
      if (token) {
        if (this.$route.path !== "/home") {
          this.$router.push("/home");
        }
      } else {
        this.captchaUuid = getUUID();

        Api.user.getCaptcha(this.captchaUuid, (res) => {
          if (res.status === 200) {
            const blob = new Blob([res.data], { type: res.data.type });
            this.captchaUrl = URL.createObjectURL(blob);
          } else {
            showDanger("验证码加载失败，点击刷新");
          }
        });
      }
    },

    switchLoginType(type) {
      this.isMobileLogin = type === "mobile";
      this.form.username = "";
      this.form.mobile = "";
      this.form.password = "";
      this.form.captcha = "";
      this.fetchCaptcha();
    },

    validateInput(input, messageKey) {
      if (!input.trim()) {
        showDanger(this.$t(messageKey));
        return false;
      }
      return true;
    },

    getUserInfo() {
      Api.user.getUserInfo(({ data }) => {
        if (data.code === 0) {
          this.$store.commit("setUserInfo", data.data);
          goToPage("/home");
        } else {
          showDanger("用户信息获取失败");
        }
      });
    },

    async login() {
      if (this.isMobileLogin) {
        if (!validateMobile(this.form.mobile, this.form.areaCode)) {
          showDanger(this.$t('login.requiredMobile'));
          return;
        }
        this.form.username = this.form.areaCode + this.form.mobile;
      } else {
        if (!this.validateInput(this.form.username, 'login.requiredUsername')) {
          return;
        }
      }

      if (!this.validateInput(this.form.password, 'login.requiredPassword')) {
        return;
      }
      if (!this.validateInput(this.form.captcha, 'login.requiredCaptcha')) {
        return;
      }
      let encryptedPassword;
      try {
        const captchaAndPassword = this.form.captcha + this.form.password;
        encryptedPassword = sm2Encrypt(this.sm2PublicKey, captchaAndPassword);
      } catch (error) {
        console.error("密码加密失败:", error);
        showDanger(this.$t('sm2.encryptionFailed'));
        return;
      }

      const plainUsername = this.form.username;
      this.form.captchaId = this.captchaUuid;

      const loginData = {
        username: plainUsername,
        password: encryptedPassword,
        captchaId: this.form.captchaId
      };

      Api.user.login(
        loginData,
        ({ data }) => {
          showSuccess(this.$t('login.loginSuccess'));
          this.$store.commit("setToken", JSON.stringify(data.data));
          this.getUserInfo();
        },
        (err) => {
          let errorMessage = err.data.msg || "登录失败";
          showDanger(errorMessage);
        }
      );

      setTimeout(() => {
        this.fetchCaptcha();
      }, 1000);
    },

    goToRegister() {
      goToPage("/register");
    },
    goToForgetPassword() {
      goToPage("/retrieve-password");
    }
  },
};
</script>

<style lang="scss" scoped>
@import "./auth.scss";

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  height: 76px;
  padding: 12px 28px;
  box-sizing: border-box;
}

.auth-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.auth-logo {
  width: 46px;
  height: 46px;
}

.auth-brand {
  font-weight: 700;
  font-size: 20px;
  color: #0f2a44;
}

.auth-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 91, 189, 0.06);
  padding: 6px 10px;
  border-radius: 18px;
}
.theme-toggle .sun-icon { color: #105bbd; font-size: 16px; }
.theme-toggle .toggle-knob {
  width: 36px;
  height: 18px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(16,91,189,0.06);
}

.login-illustration-left {
  position: absolute;
  top: 120px;
  left: 6%;
  width: 420px;
  pointer-events: none;
  opacity: 0.95;
}
.login-illustration-left img { width: 100%; }

.card-avatar {
  width: 56px;
  height: 56px;
  margin: 8px auto 14px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16,91,189,0.06);
  color: #105bbd;
  border-radius: 50%;
  font-size: 22px;
}

.login-title {
  text-align: center;
  font-weight: 700;
  font-size: 22px;
  color: #2b3a4f;
  letter-spacing: -0.02em;
  margin: 0 0 18px 0;
}

.form-wrap {
  padding: 0 28px 28px 28px;
}

.links-row {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: #5778ff;
  font-weight: 400;
}
.link-item { cursor: pointer; }

.agreement-text {
  margin-top: 14px;
  color: #9aa3b6;
  font-size: 13px;
  text-align: center;
  line-height: 1.4;
}
.link-inline {
  color: #5778ff;
  cursor: pointer;
  display: inline-block;
  margin: 0 6px;
}

.login-type-container { margin-top: 12px; display:flex; justify-content:center; }

.login-btn {
  margin: 16px auto 8px auto;
  width: 70%;
  height: 44px;
  line-height: 44px;
  border-radius: 22px;
  text-align: center;
  color: #fff;
  font-weight: 600;
  background: linear-gradient(135deg, #105bbd 0%, #6299ff 100%);
  box-shadow: 0 20px 40px -16px rgba(16,91,189,0.12);
  cursor: pointer;
}

@media (max-width: 1200px) {
  .login-box { right: 6% !important; width: 420px !important; }
  .login-illustration-left { display: none; }
}
</style>
