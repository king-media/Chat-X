import ChatList from '~/pages/chat/components/chat-list'

import '~/pages/chat/assets/chat.css'

import { type Route } from '~/main'

const Chat: Route['component'] = async () => {
  const root = document.createElement('div')

  root.innerHTML = `
    <header>
      <nav>links here...</nav>
      <div id="tagline-container">
        <h1>ChatX</h1>
        <h3>This is the start of something more than a conversation...</h3>
      </div>
      <h2> Chats </h2>
    </header>
    <main id="home">
      <div id="chat-container">
        <div id="chat-room"></div>
        <div id="chat-footer">
          <div id="chat-fields">
            <form action="" method="post">
              <input
                type="text"
                name="message"
                id="message-field"
                placeholder="Send Message"
              />
              <button id="send-message">Send</button>
            </form>
          </div>
        </div>
      </div>
    </main>`

  const chatList = await ChatList()

  root.querySelector('#home')?.insertAdjacentElement('afterbegin', chatList)
  return root
}

export default Chat
