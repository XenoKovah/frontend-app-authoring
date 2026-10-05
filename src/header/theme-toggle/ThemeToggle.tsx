import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Nightlight, WbSunny } from '@openedx/paragon/icons';

import messages from './messages';
import {
  applyThemeToPage,
  broadcastThemeToIframes,
  getStoredTheme,
  isThemeToggleEnabled,
  storeTheme,
  type Theme,
} from './utils';

// Same markup and class names as the toggle in the Indigo learning header, so the
// Indigo brand's dark styles for `.theme-toggle-button` apply here unchanged.
const ThemeToggle = () => {
  const intl = useIntl();
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  if (!isThemeToggleEnabled()) {
    return null;
  }

  const onToggle = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    storeTheme(nextTheme);
    applyThemeToPage(nextTheme);
    broadcastThemeToIframes(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <div className="theme-toggle-button" data-testid="theme-toggle">
      <div className="light-theme-icon">
        <Icon src={WbSunny} />
      </div>
      <div className="toggle-switch">
        <label htmlFor="theme-toggle-checkbox" className="switch">
          <input
            id="theme-toggle-checkbox"
            type="checkbox"
            checked={theme === 'dark'}
            onChange={onToggle}
            title={intl.formatMessage(messages.toggleTheme)}
          />
          <span className="slider round" />
          <span className="sr-only">
            {intl.formatMessage(theme === 'dark' ? messages.switchToLight : messages.switchToDark)}
          </span>
        </label>
      </div>
      <div className="dark-theme-icon">
        <Icon src={Nightlight} />
      </div>
    </div>
  );
};

export default ThemeToggle;
