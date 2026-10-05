import { getConfig } from '@edx/frontend-platform';
import Cookies from 'universal-cookie';

// OST2: Studio side of the Indigo light/dark theme. The cookie name, body class
// and postMessage shape are the ones the Indigo theme already uses on the LMS and
// on the other MFEs, so one setting follows the user across the whole site.
export const THEME_COOKIE = 'indigo-toggle-dark';
export const DARK_THEME_CLASS = 'indigo-dark-theme';
const THEME_COOKIE_EXPIRY_DAYS = 90;

export type Theme = 'dark' | 'light';

export const isThemeToggleEnabled = (): boolean => (
  [true, 'true'].includes(getConfig().INDIGO_ENABLE_DARK_TOGGLE)
);

export const getStoredTheme = (): Theme => (
  new Cookies().get(THEME_COOKIE) === 'dark' ? 'dark' : 'light'
);

// Same options as the Indigo header toggle: the cookie lives on the LMS host, which
// makes it readable on apps.<host> and studio.<host> too.
export const storeTheme = (theme: Theme) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + THEME_COOKIE_EXPIRY_DAYS);
  new Cookies().set(THEME_COOKIE, theme, {
    domain: new URL(getConfig().LMS_BASE_URL).hostname,
    path: '/',
    expires,
  });
};

export const applyThemeToPage = (theme: Theme) => {
  document.body.classList.toggle(DARK_THEME_CLASS, theme === 'dark');
};

// The unit preview and the legacy editor modals are cross-origin Studio iframes, so
// CSS cannot reach them. The Indigo CMS theme script listens for this message.
export const broadcastThemeToIframes = (theme: Theme) => {
  Array.from(document.getElementsByTagName('iframe')).forEach((iframe) => {
    try {
      iframe.contentWindow?.postMessage({ 'indigo-toggle-dark': theme }, '*');
    } catch (e) {
      // A frame that is still loading reads the cookie itself once it loads.
    }
  });
};

// Called once at startup so pages without the header (e.g. the editors) still load
// in the stored theme, without a flash of light content.
export const initializeTheme = () => {
  if (isThemeToggleEnabled()) {
    applyThemeToPage(getStoredTheme());
  }
};
