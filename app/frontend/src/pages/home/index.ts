import ChatList from '../../components/chat-list'

import '~/assets/home.css'

const Home = async () => {
  return `
    <header>
      <nav>links here...</nav>
      <div id="tagline-container">
        <h1>ChatX</h1>
        <h3>This is the start of something more than a conversation...</h3>
      </div>
      <h2> Chats </h2>
    </header>
    <main id="home">
      ${await ChatList()}
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
}

export default Home
