import ErrorLayout from '~src/layout/error'

import InternalError from '~src/assets/images/500-image.jpg'

const ServerError = () => {
  const root = document.createElement('main')

  root.innerHTML = `
    <h1>INTERNAL ERROR!</h1>
    <figure>
      <img src="${InternalError}" alt="500 internal server error image">
      <figcaption>
        <a href="https://www.freepik.com/free-vector/500-internal-server-error-concept-illustration_7906229.htm#query=500%20error&position=8&from_view=search&track=ais&uuid=bb34b5d1-440b-443d-9698-6e475d74a558"> 
          Image by storyset 
        </a> 
          on Freepik
      </figcaption>
    </figure>
    <p> Woaaa we messed up. Sorry let's try that again <span class="error-home-link">Go Back</span></p>
  `

  root.querySelector('.error-home-link')?.addEventListener('click', () => {
    history.back()
  })

  return ErrorLayout(root)
}

export default ServerError