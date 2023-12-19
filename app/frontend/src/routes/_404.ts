<<<<<<< Updated upstream
=======
import ErrorLayout from "~src/layout/error"

import NotFoundImg from "~src/assets/images/404-image.png"

>>>>>>> Stashed changes
const NotFound = () => {
  const root = document.createElement('main')

  root.innerHTML = `
<<<<<<< Updated upstream
    <main>
      <h1>Page Not Found</h1>
      <a href="/" data-link>Back Home</a>
    </main>
  `

  return root
=======
    <h1>PAGE NOT FOUND!</h1>
    <img src="${NotFoundImg}" alt="404 not found image">
    <p> Woaaa where ya goin'? Let's get you back <a class="error-home-link" href="/" data-link>Home</a></p>
  `

  return ErrorLayout(root)
>>>>>>> Stashed changes
}

export default NotFound
