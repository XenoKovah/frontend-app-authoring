import { COMPONENT_TYPES } from '../../generic/block-type-utils/constants';

// OST2: layout of the unit page's "Add a new component" menu.
// The buttons are Markdown, Text, Video, Problem, Discussion, Mark as complete,
// then Advanced. Markdown and Completion ("Mark as complete") are advanced
// modules, promoted to their own buttons (and dropped from the Advanced list).
// Every other component type moves into the Advanced dialog, which lists
// everything alphabetically.
export const OST2_MARKDOWN_TYPE = 'markdown';
export const OST2_COMPLETION_TYPE = 'done';

// Advanced modules that get their own button; each creates its block directly.
export const OST2_PROMOTED_ADVANCED_TYPES = [OST2_MARKDOWN_TYPE, OST2_COMPLETION_TYPE];

const PRIMARY_TYPES = [
  OST2_MARKDOWN_TYPE,
  COMPONENT_TYPES.html,
  COMPONENT_TYPES.video,
  COMPONENT_TYPES.problem,
  COMPONENT_TYPES.discussion,
  OST2_COMPLETION_TYPE,
];

// Value of a moved component's radio option in the Advanced dialog.
const MOVED_PREFIX = 'ost2-moved:';

/**
 * @param {Array} componentTemplates the unit's component templates, as the API returns them
 * @param {Object} buttonLabels optional button label per promoted advanced module, e.g. `{ done: 'Mark as complete' }`
 * @returns {{ menu: Array, movedTargets: Object }} `menu` is the list of components to show,
 *   in order; `movedTargets` maps each moved Advanced option's value to the
 *   `{ type, moduleName }` its own button would have created.
 */
export const buildOst2ComponentMenu = (componentTemplates, buttonLabels = {}) => {
  const available = componentTemplates.filter((component) => component.templates.length);
  const byType = Object.fromEntries(available.map((component) => [component.type, component]));
  const advanced = byType[COMPONENT_TYPES.advanced];
  const advancedTemplates = advanced?.templates || [];

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
    ...advancedTemplates.filter((template) => !OST2_PROMOTED_ADVANCED_TYPES.includes(template.category)),
    ...movedTemplates,
  ].sort((a, b) => a.displayName.localeCompare(b.displayName));

  const primary = PRIMARY_TYPES
    .map((type) => {
      if (OST2_PROMOTED_ADVANCED_TYPES.includes(type)) {
        const template = advancedTemplates.find(({ category }) => category === type);
        return template && {
          type,
          displayName: buttonLabels[type] || template.displayName,
          templates: [template],
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
