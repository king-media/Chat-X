export const useState = <T extends object>(initialState: T, rerender: ((state: T) => Promise<void>)): T => {
  const stateHandler: ProxyHandler<T> = {
    get(target, key) {
      if (typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], stateHandler);
      }
      return target[key];
    },
    set(target, prop, newState, receiver) {
      const updatedState = new Proxy<T>({ ...target, [prop]: newState }, stateHandler)
      rerender(updatedState)
      return Reflect.set(target, prop, newState, receiver)
    }
  }

  return new Proxy(initialState, stateHandler)
}