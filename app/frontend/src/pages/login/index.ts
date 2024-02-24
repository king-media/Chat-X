import { isNotBlank } from '@chatx/shared'
import Layout from '~src/layout'
import { navigateTo, type Route } from '~src/main'
import { authenticate, getCurrentUser } from '~src/api/auth'
import { FormBody } from '~src/api/types'

import { type FormSchema, userNameFormat, passwordFormat, validateForm, emailFormat } from '~src/utils/forms'
import { type IFormSubmitEvent } from '~src/utils/types'

import '~src/pages/login/assets/login.css'

type FormType = 'signin' | 'signup'

const Login: Route['component'] = async (props) => {
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
        },
        confirmPassword: {
            required: true,
            min: 8,
            max: 25,
            match: 'password',
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
        <form id="login-form" class="flex flex-col">
            <button id="backBtn" class="w-20 mb-10 rounded-md bg-lime-700 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-700">Back</button>
            <div class="space-y-12">
                <div class="border-b border-gray-900/10 pb-12">
                    <h2 class="text-xl font-semibold">Sign Up</h2>
                    <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div class="sm:col-span-4 md:col-span-12">
                            <label for="username" class="block text-lg font-medium leading-6">Username</label>
                            <div class="mt-2">
                                <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-lime-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-mdk bg-slate-200">
                                    <span class="flex select-none items-center pl-3 text-gray-600 sm:text-sm">Required:</span>
                                    <input type="text" name="username" id="username" autocomplete="username" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="janesmith">
                                </div>
                                <span id="username-error"></span><br>
                            </div>
                        </div>
                        <div class="sm:col-span-4 md:col-span-12">
                            <label for="email" class="block text-lg font-medium leading-6">Email</label>
                            <div class="mt-2">
                                <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-lime-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-mdk bg-slate-200">
                                    <span class="flex select-none items-center pl-3 text-gray-600 sm:text-sm">Required:</span>
                                    <input type="email" name="email" id="email" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="janesmith@email.com">
                                </div>
                                <span id="email-error"></span><br>
                            </div>
                        </div>
                        <div class="sm:col-span-4 md:col-span-12">
                            <label for="password" class="block text-lg font-medium leading-6">Password</label>
                            <div class="mt-2">
                                <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-lime-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-mdk bg-slate-200">
                                    <span class="flex select-none items-center pl-3 text-gray-600 sm:text-sm">Required:</span>
                                    <input type="password" name="password" id="password" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="*****">
                                </div>
                                <span id="password-error"></span><br>
                            </div>
                        </div>
                          <div class="sm:col-span-4 md:col-span-12">
                            <label for="confirmPassword" class="block text-lg font-medium leading-6">Confirm Password</label>
                            <div class="mt-2">
                                <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-lime-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-mdk bg-slate-200">
                                    <span class="flex select-none items-center pl-3 text-gray-600 sm:text-sm">Required:</span>
                                    <input type="password" name="confirmPassword" id="confirmPassword" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="*****">
                                </div>
                                <span id="confirmPassword-error"></span><br>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="w-1/2 m-auto rounded-md bg-lime-700 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-700">Submit</button>
        </form>
        `
    }

    const SignIn = () => {
        return `
        <form id="login-form" class="flex flex-col">
            <div class="space-y-12">
                <div class="border-b border-gray-900/10 pb-12">
                    <h2 class="text-xl font-semibold">Sign In</h2>
                    <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div class="sm:col-span-4 md:col-span-12">
                            <label for="username" class="block text-lg font-medium leading-6">Username</label>
                            <div class="mt-2">
                                <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-lime-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-mdk bg-slate-200">
                                    <span class="flex select-none items-center pl-3 text-gray-600 sm:text-sm">Required:</span>
                                    <input type="text" name="username" id="username" autocomplete="username" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="janesmith">
                                </div>
                                <span id="username-error"></span><br>
                            </div>
                        </div>
                        <div class="sm:col-span-4 md:col-span-12">
                            <label for="password" class="block text-lg font-medium leading-6">Password</label>
                            <div class="mt-2">
                                <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-lime-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-lime-600 sm:max-w-mdk bg-slate-200">
                                    <span class="flex select-none items-center pl-3 text-gray-600 sm:text-sm">Required:</span>
                                    <input type="password" name="password" id="password" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="*****">
                                </div>
                                <span id="password-error"></span><br>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="w-1/2 m-auto rounded-md bg-lime-700 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-700">Submit</button>
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

    /*
        Auth Flow:
        - Signup/Signin:
            * Payload: { username, email(signup), password }
            * The user sends the above payload I authenticate (OAuth) and send back { token, user }
            * If the user is signing up I add the user to the DB
            * I store the return auth DTO in local storage & state.
            * I then send the user.id on socket handshake request (onConnect) and Update the user in the DB w/ the connectionId
            * On the client, I use "onconnect" in order to confirm connection and setup the UI. I also store new user data w/ connectionId in state.
                - A "init" message within the "onconnect" function in order to get connectionId, chatList and chatRoom data for rendering.
        - Returning User (Authed):
            * Get user data from local storage. (I always update local storage on disconnect so this data should be good to go.)
            + Run the above $connect steps.
    */
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
            const authUser = await authenticate(signin, <FormBody>body)

            if (isNotBlank(authUser)) {
                props?.appState?.setState({ user: authUser })
                navigateTo("/")
            } else {
                throw new Error("connection not established")
            }
        }

        validation.errors?.forEach(error => {
            const field = <string>Object.keys(error).find(key => (
                elements.some(elem => (elem as HTMLFormElement).name === key))
            )

            const fieldErrorElem = <Element>document.querySelector(`#${field}-error`)

            fieldErrorElem.innerHTML = ''

            error[field].forEach(errorMessage => {
                fieldErrorElem.classList.add("font-bold", "text-red-500")
                fieldErrorElem.innerHTML = `${fieldErrorElem.innerHTML}<br>${errorMessage}`
            })
        })

    }

    const signUpMessage = `
    <div id="signupMessage" class="px-4 py-12 grid gap-y-4">
        <h2 class="text-xl font-semibold">No Account?</h2>
        <p>Sign up below to start chatting</p>
        <button id="signup-btn" type="submit" class="w-24 rounded-md bg-lime-700 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-700">Sign Up</button>
    </div>
    `

    const setForm = (type: FormType) => {
        const main = root.querySelector('main')
        const oldForm = root.querySelector('form')
        const isSignIn = type === "signin"

        oldForm?.remove()
        main?.insertAdjacentHTML('afterbegin', returnForm(type))
        main?.querySelector('form')?.addEventListener('submit', (e) => handleSubmit(e, isSignIn))

        if (isSignIn) {
            main?.insertAdjacentHTML('beforeend', signUpMessage)
            main?.querySelector('#signup-btn')?.addEventListener('click', () => setForm('signup'))
        } else {
            main?.removeChild(main.querySelector('#signupMessage') as HTMLDivElement)
            main?.querySelector('#backBtn')?.addEventListener('click', () => setForm('signin'))
        }
    }


    root.classList.add("flex", "justify-center")
    root.innerHTML = `
        <main id="login" class="flex flex-col w-1/3">
            ${returnForm()}
            ${signUpMessage}
        </main>`

    const signupBtn = root.querySelector('#signup-btn')
    signupBtn?.addEventListener('click', () => setForm('signup'))


    root.querySelector('form')?.addEventListener('submit', (e) => handleSubmit(e, true))

    return Layout(root)
}

export default Login
