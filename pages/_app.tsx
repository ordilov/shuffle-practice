import '../public/styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { AppProps } from 'next/app'
config.autoAddCss = false

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
