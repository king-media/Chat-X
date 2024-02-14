/* eslint-disable @typescript-eslint/no-explicit-any */
/*
    Single class instance that gets instantiated in main.ts during initial load. The resulting routes get global state passed down to it.
    Readonly state is reactive. Whenever state updates all components/pages will update as well. 
    DOM manipulating and rerender will be handled internally (local to the component)
*/

import { Message, User } from "@chatx/shared";


// NOTE: Improve global state to allow reactive programming to updates (may need proxy)
export interface State {
    user?: User | null
    socketConnection?: WebSocket | null,
    messages?: Partial<Message>[] | null
}

let instance;

let state: Record<keyof State, State[keyof State]> = {
    user: undefined,
    socketConnection: undefined,
    messages: undefined
}
class AppState {
    public getState<T extends State[keyof State]>(field?: keyof State): T {
        return field ? <T>state[field] : <T><unknown>state
    }

    public setState(updatedState: Partial<Record<keyof State, State[keyof State]>>): void

    public setState(cbState: (prevState: Record<keyof State, State[keyof State]>) =>
        Record<keyof State, State[keyof State]>): void

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

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        instance = this
    }
}

const appState = Object.freeze(new AppState())

export default appState