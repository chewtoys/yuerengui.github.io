import entriesData from './static/entriesinfo.json';

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'nuxt-blog',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'nuxt static blog' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
    ** Global CSS
    */
  css: [
    'element-ui/lib/theme-chalk/reset.css',
    'element-ui/lib/theme-chalk/index.css'
  ],
  plugins: [
    '@/plugins/element-ui'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  modules: ['@nuxtjs/markdownit'],
  markdownit: {
    preset: 'default',
    linkify: true,
    breaks: true,
    typographer: true,
    injected: true,
    use: ['markdown-it-container', 'markdown-it-attrs']
  },
  generate: {
    routes: function () {
      return entriesData.entries.map(entry => {
        return '/entries/' + entry.slug;
      });
    }
  }
}

