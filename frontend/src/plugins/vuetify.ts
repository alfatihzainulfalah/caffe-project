import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'cafe',
    themes: {
      cafe: {
        dark: false,
        colors: {
          primary: '#6F4E37',
          secondary: '#D7A86E',
          background: '#FFF8F0',
          surface: '#FFFFFF',
        },
      },
    },
  },
})

export default vuetify