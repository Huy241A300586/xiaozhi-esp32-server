import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Language = 'vi'

export interface LangStore {
  currentLang: Language
  changeLang: (lang: Language) => void
}

export const useLangStore = defineStore(
  'lang',
  (): LangStore => {
    const currentLang = ref<Language>('vi')

    const changeLang = (_lang: Language) => {
      currentLang.value = 'vi'
      uni.setStorageSync('app_language', 'vi')
    }

    return {
      currentLang,
      changeLang,
    }
  },
  {
    persist: {
      key: 'lang',
      serializer: {
        serialize: state => JSON.stringify('vi'),
        deserialize: _value => ({ currentLang: 'vi' }),
      },
    },
  },
)
