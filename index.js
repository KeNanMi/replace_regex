const { insertExplicitConcatOperator, infixToPostfix } = require("./lib/infix-to-postfix");
const { buildToNFA, isMatchOf } = require('./lib/automata');

module.exports = match = (regex, exp) => {
  const strWithConcat = insertExplicitConcatOperator(regex)
  const strWithPostfix = infixToPostfix(strWithConcat)
  const nfa = buildToNFA(strWithPostfix)

  return isMatchOf(exp, nfa)
}