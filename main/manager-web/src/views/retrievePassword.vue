<template>
  <div class="welcome login-scene" @keyup.enter="retrievePassword">
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
        <img loading="lazy" src="@/assets/login/hi.png" alt="mascot" />
      </div>
      <div class="mascot mascot-left">
        <img loading="lazy" src="@/assets/login/hi.png" alt="mascot" />
      </div>
      <div class="mascot mascot-bottom-right">
        <img loading="lazy" src="@/assets/login/hi.png" alt="mascot" />
      </div>

      <el-main class="auth-main">
        <div class="glass-stage">
          <div class="glass-card" role="form" aria-label="Retrieve password form">
            <div class="card-top-icon">
              <i class="el-icon-lock"></i>
            </div>

            <h1 class="glass-title">KHÔI PHỤC MẬT KHẨU</h1>

            <div class="glass-form retrieve-form-shell">
              <form @submit.prevent="retrievePassword">
                <div class="mobile-row restore-mobile-row">
                  <div class="input-box input-box-soft area-code-box">
                    <el-select v-model="form.areaCode" class="area-code-select" filterable default-first-option :placeholder="'Mã vùng'">
                      <el-option v-for="item in mobileAreaList" :key="item.key" :label="formatAreaLabel(item)" :value="item.key" />
                    </el-select>
                  </div>
                  <div class="input-box input-box-soft mobile-input-box">
                    <img loading="lazy" alt="phone" class="input-icon" src="@/assets/login/phone.png" />
                    <el-input v-model="form.mobile" :placeholder="$t('retrievePassword.mobilePlaceholder')" class="transparent-input" />
                  </div>
                </div>

                <div class="captcha-shell">
                  <div class="input-box input-box-soft captcha-input-box">
                    <img loading="lazy" alt="shield" class="input-icon" src="@/assets/login/shield.png" />
                    <el-input v-model="form.captcha" :placeholder="$t('retrievePassword.captchaPlaceholder')" class="transparent-input" />
                  </div>
                  <div class="captcha-image" v-if="captchaUrl" @click="fetchCaptcha">
                    <img :src="captchaUrl" alt="captcha" />
                  </div>
                </div>

                <div class="captcha-shell sms-shell">
                  <div class="input-box input-box-soft captcha-input-box">
                    <img loading="lazy" alt="phone" class="input-icon" src="@/assets/login/phone.png" />
                    <el-input v-model="form.mobileCaptcha" :placeholder="$t('retrievePassword.mobileCaptchaPlaceholder')" class="transparent-input" maxlength="6" />
                  </div>
                  <el-button type="primary" class="send-captcha-btn" :disabled="!canSendMobileCaptcha" @click="sendMobileCaptcha">
                    <span>{{ countdown > 0 ? `${countdown}${$t('register.secondsLater')}` : $t('retrievePassword.getMobileCaptcha') }}</span>
                  </el-button>
                </div>

                <div class="input-box input-box-soft">
                  <img loading="lazy" alt="password" class="input-icon" src="@/assets/login/password.png" />
                  <el-input v-model="form.newPassword" :placeholder="$t('retrievePassword.newPasswordPlaceholder')" type="password" show-password class="transparent-input" />
                </div>

                <div class="input-box input-box-soft">
                  <img loading="lazy" alt="password" class="input-icon" src="@/assets/login/password.png" />
                  <el-input v-model="form.confirmPassword" :placeholder="$t('retrievePassword.confirmNewPasswordPlaceholder')" type="password" show-password class="transparent-input" />
                </div>

                <div class="links-row single-link-row">
                  <div class="link-item" @click="goToLogin">{{ $t('retrievePassword.goToLogin') }}</div>
                </div>
              </form>

              <div class="login-btn" @click="retrievePassword">{{ $t('retrievePassword.resetButton') }}</div>

              <div class="agreement-text">
                <div class="agreement-line">
                  <span>{{ $t('retrievePassword.agreeTo') }} </span>
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
import { getUUID, goToPage, showDanger, showSuccess, validateMobile, sm2Encrypt } from '@/utils';
import { mapState } from 'vuex';

export default {
  name: 'retrieve',
  components: { VersionFooter },
  computed: {
    ...mapState({
      allowUserRegister: state => state.pubConfig.allowUserRegister,
      mobileAreaList: state => state.pubConfig.mobileAreaList,
      sm2PublicKey: state => state.pubConfig.sm2PublicKey
    }),
    canSendMobileCaptcha() {
      return this.countdown === 0 && validateMobile(this.form.mobile, this.form.areaCode);
    }
  },
  data() {
    return {
      form: {
        areaCode: '+84',
        mobile: '',
        captcha: '',
        captchaId: '',
        mobileCaptcha: '',
        newPassword: '',
        confirmPassword: ''
      },
      captchaUrl: '',
      countdown: 0,
      timer: null
    }
  },
  mounted() {
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
        '+86': 'China Mainland',
        '+852': 'Hong Kong',
        '+853': 'Macau',
        '+886': 'Taiwan',
        '+1': 'USA/Canada',
        '+44': 'United Kingdom',
        '+33': 'France',
        '+39': 'Italy',
        '+49': 'Germany',
        '+48': 'Poland',
        '+41': 'Switzerland',
        '+34': 'Spain',
        '+45': 'Denmark',
        '+60': 'Malaysia',
        '+61': 'Australia',
        '+62': 'Indonesia',
        '+63': 'Philippines',
        '+64': 'New Zealand',
        '+65': 'Singapore',
        '+66': 'Thailand',
        '+81': 'Japan',
        '+82': 'South Korea',
        '+84': 'Vietnam',
        '+91': 'India',
        '+92': 'Pakistan',
        '+234': 'Nigeria',
        '+880': 'Bangladesh',
        '+966': 'Saudi Arabia',
        '+971': 'UAE',
        '+55': 'Brazil',
        '+52': 'Mexico',
        '+56': 'Chile',
        '+54': 'Argentina',
        '+20': 'Egypt',
        '+27': 'South Africa',
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
        showDanger(this.$t('retrievePassword.inputCorrectMobile'));
        return;
      }
      if (!this.validateInput(this.form.captcha, this.$t('retrievePassword.captchaRequired'))) {
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
        showSuccess(this.$t('retrievePassword.captchaSendSuccess'));
      }, (err) => {
        showDanger(err.data.msg || this.$t('register.captchaSendFailed'));
        this.countdown = 0;
        this.fetchCaptcha();
      });
    },
    retrievePassword() {
      if (!validateMobile(this.form.mobile, this.form.areaCode)) {
        showDanger(this.$t('retrievePassword.inputCorrectMobile'));
        return;
      }
      if (!this.form.captcha) {
        showDanger(this.$t('retrievePassword.captchaRequired'));
        return;
      }
      if (!this.form.mobileCaptcha) {
        showDanger(this.$t('retrievePassword.mobileCaptchaRequired'));
        return;
      }
      if (this.form.newPassword !== this.form.confirmPassword) {
        showDanger(this.$t('retrievePassword.passwordsNotMatch'));
        return;
      }
      let encryptedPassword;
      try {
        const captchaAndPassword = this.form.captcha + this.form.newPassword;
        encryptedPassword = sm2Encrypt(this.sm2PublicKey, captchaAndPassword);
      } catch (error) {
        console.error('密码加密失败:', error);
        showDanger(this.$t('sm2.encryptionFailed'));
        return;
      }
      Api.user.retrievePassword({
        phone: this.form.areaCode + this.form.mobile,
        password: encryptedPassword,
        code: this.form.mobileCaptcha,
        captchaId: this.form.captchaId
      }, () => {
        showSuccess(this.$t('retrievePassword.passwordUpdateSuccess'));
        goToPage('/login');
      }, (err) => {
        showDanger(err.data.msg || this.$t('message.error'));
        if (err.data != null && err.data.msg != null && (err.data.msg.indexOf('图形验证码') > -1 || err.data.msg.indexOf('Captcha') > -1)) {
          this.fetchCaptcha()
        }
      });
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

.retrieve-form-shell {
  .login-btn {
    margin-top: 16px;
  }
}

.restore-mobile-row {
  margin-top: 0;
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
