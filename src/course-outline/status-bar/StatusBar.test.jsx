import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getConfig, setConfig } from '@edx/frontend-platform/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import StatusBar from './StatusBar';
import messages from './messages';
import initializeStore from '../../store';
import { VIDEO_SHARING_OPTIONS } from '../constants';

let store;
const mockPathname = '/foo-bar';
const courseId = 'course-v1:123';
const isLoading = false;
const handleVideoSharingOptionChange = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('../../generic/data/api', () => ({
  ...jest.requireActual('../../generic/data/api'),
  getTagsCount: jest.fn().mockResolvedValue({ 'course-v1:123': 17 }),
}));

jest.mock('../../help-urls/hooks', () => ({
  useHelpUrls: () => ({
    socialSharing: 'social-sharing-link',
  }),
}));

const statusBarData = {
  courseReleaseDate: 'Feb 05, 2013 at 05:00 UTC',
  isSelfPaced: true,
  checklist: {
    totalCourseLaunchChecks: 5,
    completedCourseLaunchChecks: 1,
    totalCourseBestPracticesChecks: 4,
    completedCourseBestPracticesChecks: 1,
  },
  highlightsEnabledForMessaging: true,
  highlightsDocUrl: 'https://example.com/highlights-doc',
  videoSharingEnabled: true,
  videoSharingOptions: VIDEO_SHARING_OPTIONS.allOn,
};

const queryClient = new QueryClient();

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <StatusBar
          courseId={courseId}
          isLoading={isLoading}
          handleVideoSharingOptionChange={handleVideoSharingOptionChange}
          statusBarData={statusBarData}
          {...props}
        />
      </IntlProvider>
    </QueryClientProvider>
  </AppProvider>,
);

describe('<StatusBar />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });

  it('renders StatusBar component correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText(messages.startDateTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText('Feb 05, 2013, 5:00 AM')).toBeInTheDocument();

    expect(getByText(messages.pacingTypeTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.pacingTypeSelfPaced.defaultMessage)).toBeInTheDocument();

    expect(getByText(messages.videoSharingTitle.defaultMessage)).toBeInTheDocument();
  });

  it('does not render the checklists, highlight emails or course tags items', () => {
    const { queryByText } = renderComponent();

    expect(queryByText('Checklists')).not.toBeInTheDocument();
    expect(queryByText('2/9 completed')).not.toBeInTheDocument();
    expect(queryByText('Course highlight emails')).not.toBeInTheDocument();
    expect(queryByText('Enabled')).not.toBeInTheDocument();
    expect(queryByText('Course tags')).not.toBeInTheDocument();
  });

  it('renders StatusBar when isSelfPaced is false', () => {
    const { getByText } = renderComponent({
      statusBarData: {
        ...statusBarData,
        isSelfPaced: false,
      },
    });

    expect(getByText(messages.pacingTypeInstructorPaced.defaultMessage)).toBeInTheDocument();
  });

  it('does not render the "Enable now" highlight emails button', () => {
    const { queryByRole } = renderComponent({
      statusBarData: {
        ...statusBarData,
        highlightsEnabledForMessaging: false,
      },
    });

    expect(queryByRole('button', { name: 'Enable now' })).not.toBeInTheDocument();
  });

  it('not render component when isLoading is true', () => {
    const { queryByTestId } = renderComponent({
      isLoading: true,
    });

    expect(queryByTestId('outline-status-bar')).not.toBeInTheDocument();
  });

  it('does not render video sharing dropdown if not enabled', () => {
    const { queryByTestId } = renderComponent({
      statusBarData: {
        ...statusBarData,
        videoSharingEnabled: false,
      },
    });

    expect(queryByTestId('video-sharing-wrapper')).not.toBeInTheDocument();
  });

  it('does not render the tag count even if the waffle flag is enabled', () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    const { queryByText } = renderComponent();

    expect(queryByText('17')).not.toBeInTheDocument();
    expect(queryByText('Manage tags')).not.toBeInTheDocument();
  });
});
