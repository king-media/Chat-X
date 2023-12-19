
import { isString } from "@chatx/shared"

import '~src/layout/assets/layout.css'

const ErrorLayout = (children: string | Node): Node => {
    const root = document.createElement('div')
    root.id = "error-layout"

    root.innerHTML = `
        <header id="layout-header">
            <nav>
                <h2>
                    <a id="home-link" href="/" data-link> Chat X</a>
                </h2>
            </nav>
        </header>
        ${isString(children) ? children : ''}
    `

    if (!isString(children)) {
        root.append(children)
    }

    return root
}

export default ErrorLayout