const NotFound = () => {
  const root = document.createElement('main')

  root.innerHTML = `
    <main>
      <h1>Page Not Found</h1>
      <a href="/" data-link>Back Home</a>
    </main>
  `

  return root
}

export default NotFound
