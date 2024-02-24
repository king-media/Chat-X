import { Route, navigateTo } from "~src/main";
import Layout from "~src/layout";
import AccountInfo from "~src/pages/settings/components/account-info";
import NotificationSettings from "~src/pages/settings/components/notification-settings";

import '~src/pages/settings/assets/settings.css'
import { fetchApi } from "~src/api/utilities";

const Settings: Route['component'] = async () => {
    const root = document.createElement('main')

    root.setAttribute('id', 'settings-content')
    root.innerHTML = `
        <h1 class="text-center">ACCOUNT SETTINGS</h1>
        <div id="settings-container">
            <nav id="settings-nav">
                <span class="settings-spans" id="account-info">Account Information</span>
                <span class="settings-spans" id="notification-settings">Notification Settings</span>
                <span class="settings-spans" id="logout">Logout</span>
            </nav>
            ${AccountInfo()}
        </div>
    `

    const accountInfoSpan = root.querySelector('#account-info')
    const notificationSettingSpan = root.querySelector('#notification-settings')
    const logoutSpan = root.querySelector('#logout')

    accountInfoSpan?.addEventListener('click', () => AccountInfo(<HTMLDivElement>root.querySelector('#settings-container')))
    notificationSettingSpan?.addEventListener('click', () => NotificationSettings(<HTMLDivElement>root.querySelector('#settings-container')))
    logoutSpan?.addEventListener('click', async () => {
        try {
            // NOTE: Update Backend to support logging out (terminate user token). Remove user from localstorage.
            await fetchApi('/auth/logout', { method: 'POST' })
        } catch (e) {
            const error = <Error>e
            console.error(error)
        } finally {
            localStorage.removeItem('currentUser')
            navigateTo('/login')
        }
    })

    return Layout(root, true)
}

export default Settings