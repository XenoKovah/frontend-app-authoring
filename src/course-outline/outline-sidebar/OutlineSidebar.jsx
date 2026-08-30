import React from 'react';
import PropTypes from 'prop-types';
import { Hyperlink } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { HelpSidebar } from '../../generic/help-sidebar';
import { getFormattedSidebarMessages } from './utils';

// The `outline` help token the CMS serves still points at the retired
// edx.readthedocs.io "Building and Running an Open edX Course" project, which
// 404s, so link the live docs.openedx.org page directly instead.
const COURSE_OUTLINE_DOC_URL = 'https://docs.openedx.org/en/latest/educators/concepts/open_edx_platform/about_course_outline.html';

const OutlineSideBar = ({ courseId }) => {
  const intl = useIntl();

  const sidebarMessages = getFormattedSidebarMessages(
    { learnMoreOutlineUrl: COURSE_OUTLINE_DOC_URL },
    intl,
  );

  return (
    <HelpSidebar
      courseId={courseId}
      showOtherSettings={false}
      className="outline-sidebar mt-4"
      data-testid="outline-sidebar"
    >
      {sidebarMessages.map(({ title, descriptions, link }, index) => {
        const isLastSection = index === sidebarMessages.length - 1;

        return (
          <div className="outline-sidebar-section" key={title}>
            <h4 className="help-sidebar-about-title">{title}</h4>
            {descriptions.map((description) => (
              <p className="help-sidebar-about-descriptions" key={description}>{description}</p>
            ))}
            {Boolean(link) && Boolean(link.href) && (
              <Hyperlink
                className="small"
                destination={link.href}
                target="_blank"
                showLaunchIcon={false}
              >
                {link.text}
              </Hyperlink>
            )}
            {!isLastSection && <hr className="my-3.5" />}
          </div>
        );
      })}
    </HelpSidebar>
  );
};

OutlineSideBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default OutlineSideBar;
