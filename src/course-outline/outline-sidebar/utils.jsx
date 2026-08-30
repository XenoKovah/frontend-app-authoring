import messages from './messages';

/**
 * Get formatted sidebar messages for render
 * @param {object} docsLinks - Docs links object from store
 * @returns {Array<{
 *   title: string,
 *   descriptions: Array<string>,
 *   link?: {
 *     text: string,
 *     href: string
 *   }
 * }>}
 */
const getFormattedSidebarMessages = (docsLinks, intl) => {
  const { learnMoreOutlineUrl } = docsLinks;

  return [
    {
      title: intl.formatMessage(messages.section_1_title),
      descriptions: [
        intl.formatMessage(messages.section_1_descriptions_1),
        intl.formatMessage(messages.section_1_descriptions_2),
      ],
    },
    {
      title: intl.formatMessage(messages.section_2_title),
      descriptions: [
        intl.formatMessage(messages.section_2_descriptions_1),
      ],
      link: {
        text: intl.formatMessage(messages.section_2_link),
        href: learnMoreOutlineUrl,
      },
    },
  ];
};

export { getFormattedSidebarMessages };
