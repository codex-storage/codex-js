import { ValueErrorIterator } from "@sinclair/typebox/build/cjs/errors"

type ValidationError = {
	path: string
	message: string
}

/**
  *  The CodexError which can be error object of 3 types: 
  * `error`: Object containing the error message
  * `api`: Object containing the api error message and the status code 
  * `validation`: Object containing the error message and a field `errors` of type ValidationError 
  * containing the error message for each fields.   
 */
export type CodexError = {
	type: "error"
	message: string
} | {
	type: "api"
	message: string
	status: number
} | {
	type: "validation"
	message: string
	errors: ValidationError[]
}

export const CodexValidationErrors = {
	map(iterator: ValueErrorIterator) {
		let error
		const errors = []

		while (error = iterator.First()) {
			errors.push({
				path: error.path,
				message: error.message
			})
		}

		return errors
	}
}

// export class CodexError extends Error {
// 	readonly status: number | null

// 	constructor(message: string, status: number | null = null) {
// 		super(message)
// 		this.status = status
// 	}
// }
