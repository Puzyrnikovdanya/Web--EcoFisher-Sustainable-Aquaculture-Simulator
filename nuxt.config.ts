const appBaseURL = process.env.NUXT_APP_BASE_URL || '/'
const assetPath = (path: string) => `${appBaseURL.replace(/\/$/, '')}${path}`

export default defineNuxtConfig({
  compatibilityDate: '2024-08-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  vite: {
    devBundler: 'legacy'
  },
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: appBaseURL,
    head: {
      htmlAttrs: {
        lang: 'ru'
      },
      title: 'EcoFisher',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: assetPath('/favicon.svg') }
      ],
      meta: [
        {
          name: 'description',
          content: 'Учебный симулятор аквакультуры для изучения экологической и экономической динамики.'
        }
      ]
    }
  }
})
