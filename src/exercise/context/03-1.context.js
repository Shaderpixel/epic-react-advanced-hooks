import * as React from 'react'

// 🐨 create your CountContext here with React.createContext
const CountContext = React.createContext();

function useCount() {
  const context = React.useContext(CountContext);
  if (!context) {
    // ensures a helpful error message indicating that the CountProvider component that wraps the CountContext.Provider is used in the app
    // abstracts away the complexity of the context provider
    throw new Error ('useCount must be used within a CountProvider')
  }
  return context
}

function CountProvider(props) {
  const [count, setCount] = React.useState(0);

  return (
    <CountContext.Provider {...props} value={[count, setCount]} />
  )
}

export {useCount, CountProvider}