import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { Article as ArticleIcon, EditNote as EditNoteIcon } from '@openedx/paragon/icons';

import { COMPONENT_TYPE_ICON_MAP } from '../../../generic/block-type-utils/constants';
import { OST2_MARKDOWN_TYPE } from '../ost2ComponentMenu';

const AddComponentIcon = ({ type }) => {
  const icon = type === OST2_MARKDOWN_TYPE ? ArticleIcon : (COMPONENT_TYPE_ICON_MAP[type] || EditNoteIcon);

  return <Icon src={icon} screenReaderText={type} />;
};

AddComponentIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

export default AddComponentIcon;
