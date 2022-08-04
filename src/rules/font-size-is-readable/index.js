import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule';
import { utils } from 'stylelint';

export const ruleName = 'a11y/font-size-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a larger font-size in ${selector}`,
});

const pxToPt = (v) => 0.75 * v;

const checkInPx = (value, THRESHOLD_IN_PX) =>
  value.toLowerCase().endsWith('px') && parseFloat(value) < THRESHOLD_IN_PX;
const checkInPt = (value, THRESHOLD_IN_PX) =>
  value.toLowerCase().endsWith('pt') && parseFloat(value) < pxToPt(THRESHOLD_IN_PX);

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    const THRESHOLD_IN_PX = (options && options.thresholdInPixels) || 15;

    root.walkRules((rule) => {
      let selector = null;

      if (!isStandardSyntaxRule(rule)) {
        return;
      }

      selector = rule.selector;

      if (!selector) {
        return;
      }

      const isRejected = rule.nodes.some((o) => {
        return (
          o.type === 'decl' &&
          o.prop.toLowerCase() === 'font-size' &&
          (checkInPx(o.value, THRESHOLD_IN_PX) || checkInPt(o.value, THRESHOLD_IN_PX))
        );
      });

      if (isRejected) {
        utils.report({
          index: rule.lastEach,
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
        });
      }
    });
  };
}
