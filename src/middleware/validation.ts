// Request validation middleware
// Validates request data and returns proper error formats

import type { Context, Next } from 'hono'
import type { ValidationError } from '@/types/index.js'
import { 
	isValidResidential, 
	isValidQuantity, 
	isValidProfile, 
	isValidEmail,
	isValidZipCode,
	isValidUrl 
} from '@/utils/validators.js'

// Validation error helper
function createValidationError(field: string, message: string, code: string = 'INVALID_FORMAT'): ValidationError {
	return {
		error: 'Validation failed',
		details: [{
			field,
			message,
			code
		}]
	}
}

// Middleware for slicer request validation
export async function validateSlicerRequest(c: Context, next: Next) {
	try {
		const body = await c.req.json()
		
		// Required fields
		if (!body.fileURL) {
			return c.json(createValidationError('fileURL', 'File URL is required', 'REQUIRED_FIELD'), 400)
		}
		
		if (!body.quantity) {
			return c.json(createValidationError('quantity', 'Quantity is required', 'REQUIRED_FIELD'), 400)
		}
		
		if (!body.color) {
			return c.json(createValidationError('color', 'Color is required', 'REQUIRED_FIELD'), 400)
		}
		
		if (!body.profile) {
			return c.json(createValidationError('profile', 'Profile is required', 'REQUIRED_FIELD'), 400)
		}
		
		// Validate field formats
		if (!isValidUrl(body.fileURL)) {
			return c.json(createValidationError('fileURL', 'Invalid URL format', 'INVALID_URL'), 400)
		}
		
		if (!isValidQuantity(body.quantity)) {
			return c.json(createValidationError('quantity', 'Quantity must be a positive integer string (e.g., "1", "5")', 'INVALID_QUANTITY'), 400)
		}
		
		if (!isValidProfile(body.profile)) {
			return c.json(createValidationError('profile', 'Profile must be "PLA" or "PETG"', 'INVALID_PROFILE'), 400)
		}
		
		await next()
	} catch (error) {
		return c.json(createValidationError('body', 'Invalid JSON in request body', 'INVALID_JSON'), 400)
	}
} 