const { CONCATENATION_OPERATOR, UNION_OPERATOR, CLOSURE_OPERATOR, ZERO_OR_ONE_OPERATOR, ONE_OR_MORE_OPERATOR } = require('./token');

class State {
  constructor(isEnd = false) {
    this.isEnd = isEnd;
    this.transition = {};
    this.epsilonTransition = [];
  }

  addTransition(token, to) {
    this.transition[token] = to;
    return this;
  }

  addEpsilonTransition(to) {
    this.epsilonTransition.push(to);
    return this;
  }
}

class NFA {
  static createBasicNFA(token) {
    const startState = new State()
    const endState = new State(true)
    if (token) {
      startState.addTransition(token, endState)
    } else {
      startState.addEpsilonTransition(endState)
    }

    return new NFA(startState, endState)
  }

  static union(aNFA, bNFA) {
    const newStartState = new State();
    const newEndState = new State(true);

    newStartState.addEpsilonTransition(aNFA.startState)
      .addEpsilonTransition(bNFA.startState);
    aNFA.endState.addEpsilonTransition(newEndState).isEnd = false;
    bNFA.endState.addEpsilonTransition(newEndState).isEnd = false;

    return new NFA(newStartState, newEndState);
  }

  static concat(aNFA, bNFA) {
    const newStartState = aNFA.startState;
    const newEndState = bNFA.endState;

    aNFA.endState.addEpsilonTransition(bNFA.startState).isEnd = false;

    return new NFA(newStartState, newEndState);
  }

  static closure(nfa) {
    const newStartState = new State()
    const newEndState = new State(true)

    newStartState.addEpsilonTransition(nfa.startState)
      .addEpsilonTransition(newEndState)
    nfa.endState.addEpsilonTransition(nfa.startState)
      .addEpsilonTransition(newEndState)
      .isEnd = false

      return new NFA(newStartState, newEndState)
  }

  static zeroOrOne(nfa) {
    const newStartState = new State()
    const newEndState = new State(true)

    newStartState.addEpsilonTransition(nfa.startState)
      .addEpsilonTransition(newEndState)
    nfa.endState.addEpsilonTransition(newEndState)
      .isEnd = false

      return new NFA(newStartState, newEndState)
  }

  static oneOrMore(nfa) {
    const newStartState = new State()
    const newEndState = new State(true)

    newStartState.addEpsilonTransition(nfa.startState)
    nfa.endState.addEpsilonTransition(nfa.startState)
      .addEpsilonTransition(newEndState)
      .isEnd = false

      return new NFA(newStartState, newEndState)
  }

  constructor(startState, endState) {
    this.startState = startState;
    this.endState = endState;
  }

  getClosure(state) {
    let visited = [state]
    let closure = [state]
    while (closure.length) {
      const state = closure.pop()
      const nextStates = state.epsilonTransition.filter(item => !visited.includes(item))
      visited = visited.concat(nextStates)
      closure = closure.concat(nextStates)
    }
    return visited
  }
}

const buildToNFA = (exp) => {
  const stack = []

  for (const token of exp) {
    if (token === UNION_OPERATOR) {
      const bNFA = stack.pop()
      const aNFA = stack.pop()
      stack.push(NFA.union(aNFA, bNFA))
    } else if (token === CONCATENATION_OPERATOR) {
      const bNFA = stack.pop()
      const aNFA = stack.pop()
      stack.push(NFA.concat(aNFA, bNFA))
    } else if (token === CLOSURE_OPERATOR) {
      const nfa = stack.pop()
      stack.push(NFA.closure(nfa))
    } else if (token === ZERO_OR_ONE_OPERATOR) {
      const nfa = stack.pop()
      stack.push(NFA.zeroOrOne(nfa))
    } else if (token === ONE_OR_MORE_OPERATOR) {
      const nfa = stack.pop()
      stack.push(NFA.oneOrMore(nfa))
    } else {
      stack.push(NFA.createBasicNFA(token))
    }
  }

  return stack.pop()
}

const isMatchOf = (exp, nfa) => {
  const startState = nfa.startState
  let currentStates = nfa.getClosure(startState)

  for (const token of exp) {
    let nextStates = []

    currentStates.forEach(state => {
      if (state.transition[token]) {
        nextStates = nextStates.concat(nfa.getClosure(state.transition[token]))
      }
    })

    currentStates = nextStates
  }

  return currentStates.some(state => state.isEnd)
}

module.exports = {
  isMatchOf,
  buildToNFA,
  NFA,
  State
}