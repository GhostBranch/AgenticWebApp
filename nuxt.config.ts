// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    todoistApiKey: process.env.TODOIST_API_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    public: {
      // Public runtime config
    }
  },
  devtools: { enabled: true },
  devServer: {
    port: 3000
  }
})
