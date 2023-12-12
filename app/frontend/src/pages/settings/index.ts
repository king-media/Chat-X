import { Route, navigateTo } from "~/main";
import Layout from "~/layout";
import AccountInfo from "~/pages/settings/components/account-info";
import NotificationSettings from "~/pages/settings/components/notification-settings";

import '~/pages/settings/assets/settings.css'
import { fetchApi } from "~/api/helpers/fetch";

const Settings: Route['component'] = async () => {
    const root = document.createElement('main')

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

    accountInfoSpan?.addEventListener('click', (e) => AccountInfo(e, <HTMLDivElement>root.querySelector('#settings-container')))
    notificationSettingSpan?.addEventListener('click', (e) => NotificationSettings(e, <HTMLDivElement>root.querySelector('#settings-container')))
    logoutSpan?.addEventListener('click', async () => {
        try {
            await fetchApi('/auth/logout', { method: 'POST' })
        } catch (e) {
            const error = <Error>e
            console.log(error)
        } finally {
            localStorage.removeItem('currentUser')
            navigateTo('/login')
        }
    })

    return Layout(root, true)
}

export default Settings