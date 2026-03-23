import { ref } from 'vue'
import { useLangStore } from '@/store/lang'
import type { Language } from '@/store/lang'
import vi from './vi'

const messages = {
  vi,
}

const currentLang = ref<Language>('vi')

export function initI18n() {
  const langStore = useLangStore()
  currentLang.value = langStore.currentLang || 'vi'
}

export function changeLanguage(lang: Language = 'vi') {
  currentLang.value = 'vi'
  const langStore = useLangStore()
  langStore.changeLang('vi')
}

export function t(key: string, params?: Record<string, string | number>): string {
  const langMessages = messages[currentLang.value] || messages.vi
  if (langMessages && typeof langMessages === 'object' && key in langMessages) {
    let value = langMessages[key]
    if (typeof value === 'string') {
      if (params) {
        let result = value
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const regex = new RegExp(`\{${paramKey}\}`, 'g')
          result = result.replace(regex, String(paramValue))
        })
        return result
      }
      return value
    }
    return key
  }
  return key
}

export function getCurrentLanguage(): Language {
  return 'vi'
}

export function getSupportedLanguages(): { code: Language, name: string }[] {
  return [
    { code: 'vi', name: 'Tiếng Việt' },
  ]
}
