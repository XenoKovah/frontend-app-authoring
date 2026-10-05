import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';

// OST2: layout of the unit page's "Add a new component" menu.
// The first row is Markdown, Text, Video, Problem, Discussion, then Advanced.
// Markdown is an advanced module, promoted to its own button (and dropped from
// the Advanced list). Every other component type moves into the Advanced
// dialog, which lists everything alphabetically.
export const OST2_MARKDOWN_TYPE = 'markdown';

const PRIMARY_TYPES = [
  OST2_MARKDOWN_TYPE,
  COMPONENT_TYPES.html,
  COMPONENT_TYPES.video,
  COMPONENT_TYPES.problem,
  COMPONENT_TYPES.discussion,
];

// Value of a moved component's radio option in the Advanced dialog.
const MOVED_PREFIX = 'ost2-moved:';

/**
 * @param {Array} componentTemplates the unit's component templates, as the API returns them
 * @returns {{ menu: Array, movedTargets: Object }} `menu` is the list of components to show,
 *   in order; `movedTargets` maps each moved Advanced option's value to the
 *   `{ type, moduleName }` its own button would have created.
 */
export const buildOst2ComponentMenu = (componentTemplates) => {
  const available = componentTemplates.filter((component) => component.templates.length);
  const byType = Object.fromEntries(available.map((component) => [component.type, component]));
  const advanced = byType[COMPONENT_TYPES.advanced];
  const advancedTemplates = advanced?.templates || [];
  const markdownTemplate = advancedTemplates.find((template) => template.category === OST2_MARKDOWN_TYPE);

  const movedTargets = {};
  const movedTemplates = available
    .filter((component) => !PRIMARY_TYPES.includes(component.type) && component.type !== COMPONENT_TYPES.advanced)
    .flatMap((component) => {
      // Open Response has several flavours; list each one.
      if (component.type === COMPONENT_TYPES.openassessment) {
        return component.templates.map((template) => {
          const value = `${MOVED_PREFIX}${component.type}:${template.boilerplateName}`;
          movedTargets[value] = { type: component.type, moduleName: template.boilerplateName };
          return {
            ...template,
            boilerplateName: value,
            displayName: `${component.displayName}: ${template.displayName}`,
          };
        });
      }
      const value = `${MOVED_PREFIX}${component.type}`;
      movedTargets[value] = { type: component.type };
      return [{
        ...component.templates[0],
        boilerplateName: value,
        displayName: component.beta ? `${component.displayName} (Beta)` : component.displayName,
      }];
    });

  const advancedList = [
    ...advancedTemplates.filter((template) => template.category !== OST2_MARKDOWN_TYPE),
    ...movedTemplates,
  ].sort((a, b) => a.displayName.localeCompare(b.displayName));

  const primary = PRIMARY_TYPES
    .map((type) => {
      if (type === OST2_MARKDOWN_TYPE) {
        return markdownTemplate && {
          type: OST2_MARKDOWN_TYPE,
          displayName: markdownTemplate.displayName,
          templates: [markdownTemplate],
        };
      }
      return byType[type];
    })
    .filter(Boolean);

  const menu = [...primary];
  if (advancedList.length) {
    menu.push({
      type: COMPONENT_TYPES.advanced,
      displayName: 'Advanced',
      supportLegend: { showLegend: false },
      ...advanced,
      templates: advancedList,
    });
  }

  return { menu, movedTargets };
};
