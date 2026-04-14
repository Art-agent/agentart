import tailwindcss from "@tailwindcss/vite";


export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@lucide/vue',
      ]
    },
  },
  
  runtimeConfig: {
    auth0: {
      domain: process.env.NUXT_AUTH0_DOMAIN,
      clientId: process.env.NUXT_AUTH0_CLIENT_ID,
      clientSecret: process.env.NUXT_AUTH0_CLIENT_SECRET,
      sessionSecret: process.env.NUXT_AUTH0_SESSION_SECRET,
      appBaseUrl: process.env.NUXT_AUTH0_APP_BASE_URL,
    },
  },
  
  site: {
    url: 'https://art-agent.xyz',
    name: 'Agentart'
  },
  
  fonts: {
    defaults: {
      weights: ['100 900'],
    },
  },
  
  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@auth0/auth0-nuxt',
    '@pinia/nuxt'
  ]
})