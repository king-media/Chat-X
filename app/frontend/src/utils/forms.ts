import { isBlank } from "~/utils/guards";
import { capitalize } from "~/utils/strings";

export type FormSchema = {
    [key: string]: {
        required: boolean;
        min?: number;
        max?: number;
        format: RegExp;
    }
}

export type FormValidation = {
    isValid: boolean;
    errors?: Record<string, string[]>[]
}
/**
 * @remarks {@link userNameFormat userNameFormat}
 * 
 * Global RegExp for the username that matches so long as there are no special characters outside of a dot or underscore.
 */

export const userNameFormat = /^(?=.*)(?!.*[^a-zA-Z0-9._])(.*)/g

/**
 * @remarks {@link passwordFormat passwordFormat}
 * 
 * Global RegExp for password that matches so long as you have one capital letter, and one special character listed below:
 * [&*+._\-~?$!]
 */

export const passwordFormat = /^(?=.*[&*+._\-~?$!])(?=.*[A-Z])(?!.*[^a-zA-Z0-9&*+._\-~?$!])(.*)/g
export const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/g

export const generateFormErrorMessage = (errors: { [key: string]: Record<string, boolean> }, schema: FormSchema) => {
    // { password: { length: false }}
    const errorMessages: Record<string, string[]> = {} // { password: ['Bad length', 'Bad format']}

    const field = String(Object.keys(errors).pop())
    const fieldErrors = errors[field]
    const fieldSchema = schema[field]

    errorMessages[field] = []
    if (!fieldErrors.required) {
        errorMessages[field].push(`${capitalize(field)} is required!`)
    }

    if (!fieldErrors.length) {
        errorMessages[field].push(`${capitalize(field)} must be within ${fieldSchema.min} to ${fieldSchema.max} characters long!`)
    }

    if (!fieldErrors.format) {
        errorMessages[field].push(`${capitalize(field)} format is wrong please check field requirements!`)
    }

    return errorMessages
}

export const validateForm = (schema: FormSchema, form: Record<string, string>): FormValidation => {
    const formProperties = Object.keys(form)
    const validations: Record<string, Record<string, boolean>> = {}

    formProperties.forEach(prop => {
        validations[prop] = {
            required: validateRequired(schema, form, prop),
            length: validateLength(schema, form, prop),
            format: validateFormat(schema, form, prop)
        }
    })

    const errors = Object.keys(validations).filter(validation => {
        const checks = validations[validation]

        return Object.values(checks).some(check => !check)
    })
        .map(nonValid => (generateFormErrorMessage({ [nonValid]: validations[nonValid] }, schema)))

    if (errors.length > 0) {
        return { isValid: false, errors }
    }

    return { isValid: true }
}

const validateRequired = (schema: FormSchema, form: Record<string, string>, prop: string) => {
    if (schema[prop].required) {
        return Object.prototype.hasOwnProperty.call(form, prop) && form[prop] !== ""
    }

    return true
}

const validateLength = (schema: FormSchema, form: Record<string, string>, prop: string) => {
    const propLength = form[prop].length
    const minLength = schema[prop].min
    const maxLength = schema[prop].max

    if (minLength && maxLength) {
        return propLength >= minLength && propLength <= maxLength
    }

    return true
}

/**
 * @remarks {@link validateFormat validateFormat()} checks if a given value is falsy
 *
 * @param {FormSchema} schema The schema that holds the regex for the field format.
 * @param {Record<string, string>} form The HTML form.
 * @param {string} field The input field that is being checked.
 *
 * @returns boolean
 *
 *
 */
const validateFormat = (schema: FormSchema, form: Record<string, string>, field: string) => {
    const match = form[field].match(schema[field].format)
    return !isBlank(match)
}