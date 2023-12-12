
const NotificationSettings = (e?: Event, settingsContainer?: HTMLDivElement) => {
    const notificationSettingsId = 'notification-settings-container';
    const root = document.createElement('div')

    root.setAttribute('id', notificationSettingsId)
    root.innerHTML = `
        <h1>Notification Settings</h1>
        <h2>Coming soon....</h2>
    `

    if (settingsContainer && !settingsContainer.querySelector(`#${notificationSettingsId}`)) {
        const lastChild = settingsContainer.children[settingsContainer.children.length - 1]
        lastChild.replaceWith(root)
    }

    return root.outerHTML
}

export default NotificationSettings