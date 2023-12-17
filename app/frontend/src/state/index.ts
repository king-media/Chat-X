/*
    Single class instance that gets instantiated in main.ts during initial load. The resulting routes get global state passed down to it.
    Readonly state is reactive. Whenever state updates all components/pages will update as well. 
    DOM manipulating and rerender will be handled internally (local to the component)
*/


// NOTE: Improve global state to allow reactive programming to updates (may need proxy)
class AppState {
    // Read-only global state. Have to explicitly call a setter method for state updates.
    private state = {}

    public getState(field?: string) {
        return field ? this.state[field] : this.state
    }

    public setState(updatedState: object): void

    public setState(cbState: (prevState: object) => object): void

    public setState(updatedState: unknown): void {
        if (typeof updatedState === 'function') {
            this.state = updatedState(this.state)
        } else if (typeof updatedState === 'object') {
            this.state = { ...this.state, ...updatedState }
        }
    }
}

export default AppState