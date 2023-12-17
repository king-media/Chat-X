// Proxy that runs rerender logic on set of any deps

/*
NOTE
---- UPDATE ALL STATE OPERATIONS ----
This needs some work the idea was to not have to rely on event delegation in order to have the page.
Manually trigger a re render. So all though this is really cool its completely unnecessary and over engineered.

CURRENT USAGE: /chat page.
  const pageState = useState<ChatPageState>({ selectedChat: chatListData?.slice(0)[0] }, async (state) => {
    // NOTE: Handle Re-render of state change.
    const chatList = await ChatList({ appState, pageState: state })
    const chatRoom = await ChatRoom({ appState, pageState: state })

    root.querySelector('#home')?.replaceChildren(chatList, chatRoom)
  })

  The above example works but only on the first state update. 
  I still had to use event delegation to set the state which then utilized the proxy to rerender.
  At that point I could just run rerender inside the captured click event.

  EX: 

   const chatSelectedEvent = (e: Event) => {
    const eventName = "chatselected"

    if (e.target.hasAttribute(`data-${eventName}`)) {
      const chatId = e.target.dataset[eventName]
      pageState.selectedChat = appState?.getState('chatList').find(item => item.chat.id === chatId) -> state update redundant.
      // rerender messages component
    }
  }
*/
export const useState = <T extends object>(initialState: T, rerender: ((state: T) => Promise<void>)): T => {
    const stateHandler: ProxyHandler<T> = {
        get(target, key) {
            if (typeof target[key] === 'object' && target[key] !== null) {
                return new Proxy(target[key], stateHandler);
            }
            return target[key];
        },
        set(target, prop, newState, receiver) {
            const updatedState = { ...target, [prop]: newState }
            rerender(updatedState)
            return Reflect.set(target, prop, newState, receiver)
        }
    }

    return new Proxy(initialState, stateHandler)
}