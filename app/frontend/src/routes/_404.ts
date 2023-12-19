import ErrorLayout from "~src/layout/error"

import NotFoundImg from "~src/assets/images/404-image.png"

const NotFound = () => {
  const root = document.createElement('main')

  root.innerHTML = `
    <h1>PAGE NOT FOUND!</h1>
    <img src="${NotFoundImg}" alt="404 not found image">
    <p> Woaaa where ya goin'? Let's get you back <a class="error-home-link" href="/" data-link>Home</a></p>
  `

  return ErrorLayout(root)
}

export default NotFound
