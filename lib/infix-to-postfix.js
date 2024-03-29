const { CONCATENATION_OPERATOR, UNION_OPERATOR, CLOSURE_OPERATOR,
  GROUP_LEFT_OPERATOR, GROUP_RIGHT_OPERATOR, ZERO_OR_ONE_OPERATOR, ONE_OR_MORE_OPERATOR } = require('./token');

const operatorPriorityMap = {
  [UNION_OPERATOR]: 1,
  [CONCATENATION_OPERATOR]: 2,
  [ZERO_OR_ONE_OPERATOR]: 3,
  [ONE_OR_MORE_OPERATOR]: 3,
  [CLOSURE_OPERATOR]: 3
};

const insertExplicitConcatOperator = (exp) => {
  let output = "";

  for (let i = 0; i < exp.length; i++) {
    const token = exp[i];
    output += token;

    if (token === GROUP_LEFT_OPERATOR || token === UNION_OPERATOR) {
      continue;
    }

    if (i < exp.length - 1) {
      const lookahead = exp[i + 1];

      if (lookahead === CLOSURE_OPERATOR ||
        lookahead === ZERO_OR_ONE_OPERATOR ||
        lookahead === ONE_OR_MORE_OPERATOR ||
        lookahead === GROUP_RIGHT_OPERATOR ||
        lookahead === UNION_OPERATOR) {
        continue;
      }

      output += CONCATENATION_OPERATOR;
    }
  }

  return output;
};

const peek = (stack) => stack.length && stack[stack.length - 1];

const infixToPostfix = (exp) => {
  let output = "";
  const stack = [];

  for (const token of exp) {
    if (token === GROUP_RIGHT_OPERATOR) {
      while (peek(stack) !== GROUP_LEFT_OPERATOR) {
        output += stack.pop();
      }
      stack.pop();
    } else if (
      token === CONCATENATION_OPERATOR ||
      token === UNION_OPERATOR ||
      token === CLOSURE_OPERATOR ||
      token === ZERO_OR_ONE_OPERATOR ||
      token === ONE_OR_MORE_OPERATOR
    ) {
      while (
        operatorPriorityMap[peek(stack)] &&
        operatorPriorityMap[peek(stack)] >= operatorPriorityMap[token]
      ) {
        output += stack.pop();
      }
      stack.push(token);
    } else if (token === GROUP_LEFT_OPERATOR) {
      stack.push(token);
    } else {
      output += token;
    }
  }

  while (stack.length) {
    output += stack.pop();
  }

  return output;
};

module.exports = {
  infixToPostfix,
  insertExplicitConcatOperator
}