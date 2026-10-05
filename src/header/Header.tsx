import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { StudioHeader } from '@edx/frontend-component-header';
import { type Container, useToggle } from '@openedx/paragon';

import { getWaffleFlags } from '../data/selectors';
import { SearchModal } from '../search-modal';
import { useContentMenuItems, useSettingMenuItems, useToolsMenuItems } from './hooks';
import messages from './messages';
import { ThemeToggle } from './theme-toggle';
import { isThemeToggleEnabled } from './theme-toggle/utils';

type ContainerPropsType = React.ComponentProps<typeof Container>;

// OST2: StudioHeader has no slot for extra controls, so the theme toggle is portaled
// into its header row, just before the last item (the user menu). The row is rebuilt
// when the header switches between its desktop and mobile layouts, so re-attach then.
const useHeaderRowHost = (enabled: boolean) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!enabled || !wrapper) {
      return undefined;
    }
    const node = document.createElement('div');
    node.className = 'ost2-theme-toggle-host';
    const attach = () => {
      const row = wrapper.querySelector('header');
      if (row && node.parentElement !== row) {
        row.insertBefore(node, row.lastElementChild);
      }
    };
    attach();
    setHost(node);
    const observer = new MutationObserver(attach);
    observer.observe(wrapper, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      node.remove();
    };
  }, [enabled]);

  return { wrapperRef, host };
};

interface HeaderProps {
  contextId?: string,
  number?: string,
  org?: string,
  title?: string,
  isHiddenMainMenu?: boolean,
  isLibrary?: boolean,
  containerProps?: ContainerPropsType,
}

const Header = ({
  contextId = '',
  org = '',
  number = '',
  title = '',
  isHiddenMainMenu = false,
  isLibrary = false,
  containerProps = {},
}: HeaderProps) => {
  const intl = useIntl();
  const waffleFlags = useSelector(getWaffleFlags);

  const [isShowSearchModalOpen, openSearchModal, closeSearchModal] = useToggle(false);
  const { wrapperRef, host: themeToggleHost } = useHeaderRowHost(isThemeToggleEnabled());

  const studioBaseUrl = getConfig().STUDIO_BASE_URL;
  const meiliSearchEnabled = [true, 'true'].includes(getConfig().MEILISEARCH_ENABLED);

  const contentMenuItems = useContentMenuItems(contextId);
  const settingMenuItems = useSettingMenuItems(contextId);
  const toolsMenuItems = useToolsMenuItems(contextId);
  const mainMenuDropdowns = !isLibrary ? [
    {
      id: `${intl.formatMessage(messages['header.links.content'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.content']),
      items: contentMenuItems,
    },
    {
      id: `${intl.formatMessage(messages['header.links.settings'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.settings']),
      items: settingMenuItems,
    },
    {
      id: `${intl.formatMessage(messages['header.links.tools'])}-dropdown-menu`,
      buttonTitle: intl.formatMessage(messages['header.links.tools']),
      items: toolsMenuItems,
    },
  ] : [];

  const getOutlineLink = () => {
    if (isLibrary) {
      return `/library/${contextId}`;
    }
    return waffleFlags.useNewCourseOutlinePage ? `/course/${contextId}` : `${studioBaseUrl}/course/${contextId}`;
  };

  return (
    <>
      <div ref={wrapperRef}>
        <StudioHeader
          org={org}
          number={number}
          title={title}
          isHiddenMainMenu={isHiddenMainMenu}
          mainMenuDropdowns={mainMenuDropdowns}
          outlineLink={getOutlineLink()}
          searchButtonAction={meiliSearchEnabled ? openSearchModal : undefined}
          containerProps={containerProps}
          isNewHomePage={waffleFlags.useNewHomePage}
        />
      </div>
      {themeToggleHost && createPortal(<ThemeToggle />, themeToggleHost)}
      {meiliSearchEnabled && (
        <SearchModal
          isOpen={isShowSearchModalOpen}
          courseId={isLibrary ? undefined : contextId}
          onClose={closeSearchModal}
        />
      )}
    </>
  );
};

export default Header;
