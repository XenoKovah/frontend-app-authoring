import { useContext } from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import {
  Hyperlink, Form, Stack,
} from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { useSelector } from 'react-redux';

import { useHelpUrls } from '../../help-urls/hooks';
import { getWaffleFlags } from '../../data/selectors';
import { VIDEO_SHARING_OPTIONS } from '../constants';
import messages from './messages';
import { getVideoSharingOptionText } from '../utils';

const StatusBarItem = ({ title, children }) => (
  <div className="d-flex flex-column justify-content-between">
    <h5>{title}</h5>
    <div className="d-flex align-items-center">
      {children}
    </div>
  </div>
);

StatusBarItem.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

StatusBarItem.defaultProps = {
  children: null,
};

const StatusBar = ({
  statusBarData,
  isLoading,
  courseId,
  handleVideoSharingOptionChange,
}) => {
  const intl = useIntl();
  const { config } = useContext(AppContext);
  const waffleFlags = useSelector(getWaffleFlags);

  const {
    courseReleaseDate,
    isSelfPaced,
    videoSharingEnabled,
    videoSharingOptions,
  } = statusBarData;

  const courseReleaseDateObj = moment.utc(courseReleaseDate, 'MMM DD, YYYY at HH:mm UTC', true);
  const scheduleDestination = () => new URL(`settings/details/${courseId}#schedule`, config.STUDIO_BASE_URL).href;

  const { socialSharing: socialSharingUrl } = useHelpUrls(['socialSharing']);

  if (isLoading) {
    return null;
  }

  return (
    <Stack direction="horizontal" gap={3.5} className="d-flex align-items-stretch outline-status-bar" data-testid="outline-status-bar">
      <StatusBarItem title={intl.formatMessage(messages.startDateTitle)}>
        <Link
          className="small"
          to={waffleFlags.useNewScheduleDetailsPage ? `/course/${courseId}/settings/details/#schedule` : scheduleDestination()}
        >
          {courseReleaseDateObj.isValid() ? (
            <FormattedDate
              value={courseReleaseDateObj}
              year="numeric"
              month="short"
              day="2-digit"
              hour="numeric"
              minute="numeric"
            />
          ) : courseReleaseDate}
        </Link>
      </StatusBarItem>
      <StatusBarItem title={intl.formatMessage(messages.pacingTypeTitle)}>
        <span className="small">
          {isSelfPaced
            ? intl.formatMessage(messages.pacingTypeSelfPaced)
            : intl.formatMessage(messages.pacingTypeInstructorPaced)}
        </span>
      </StatusBarItem>
      {videoSharingEnabled && (
        <Form.Group
          size="sm"
          className="d-flex flex-column justify-content-between m-0"
        >
          <Form.Label
            className="h5"
          >{intl.formatMessage(messages.videoSharingTitle)}
          </Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              as="select"
              defaultValue={videoSharingOptions}
              onChange={(e) => handleVideoSharingOptionChange(e.target.value)}
            >
              {Object.values(VIDEO_SHARING_OPTIONS).map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {getVideoSharingOptionText(option, messages, intl)}
                </option>
              ))}
            </Form.Control>
            <Hyperlink
              className="small"
              destination={socialSharingUrl}
              target="_blank"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.videoSharingLink)}
            </Hyperlink>
          </div>
        </Form.Group>

      )}
    </Stack>
  );
};

StatusBar.propTypes = {
  courseId: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleVideoSharingOptionChange: PropTypes.func.isRequired,
  statusBarData: PropTypes.shape({
    courseReleaseDate: PropTypes.string.isRequired,
    isSelfPaced: PropTypes.bool.isRequired,
    videoSharingEnabled: PropTypes.bool.isRequired,
    videoSharingOptions: PropTypes.string.isRequired,
  }).isRequired,
};

export default StatusBar;
