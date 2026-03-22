<template>
 <div class="welcome login-scene">
 <el-container style="height: 100%">
 <!-- Header with brand and language pill (keeps existing behavior) -->
 <el-header class="auth-header">
 <div class="auth-brand-wrap">
 <img loading="lazy" alt="" src="@/assets/login/deskbot-robot-upload.png" class="auth-logo" />
 <div class="auth-brand-copy">
 <div class="auth-brand-title">DeskBot Console</div>
 </div>
 </div>

 <div class="header-actions"></div>
 </el-header>

 <!-- Decorative orbs for atmospheric depth (keeps background approach) -->
 <div class="scene-orb orb-left"></div>
 <div class="scene-orb orb-right"></div>

 <!-- Mascots around the card (illustrative) -->
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
 <!-- Centered glass card that matches the mockup -->
 <div class="glass-stage">
 <div class="glass-card" @keyup.enter="login" role="form" aria-label="Login form">
 <!-- subtle user icon above card (circular) -->
 <div class="card-top-icon">
 <i class="el-icon-user"></i>
 </div>

 <!-- Hero heading (uses explicit copy to match the mockup feel) -->
 <h1 class="glass-title">CHÀO MỪNG ĐẾN VỚI ĐĂNG NHẬP</h1>

 <!-- Form area -->
 <div class="glass-form">
 <!-- username or mobile -->
 <div v-if="!isMobileLogin" class="input-box input-box-soft">
 <img loading="lazy" alt="user" class="input-icon" src="@/assets/login/username.png" />
 <el-input
 v-model="form.username"
 :placeholder="$t('login.usernamePlaceholder')"
 class="transparent-input"
 />
 </div>

 <div v-else class="mobile-row">
 <div class="input-box input-box-soft area-code-box">
 <el-select v-model="form.areaCode" class="area-code-select" filterable default-first-option :placeholder="'Mã vùng'">
 <el-option
 v-for="item in mobileAreaList"
 :key="item.key"
 :label="`${item.name} (${item.key})`"
 :value="item.key"
 />
 </el-select>
 </div>
 <div class="input-box input-box-soft mobile-input-box">
 <img loading="lazy" alt="phone" class="input-icon" src="@/assets/login/phone.png" />
 <el-input v-model="form.mobile" :placeholder="$t('login.mobilePlaceholder')" class="transparent-input" />
 </div>
 </div>

 <!-- password -->
 <div class="input-box input-box-soft">
 <img loading="lazy" alt="password" class="input-icon" src="@/assets/login/password.png" />
 <el-input
 v-model="form.password"
 :placeholder="$t('login.passwordPlaceholder')"
 type="password"
 show-password
 class="transparent-input"
 />
 </div>

 <!-- captcha row -->
 <div class="captcha-shell">
 <div class="input-box input-box-soft captcha-input-box">
 <img loading="lazy" alt="shield" class="input-icon" src="@/assets/login/shield.png" />
 <el-input v-model="form.captcha" :placeholder="$t('login.captchaPlaceholder')" class="transparent-input" />
 </div>
 <div class="captcha-image" v-if="captchaUrl" @click="fetchCaptcha" role="button" aria-label="Refresh captcha">
 <img :src="captchaUrl" alt="captcha" />
 </div>
 </div>

 <!-- links -->
 <div class="links-row">
 <div class="link-item" @click="goToRegister">{{ $t("login.register") }}</div>
 <div class="link-item" @click="goToForgetPassword">{{ $t("login.forgetPassword") }}</div>
 </div>

 <!-- login button -->
 <div class="login-btn" @click="login" role="button" aria-label="Login">
 {{ $t("login.login") }}
 </div>

 <!-- small login type toggles (username vs mobile) -->
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

 <!-- agreement text -->
 <div class="agreement-text">
 <div class="agreement-line">
 <span>Đăng nhập có nghĩa là chấp nhận </span>
 <span class="link-inline" @click="openPage('/user-agreement.html')">Thỏa thuận người dùng</span>
 </div>
 <div class="agreement-line">
 <span>và </span>
 <span class="link-inline" @click="openPage('/privacy-policy.html')">Chính sách bảo mật</span>
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
import Api from "@/apis/api";
import VersionFooter from "@/components/VersionFooter.vue";
import i18n from "@/i18n";
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
 return "vi";
 },
 currentLanguageText() {
 return this.$t("language.vi");
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
 areaCode: "+84",
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
</style>
