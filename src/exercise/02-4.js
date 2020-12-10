// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

// 🐨 this is going to be our generic asyncReducer
function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useSafeDispatch(dispatch) {
  const mountedRef = React.useRef(false); // use ref to safe value without triggering a rerender

  React.useLayoutEffect(() => {
    mountedRef.current = true; // when useAsync is mounted, this useEffect is called after render that sets the ref to true
    return () => {mountedRef.current = false;} // when useAsync is unmounted, the useEffect's clean up function will run and set ref to false
  }, [])

  return React.useCallback((...args) => {
    console.log(args);
    if (mountedRef.current) dispatch(...args);
  },[dispatch]) //all the args passed to dispatch is forwarded to dispatch. dispatch is stable from useReducer, however because its passed between function calls, eslint can't keep track of it
}

// 🐨 move both the useReducer and useEffect hooks to a generic custom hook called useAsync
function useAsync(initialState) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState
  })

  const dispatch = useSafeDispatch(unsafeDispatch);

  const run = React.useCallback(promise => {
    // then you can dispatch and handle the promise etc...
    dispatch({type: 'pending'})
    promise.then(
      data => {
        dispatch({type: 'resolved', data})
      },
      error => {
        dispatch({type: 'rejected', error})
      },
    )
  },[dispatch]) // dispatch and promise are not dependencies. dispatch comes from useReducer so it will not change, will never get a new dispatch function throughout rerendering. Also we are accepting promise as an argument so that won't change either.
  return {...state, run};
}

function PokemonInfo({pokemonName}) {
  const {data: pokemon, status, error, run} = useAsync({
    status: pokemonName ? 'pending' : 'idle',
  }) // now we can even use run in a click handler

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    run(fetchPokemon(pokemonName))
  }, [pokemonName, run])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
