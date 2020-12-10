// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

// spreading the old state and new state to combine both values
const countReducer = (state, action) => {
  const {type} = action;

  switch (type) {
    case 'increment':
      return {...state, ...{count: state.count + action.step}};
    default:
      throw new Error(`Unsupported action type: ${type}`);
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(countReducer, { count: initialCount, })
  const {count} = state;
  const increment = () => dispatch({type: 'increment', step})
  return <button onClick={increment}>{count}</button>
}

function App() {
  return <Counter />
}

export default App
