/**
 * pages/_app.js
 *
 * Global styles loaded here — replaces @zeit/next-css plugin and the
 * inline <link rel="stylesheet"> tags that were in individual pages.
 *
 * CHANGED: added import for hometest.css (was imported inside homepage.js
 *          as '../static/hometest.css' which doesn't work in Next.js 14).
 *          CSS imports are only allowed in _app.js.
 *
 * NOTE: After renaming /static → /public (required by Next.js 14), update
 *       the hometest.css import path to '../public/hometest.css'
 */

import 'semantic-ui-css/semantic.min.css';
import '../public/hometest.css';            // MOVED HERE from homepage.js

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}