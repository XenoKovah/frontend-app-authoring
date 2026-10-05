import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { Article as ArticleIcon, EditNote as EditNoteIcon, TaskAlt as TaskAltIcon } from '@openedx/paragon/icons';

import { COMPONENT_TYPE_ICON_MAP } from '../../../generic/block-type-utils/constants';
import { OST2_COMPLETION_TYPE, OST2_MARKDOWN_TYPE } from '../ost2ComponentMenu';

const AddComponentIcon = ({ type }) => {
  const ost2Icons = { [OST2_MARKDOWN_TYPE]: ArticleIcon, [OST2_COMPLETION_TYPE]: TaskAltIcon };
  const icon = ost2Icons[type] || COMPONENT_TYPE_ICON_MAP[type] || EditNoteIcon;

  return <Icon src={icon} screenReaderText={type} />;
};

AddComponentIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

export default AddComponentIcon;
