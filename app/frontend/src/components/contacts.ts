/* 
  Contacts Component 

  1. Get list of contacts and display them.

  2. Clicking on contact will start a new conversation or get an existing conversation
*/

type Contact = {
  id: string
  name: string
  chat: {
    id: string
    lastMessage: string
  } | null
  additionalInfo?: unknown
}

// Delete when backend is up
const defaultContacts: Contact[] = [
  {
    id: '123',
    name: 'King',
    chat: null,
  },
  {
    id: '124',
    name: 'Miles',
    chat: {
      id: '1ab6',
      lastMessage: 'Wassup',
    },
  },
]

const getContacts = (): Contact[] => {
  const contacts = localStorage.getItem('contacts')

  if (contacts) {
    return JSON.parse(contacts)
  }

  return defaultContacts
}

const renderContact = (contact: Contact, contactsContainer: HTMLDivElement) => {
  const listItem = `
  <div class="contact">
  <span class="contact-name">${contact.name}</span>
  <span class="last-message>${contact.chat?.lastMessage || ''}</span>
  </div>
  `
  contactsContainer.insertAdjacentHTML('beforeend', listItem)
}

const ContactList = () => {
  const contactsContainer = document.createElement('div')
  contactsContainer.setAttribute('id', 'contacts-container')

  const contacts = getContacts()
  contacts.forEach((contact) => renderContact(contact, contactsContainer))

  return contactsContainer.outerHTML
}

export default ContactList
