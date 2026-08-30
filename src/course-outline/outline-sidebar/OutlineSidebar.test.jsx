import React from 'react';
import { render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { helpUrls } from '../../help-urls/__mocks__';
import { getHelpUrlsApiUrl } from '../../help-urls/data/api';
import initializeStore from '../../store';
import OutlineSidebar from './OutlineSidebar';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <OutlineSidebar courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('<OutlineSidebar />', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getHelpUrlsApiUrl())
      .reply(200, helpUrls);
  });

  it('render OutlineSidebar component correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.section_1_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions_2.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_2_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_link.defaultMessage)).toBeInTheDocument();
    });
  });

  it('does not render the release dates or content visibility sections', async () => {
    const { queryByText } = renderComponent();

    await waitFor(() => {
      expect(queryByText('Setting release dates and grading policies')).not.toBeInTheDocument();
      expect(queryByText('Learn more about grading policy settings')).not.toBeInTheDocument();
      expect(queryByText('Changing the content learners see')).not.toBeInTheDocument();
      expect(queryByText('Learn more about content visibility settings')).not.toBeInTheDocument();
    });
  });

  it('links the course outline docs at their live docs.openedx.org location', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.section_2_link.defaultMessage).closest('a')).toHaveAttribute(
        'href',
        'https://docs.openedx.org/en/latest/educators/concepts/open_edx_platform/about_course_outline.html',
      );
    });
  });
});
