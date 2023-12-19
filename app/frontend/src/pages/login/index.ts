import { isNotBlank } from '@chatx/shared'
import Layout from '~src/layout'
import { navigateTo, type Route } from '~src/main'
import { authenticate, getCurrentUser } from '~src/api/auth'
import { FormBody } from '~src/api/types'

import { type FormSchema, userNameFormat, passwordFormat, validateForm, emailFormat } from '~src/utils/forms'
import { type IFormSubmitEvent } from '~src/utils/types'

import '~src/pages/login/assets/login.css'

type FormType = 'signin' | 'signup'

const Login: Route['component'] = async () => {
    if (isNotBlank(getCurrentUser())) {
        navigateTo('/')
    }

    const root = document.createElement('div')
    const signUpSchema: FormSchema = {
        username: {
            required: true,
            min: 1,
            max: 25,
            format: userNameFormat
        },
        email: {
            required: true,
            format: emailFormat
        },
        password: {
            required: true,
            min: 8,
            max: 25,
            format: passwordFormat
        }
    }

    const signInSchema: FormSchema = {
        username: {
            required: true,
            format: userNameFormat
        },
        password: {
            required: true,
            min: 8,
            max: 25,
            format: passwordFormat // change to require one uppercase and one special character
        }
    }

    const SignUp = () => {
        return `
        <form id="login-form">
            <label for="username">Username:</label><br>
            <input type="text" id="username" name="username"><br>
            <span id="username-error" class="form-hint">Cannot have whitespace or special characters.</span><br>
            <label for="email">Email:</label><br>
            <input type="email" id="email" name="email"><br>
            <span id="email-error" class="form-hint">Must be email format.</span><br>
            <label for="password">Password:</label><br>
            <input type="password" id="password" name="password"><br><br>
            <span id="password-error" class="form-hint">Password must contain one uppercase letter and one special character.</span><br>
            <input type="submit" value="Submit">
        </form>
        `
    }

    const SignIn = () => {
        return `
        <form id="login-form">
            <label for="username">Username: Required</label><br>
            <input type="text" id="username" name="username" placeholder="Username or Email"><br>
            <span id="username-error" class="form-error"></span><br>
            <label for="password">Password: Required</label><br>
            <input type="password" id="password" name="password"><br><br>
            <span id="password-error" class="form-error"></span><br>
            <input type="submit" value="Submit">
        </form>
        `
    }

    const returnForm = (formType: FormType = "signin") => {
        switch (formType) {
            case 'signin':
                return SignIn()

            case 'signup':
                return SignUp()
        }
    }

    const handleSubmit = async (e: SubmitEvent, signin: boolean): Promise<void> => {
        const event = <IFormSubmitEvent>e
        const elements = Array.from(event?.target?.elements)
        const errorSpans = document.querySelectorAll(`.form-error`)

        event.preventDefault()
        // clear any errors before submitting
        errorSpans.forEach(span => span.innerHTML = "")

        const body: Record<string, string> = {}

        elements.filter(input => (input as HTMLFormElement).name)
            .forEach(input => {
                const formInput = <HTMLFormElement>input
                body[formInput.name] = formInput.value
            })

        const validation = validateForm(signin ? signInSchema : signUpSchema, body)

        if (validation.isValid) {
            await authenticate(signin, <FormBody>body)
            navigateTo("/")
            return
        }

        validation.errors?.forEach(error => {
            const field = <string>Object.keys(error).find(key => (
                elements.some(elem => (elem as HTMLFormElement).name === key))
            )

            const fieldErrorElem = <Element>document.querySelector(`#${field}-error`)

            fieldErrorElem.innerHTML = ''

            error[field].forEach(errorMessage => {
                fieldErrorElem.className = 'form-error'
                fieldErrorElem.innerHTML = `${fieldErrorElem.innerHTML}<br>${errorMessage}`
            })
        })

    }

    const setForm = (type: FormType) => {
        const main = root.querySelector('main')
        const oldForm = root.querySelector('form')
        const isSignIn = type === "signin"

        oldForm?.remove()
        main?.insertAdjacentHTML('afterbegin', returnForm(type))
        main?.removeChild(main.querySelector('p') as HTMLParagraphElement)
        main?.querySelector('form')?.addEventListener('submit', (e) => handleSubmit(e, isSignIn))
    }


    root.innerHTML = `
        <main id="login">
            ${returnForm()}
        <p>Ready to start chatting <span id="signup-span">signup</span></p>
        </main>`

    const signupSpan = root.querySelector('#signup-span')
    signupSpan?.addEventListener('click', () => setForm('signup'))


    root.querySelector('form')?.addEventListener('submit', (e) => handleSubmit(e, true))

    return Layout(root)
}

export default Login
