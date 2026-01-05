import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import sv from './locales/sv.json'

// Get browser language or default to English
// const browserLang = navigator.language.split('-')[0]
// const defaultLocale = ['en', 'sv'].includes(browserLang) ? browserLang : 'en'
// For now, hardcode default to 'en' as per request, user can switch in settings.

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem('user-locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    sv
  }
})

export default i18n
