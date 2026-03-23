<template>
  <div class="welcome login-scene" @keyup.enter="register">
    <el-container style="height: 100%">
      <el-header class="auth-header">
        <div class="auth-brand-wrap">
          <img loading="lazy" alt="" src="@/assets/login/deskbot-robot-upload.png" class="auth-logo" />
          <div class="auth-brand-copy">
            <div class="auth-brand-title">DeskBot Console</div>
          </div>
        </div>
        <div class="header-actions"></div>
      </el-header>

      <div class="scene-orb orb-left"></div>
      <div class="scene-orb orb-right"></div>
      <div class="mascot mascot-top-right">
        <img loading="lazy" src="@/assets/login/hi.png" alt="linh vật" />
      </div>
      <div class="mascot mascot-left">
        <img loading="lazy" src="@/assets/login/hi.png" alt="linh vật" />
      </div>
      <div class="mascot mascot-bottom-right">
        <img loading="lazy" src="@/assets/login/hi.png" alt="linh vật" />
      </div>

      <el-main class="auth-main">
        <div class="glass-stage">
          <div class="glass-card" role="form" aria-label="Biểu mẫu đăng ký">
            <div class="card-top-icon">
              <i class="el-icon-user"></i>
            </div>

            <h1 class="glass-title">ĐĂNG KÝ TÀI KHOẢN</h1>

            <div class="glass-form register-form-shell">
              <form @submit.prevent="register">
                <div v-if="!enableMobileRegister" class="input-box input-box-soft">
                  <img loading="lazy" alt="người dùng" class="input-icon" src="@/assets/login/username.png" />
                  <el-input v-model="form.username" :placeholder="$t('register.usernamePlaceholder')" class="transparent-input" />
                </div>

                <template v-if="enableMobileRegister">
                  <div class="mobile-row">
                    <div class="input-box input-box-soft area-code-box">
                      <el-select v-model="form.areaCode" class="area-code-select" filterable default-first-option :placeholder="'Mã vùng'">
                        <el-option v-for="item in mobileAreaList" :key="item.key" :label="formatAreaLabel(item)" :value="item.key" />
                      </el-select>
                    </div>
                    <div class="input-box input-box-soft mobile-input-box">
                      <img loading="lazy" alt="điện thoại" class="input-icon" src="@/assets/login/phone.png" />
                      <el-input v-model="form.mobile" :placeholder="$t('register.mobilePlaceholder')" class="transparent-input" />
                    </div>
                  </div>

                  <div class="captcha-shell">
                    <div class="input-box input-box-soft captcha-input-box">
                      <img loading="lazy" alt="bảo mật" class="input-icon" src="@/assets/login/shield.png" />
                      <el-input v-model="form.captcha" :placeholder="$t('register.captchaPlaceholder')" class="transparent-input" />
                    </div>
                    <div class="captcha-image" v-if="captchaUrl" @click="fetchCaptcha">
                      <img :src="captchaUrl" alt="mã xác minh" />
                    </div>
                  </div>

                  <div class="captcha-shell sms-shell">
                    <div class="input-box input-box-soft captcha-input-box">
                      <img loading="lazy" alt="điện thoại" class="input-icon" src="@/assets/login/phone.png" />
                      <el-input v-model="form.mobileCaptcha" :placeholder="$t('register.mobileCaptchaPlaceholder')" class="transparent-input" maxlength="6" />
                    </div>
                    <el-button type="primary" class="send-captcha-btn" :disabled="!canSendMobileCaptcha" @click="sendMobileCaptcha">
                      <span>{{ countdown > 0 ? `${countdown}${$t('register.secondsLater')}` : $t('register.sendCaptcha') }}</span>
                    </el-button>
                  </div>
                </template>

                <div class="input-box input-box-soft">
                  <img loading="lazy" alt="mật khẩu" class="input-icon" src="@/assets/login/password.png" />
                  <el-input v-model="form.password" :placeholder="$t('register.passwordPlaceholder')" type="password" show-password class="transparent-input" />
                </div>

                <div class="input-box input-box-soft">
                  <img loading="lazy" alt="mật khẩu" class="input-icon" src="@/assets/login/password.png" />
                  <el-input v-model="form.confirmPassword" :placeholder="$t('register.confirmPasswordPlaceholder')" type="password" show-password class="transparent-input" />
                </div>

                <div v-if="!enableMobileRegister" class="captcha-shell">
                  <div class="input-box input-box-soft captcha-input-box">
                    <img loading="lazy" alt="bảo mật" class="input-icon" src="@/assets/login/shield.png" />
                    <el-input v-model="form.captcha" :placeholder="$t('register.captchaPlaceholder')" class="transparent-input" />
                  </div>
                  <div class="captcha-image" v-if="captchaUrl" @click="fetchCaptcha">
                    <img :src="captchaUrl" alt="mã xác minh" />
                  </div>
                </div>

                <div class="links-row single-link-row">
                  <div class="link-item" @click="goToLogin">{{ $t('register.goToLogin') }}</div>
                </div>
              </form>

              <div class="login-btn" @click="register">{{ $t('register.registerButton') }}</div>

              <div class="agreement-text">
                <div class="agreement-line">
                  <span>{{ $t('register.agreeTo') }} </span>
                  <span class="link-inline" @click="openPage('/user-agreement.html')">{{ $t('register.userAgreement') }}</span>
                </div>
                <div class="agreement-line">
                  <span>{{ $t('login.and') }} </span>
                  <span class="link-inline" @click="openPage('/privacy-policy.html')">{{ $t('register.privacyPolicy') }}</span>
                </div>
              </div>
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
import Api from '@/apis/api';
import VersionFooter from '@/components/VersionFooter.vue';
import { getUUID, goToPage, showDanger, showSuccess, sm2Encrypt, validateMobile } from '@/utils';
import { mapState } from 'vuex';

export default {
  name: 'register',
  components: { VersionFooter },
  computed: {
    ...mapState({
      allowUserRegister: state => state.pubConfig.allowUserRegister,
      enableMobileRegister: state => state.pubConfig.enableMobileRegister,
      mobileAreaList: state => state.pubConfig.mobileAreaList,
      sm2PublicKey: state => state.pubConfig.sm2PublicKey,
    }),
    canSendMobileCaptcha() {
      return this.countdown === 0 && validateMobile(this.form.mobile, this.form.areaCode);
    }
  },
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        captcha: '',
        captchaId: '',
        areaCode: '+84',
        mobile: '',
        mobileCaptcha: ''
      },
      captchaUrl: '',
      countdown: 0,
      timer: null,
    }
  },
  mounted() {
    this.$store.dispatch('fetchPubConfig').then(() => {
      if (!this.allowUserRegister) {
        showDanger(this.$t('register.notAllowRegister'));
        setTimeout(() => {
          goToPage('/login');
        }, 1500);
      }
    });
    this.fetchCaptcha();
  },
  methods: {
    openPage(url) {
      window.open(url, '_blank');
    },
    fetchCaptcha() {
      this.form.captchaId = getUUID();
      Api.user.getCaptcha(this.form.captchaId, (res) => {
        if (res.status === 200) {
          const blob = new Blob([res.data], { type: res.data.type });
          this.captchaUrl = URL.createObjectURL(blob);
        } else {
          showDanger(this.$t('register.captchaLoadFailed'));
        }
      });
    },
    formatAreaLabel(item) {
      const areaNameMap = {
        '+86': 'Trung Quốc đại lục',
        '+852': 'Hồng Kông',
        '+853': 'Ma Cao',
        '+886': 'Đài Loan',
        '+1': 'Mỹ/Canada',
        '+44': 'Vương quốc Anh',
        '+33': 'Pháp',
        '+39': 'Ý',
        '+49': 'Đức',
        '+48': 'Ba Lan',
        '+41': 'Thụy Sĩ',
        '+34': 'Tây Ban Nha',
        '+45': 'Denmark',
        '+60': 'Malaysia',
        '+61': 'Úc',
        '+62': 'Indonesia',
        '+63': 'Philippines',
        '+64': 'New Zealand',
        '+65': 'Singapore',
        '+66': 'Thái Lan',
        '+81': 'Nhật Bản',
        '+82': 'Hàn Quốc',
        '+84': 'Việt Nam',
        '+91': 'Ấn Độ',
        '+92': 'Pakistan',
        '+234': 'Nigeria',
        '+880': 'Bangladesh',
        '+966': 'Ả Rập Xê Út',
        '+971': 'UAE',
        '+55': 'Brazil',
        '+52': 'Mexico',
        '+56': 'Chile',
        '+54': 'Argentina',
        '+20': 'Ai Cập',
        '+27': 'Nam Phi',
        '+254': 'Kenya',
        '+255': 'Tanzania',
        '+7': 'Kazakhstan'
      };
      return `${areaNameMap[item.key] || item.name} (${item.key})`;
    },
    validateInput(input, message) {
      if (!input.trim()) {
        showDanger(message);
        return false;
      }
      return true;
    },
    sendMobileCaptcha() {
      if (!validateMobile(this.form.mobile, this.form.areaCode)) {
        showDanger(this.$t('register.inputCorrectMobile'));
        return;
      }
      if (!this.validateInput(this.form.captcha, this.$t('register.inputCaptcha'))) {
        this.fetchCaptcha();
        return;
      }
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.countdown = 60;
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1000);

      Api.user.sendSmsVerification({
        phone: this.form.areaCode + this.form.mobile,
        captcha: this.form.captcha,
        captchaId: this.form.captchaId
      }, () => {
        showSuccess(this.$t('register.captchaSendSuccess'));
      }, (err) => {
        showDanger(err.data.msg || this.$t('register.captchaSendFailed'));
        this.countdown = 0;
        this.fetchCaptcha();
      });
    },
    async register() {
      if (this.enableMobileRegister) {
        if (!validateMobile(this.form.mobile, this.form.areaCode)) {
          showDanger(this.$t('register.inputCorrectMobile'));
          return;
        }
        if (!this.form.mobileCaptcha) {
          showDanger(this.$t('register.requiredMobileCaptcha'));
          return;
        }
      } else {
        if (!this.validateInput(this.form.username, this.$t('register.requiredUsername'))) {
          return;
        }
      }
      if (!this.validateInput(this.form.password, this.$t('register.requiredPassword'))) {
        return;
      }
      if (this.form.password !== this.form.confirmPassword) {
        showDanger(this.$t('register.passwordsNotMatch'));
        return;
      }
      if (!this.validateInput(this.form.captcha, this.$t('register.requiredCaptcha'))) {
        return;
      }
      let encryptedPassword;
      try {
        const captchaAndPassword = this.form.captcha + this.form.password;
        encryptedPassword = sm2Encrypt(this.sm2PublicKey, captchaAndPassword);
      } catch (error) {
        console.error('Mã hóa mật khẩu thất bại:', error);
        showDanger(this.$t('sm2.encryptionFailed'));
        return;
      }
      const plainUsername = this.enableMobileRegister ? this.form.areaCode + this.form.mobile : this.form.username;
      const registerData = {
        username: plainUsername,
        password: encryptedPassword,
        captchaId: this.form.captchaId,
        mobileCaptcha: this.form.mobileCaptcha
      };
      Api.user.register(registerData, () => {
        showSuccess(this.$t('register.registerSuccess'));
        goToPage('/login');
      }, (err) => {
        showDanger(err.data.msg || this.$t('register.registerFailed'));
        if (err.data != null && err.data.msg != null && err.data.msg.indexOf('Mã xác minh hình ảnh') > -1) {
          this.fetchCaptcha();
        }
      })
    },
    goToLogin() {
      goToPage('/login')
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
</script>

<style lang="scss" scoped>
@import './auth.scss';

.register-form-shell {
  .login-btn {
    margin-top: 16px;
  }
}

.single-link-row {
  gap: 0;
}

.sms-shell .send-captcha-btn {
  width: 156px;
  height: 56px;
  border-radius: 12px;
  font-size: 13px;
  background: linear-gradient(135deg, var(--auth-primary) 0%, var(--auth-primary-container) 100%);
  border: none;
  padding: 0 12px;
  box-shadow: 0 18px 32px -22px rgba(16, 91, 189, 0.18);

  &:disabled {
    background: #c0c4cc;
    cursor: not-allowed;
    box-shadow: none;
  }
}
</style>
