import { isString } from "@chatx/shared"
import { getCurrentUser } from "~src/api/auth"
import { unAuthError } from "@chatx/shared"

import '~src/layout/assets/layout.css'

const Layout = (children: string | Node, authRequired?: boolean): Node => {
    const root = document.createElement('div')
    const currentUser = getCurrentUser()

    if (authRequired && !currentUser) {
        throw new Error(unAuthError)
    }

    root.setAttribute('id', "layout")

    root.innerHTML = `
        <header id="layout-header">
            <nav>
                <h2>
                    <a id="home-link" href="/" data-link> Chat X</a>
                </h2>
                ${currentUser ? (
            `<h2 class="text-center">Logged in as <span class="primary">${currentUser.user.username}</span></h2>`
        ) : ''}
                <a href="/settings" data-link>
                    <span class="nav-links">settings</span>
                </a>
            </nav>
        </header>
        ${isString(children) ? children : ''}
    `

    if (!isString(children)) {
        root.append(children)
    }

    return root
}

export default Layout