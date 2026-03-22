import Vue from 'vue';
import VueI18n from 'vue-i18n';
import vi from './vi';

Vue.use(VueI18n);

const DEFAULT_LANGUAGE = 'vi';

const i18n = new VueI18n({
  locale: DEFAULT_LANGUAGE,
  fallbackLocale: DEFAULT_LANGUAGE,
  messages: {
    vi
  }
});

localStorage.setItem('userLanguage', DEFAULT_LANGUAGE);

authorityChangeLanguage(DEFAULT_LANGUAGE);

export default i18n;

function authorityChangeLanguage(lang) {
  Vue.prototype.$eventBus && Vue.prototype.$eventBus.$emit('languageChanged', lang);
}

export const changeLanguage = () => {
  i18n.locale = DEFAULT_LANGUAGE;
  localStorage.setItem('userLanguage', DEFAULT_LANGUAGE);
  authorityChangeLanguage(DEFAULT_LANGUAGE);
};
