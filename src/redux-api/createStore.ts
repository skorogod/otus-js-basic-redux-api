import { CreateStore, Store } from "./types";

export const createStore: CreateStore<any, any> = (
  reducer,
  initialState,
  middlewares = [],
) => {
  let state = initialState;
  const callbacks: Set<Function> = new Set();

  const getState = () => state;

  let dispatch: (action: any) => any = (_action) => {
    throw new Error(
      "Dispatching while constructing your middleware is not allowed.",
    );
  };

  const rawDispatch = (action: any) => {
    state = reducer(state, action);
    for (const cb of callbacks) {
      cb();
    }
    return action;
  };

  const subscribe = (cb: () => void) => {
    callbacks.add(cb);

    return () => {
      callbacks.delete(cb);
    };
  };

  const middlewareAPI: Store = {
    getState,
    dispatch: (action) => dispatch(action),
    subscribe,
  };

  const chain = middlewares.map((middleware) => middleware(middlewareAPI));

  dispatch = chain.reduce(
    (result, middleware) => middleware(result),
    rawDispatch,
  );

  function replaceReducer(newReducer: any) {
    reducer = newReducer;
  }

  return {
    getState,
    dispatch,
    subscribe,
    replaceReducer,
  };
};
