import { getCurrentUser } from "~src/utils/state";

const AccountInfo = (e?: Event, settingsContainer?: HTMLDivElement) => {
    const currentUser = getCurrentUser()
    const accountInfoId = 'account-info-container';
    const root = document.createElement('div')

    root.setAttribute('id', accountInfoId)
    root.innerHTML = `
        <h1>Account Information</h1>
        <p>Signed up on ${currentUser?.creationDate}</p>
        <p>Username: ${currentUser?.username} </p>
        <p>Email: ${currentUser?.email} </p>
    `

    if (settingsContainer && !settingsContainer.querySelector(`#${accountInfoId}`)) {
        const lastChild = settingsContainer.children[settingsContainer.children.length - 1]
        lastChild.replaceWith(root)
    }

    return root.outerHTML
}

export default AccountInfo