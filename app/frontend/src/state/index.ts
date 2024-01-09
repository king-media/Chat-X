/*
    Single class instance that gets instantiated in main.ts during initial load. The resulting routes get global state passed down to it.
    Readonly state is reactive. Whenever state updates all components/pages will update as well. 
    DOM manipulating and rerender will be handled internally (local to the component)
*/


// NOTE: Improve global state to allow reactive programming to updates (may need proxy)

let instance;
let state = {}
class AppState {
    public getState<T>(field?: string): T {
        return field ? <T>state[field] : <T>state
    }

    public setState(updatedState: object): void

    public setState(cbState: (prevState: object) => object): void

    public setState(updatedState: unknown): void {
        if (typeof updatedState === 'function') {
            state = updatedState(state)
        } else if (typeof updatedState === 'object') {
            state = { ...state, ...updatedState }
        }
    }

    constructor() {
        if (instance) {
            throw new Error("New instance cannot be created!!");
        }

        instance = this
    }
}

const appState = Object.freeze(new AppState())

export default appState