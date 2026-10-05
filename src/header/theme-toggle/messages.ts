import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  toggleTheme: {
    id: 'header.theme-toggle.title',
    defaultMessage: 'Toggle Theme',
    description: 'Tooltip for the switch between the light and dark theme',
  },
  switchToDark: {
    id: 'header.theme-toggle.switch-to-dark',
    defaultMessage: 'Switch to Dark Mode',
    description: 'Screen reader label for the theme switch while the light theme is on',
  },
  switchToLight: {
    id: 'header.theme-toggle.switch-to-light',
    defaultMessage: 'Switch to Light Mode',
    description: 'Screen reader label for the theme switch while the dark theme is on',
  },
});

export default messages;
