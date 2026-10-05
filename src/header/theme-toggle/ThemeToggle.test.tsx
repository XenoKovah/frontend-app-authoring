import { mergeConfig } from '@edx/frontend-platform';
import Cookies from 'universal-cookie';

import {
  fireEvent, initializeMocks, render, screen,
} from '../../testUtils';
import ThemeToggle from './ThemeToggle';
import { DARK_THEME_CLASS, THEME_COOKIE, initializeTheme } from './utils';

const clearThemeCookie = () => {
  document.cookie = `${THEME_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

describe('<ThemeToggle />', () => {
  beforeEach(() => {
    initializeMocks();
    mergeConfig({ INDIGO_ENABLE_DARK_TOGGLE: true, LMS_BASE_URL: 'http://localhost' });
    clearThemeCookie();
    document.body.classList.remove(DARK_THEME_CLASS);
  });

  it('renders nothing when the Indigo toggle is disabled', () => {
    mergeConfig({ INDIGO_ENABLE_DARK_TOGGLE: false });
    render(<ThemeToggle />);
    expect(screen.queryByTestId('theme-toggle')).not.toBeInTheDocument();
  });

  it('switches to dark and back, saving the choice in the shared cookie', () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole('checkbox');
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(document.body).toHaveClass(DARK_THEME_CLASS);
    expect(new Cookies().get(THEME_COOKIE)).toBe('dark');
    expect(screen.getByText('Switch to Light Mode')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(document.body).not.toHaveClass(DARK_THEME_CLASS);
    expect(new Cookies().get(THEME_COOKIE)).toBe('light');
  });

  it('tells iframes about the new theme', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const postMessage = jest.spyOn(iframe.contentWindow!, 'postMessage');

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('checkbox'));

    expect(postMessage).toHaveBeenCalledWith({ 'indigo-toggle-dark': 'dark' }, '*');
    iframe.remove();
  });

  it('starts in the stored theme', () => {
    document.cookie = `${THEME_COOKIE}=dark; path=/`;
    initializeTheme();
    expect(document.body).toHaveClass(DARK_THEME_CLASS);

    render(<ThemeToggle />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
