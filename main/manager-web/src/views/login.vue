<template>
  <div class="welcome login-scene">
    <el-container style="height: 100%">
      <el-header class="auth-header">
        <div class="auth-brand-wrap">
          <img loading="lazy" alt="" src="@/assets/xiaozhi-logo.png" class="auth-logo" />
          <div class="auth-brand-copy">
            <div class="auth-brand-title">DeskBot Console</div>
            <div class="auth-brand-subtitle">Digital concierge for your AI operations</div>
          </div>
        </div>

        <el-dropdown trigger="click" class="title-language-dropdown" @visible-change="handleLanguageDropdownVisibleChange">
          <span class="language-pill">
            <span class="current-language-text">{{ currentLanguageText }}</span>
            <i class="el-icon-arrow-down el-icon--right" :class="{ 'rotate-down': languageDropdownVisible }"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="changeLanguage('zh_CN')">{{ $t("language.zhCN") }}</el-dropdown-item>
            <el-dropdown-item @click.native="changeLanguage('zh_TW')">{{ $t("language.zhTW") }}</el-dropdown-item>
            <el-dropdown-item @click.native="changeLanguage('en')">{{ $t("language.en") }}</el-dropdown-item>
            <el-dropdown-item @click.native="changeLanguage('de')">{{ $t("language.de") }}</el-dropdown-item>
            <el-dropdown-item @click.native="changeLanguage('vi')">{{ $t("language.vi") }}</el-dropdown-item>
            <el-dropdown-item @click.native="changeLanguage('pt_BR')">{{ $t("language.ptBR") }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <div class="scene-orb orb-left"></div>
      <div class="scene-orb orb-right"></div>
      <div class="scene-orb orb-bottom"></div>

      <div class="login-person hero-illustration">
        <img loading="lazy" alt="" src="@/assets/login/login-person.png" class="hero-illustration-image" />
      </div>

      <el-main class="auth-main">
        <div class="login-box" @keyup.enter="login">
          <div class="card-avatar">
            <img loading="lazy" alt="" src="@/assets/login/hi.png" class="card-avatar-image" />
          </div>

          <div class="title-stack">
            <div class="eyebrow">DeskBot Access</div>
            <div class="login-text">Chào mừng đến với đăng nhập</div>
            <div class="login-welcome">Truy cập DeskBot Console để quản lý thiết bị, tác vụ và các luồng AI với trải nghiệm gọn, sạch và tập trung.</div>
          </div>

          <div class="form-wrap">
            <template v-if="!isMobileLogin">
              <div class="input-box input-box-soft">
                <img loading="lazy" alt="" class="input-icon" src="@/assets/login/username.png" />
                <el-input v-model="form.username" :placeholder="$t('login.usernamePlaceholder')" />
              </div>
            </template>

            <template v-else>
              <div class="mobile-row">
                <div class="input-box input-box-soft area-code-box">
                  <el-select v-model="form.areaCode" class="area-code-select">
                    <el-option v-for="item in mobileAreaList" :key="item.key" :label="`${item.name} (${item.key})`" :value="item.key" />
                  </el-select>
                </div>
                <div class="input-box input-box-soft mobile-input-box">
                  <img loading="lazy" alt="" class="input-icon" src="@/assets/login/phone.png" />
                  <el-input v-model="form.mobile" :placeholder="$t('login.mobilePlaceholder')" />
                </div>
              </div>
            </template>

            <div class="input-box input-box-soft">
              <img loading="lazy" alt="" class="input-icon" src="@/assets/login/password.png" />
              <el-input v-model="form.password" :placeholder="$t('login.passwordPlaceholder')" type="password" show-password />
            </div>

            <div class="captcha-shell">
              <div class="input-box input-box-soft captcha-input-box">
                <img loading="lazy" alt="" class="input-icon" src="@/assets/login/shield.png" />
                <el-input v-model="form.captcha" :placeholder="$t('login.captchaPlaceholder')" />
              </div>
              <div class="captcha-image" v-if="captchaUrl" @click="fetchCaptcha">
                <img :src="captchaUrl" alt="captcha" />
              </div>
            </div>

            <div class="links-row">
              <div class="link-item" @click="goToRegister">
                {{ $t("login.register") }}
              </div>
              <div class="link-item" @click="goToForgetPassword">
                {{ $t("login.forgetPassword") }}
              </div>
            </div>

            <div class="login-btn" @click="login">
              {{ $t("login.login") }}
            </div>

            <div class="login-type-container" v-if="enableMobileRegister">
              <div class="login-type-buttons">
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
import i18n, { changeLanguage } from "@/i18n";
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
    currentLanguage() {
      return i18n.locale || "zh_CN";
    },
    currentLanguageText() {
      const currentLang = this.currentLanguage;
      switch (currentLang) {
        case "zh_CN":
          return this.$t("language.zhCN");
        case "zh_TW":
          return this.$t("language.zhTW");
        case "en":
          return this.$t("language.en");
        case "de":
          return this.$t("language.de");
        case "vi":
          return this.$t("language.vi");
        case "pt_BR":
          return this.$t("language.ptBR");
        default:
          return this.$t("language.zhCN");
      }
    },
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
      languageDropdownVisible: false,
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
    handleLanguageDropdownVisibleChange(visible) {
      this.languageDropdownVisible = visible;
    },
    changeLanguage(lang) {
      changeLanguage(lang);
      this.languageDropdownVisible = false;
      this.$message.success({
        message: this.$t("message.success"),
        showClose: true,
      });
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
</style>
