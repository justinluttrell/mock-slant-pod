// Validation helpers and utility types
// Type-safe validation utilities

import type { ResidentialFlag, QuantityString, EmailAddress } from '@/types/api.js'
import type { FilamentProfile } from '@/types/orders.js'

// URL validation
export function isValidUrl(url: string): boolean {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

// Email validation (basic)
export function isValidEmail(email: string): email is EmailAddress {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

// Residential flag validation
export function isValidResidential(value: string): value is ResidentialFlag {
	return value === 'true' || value === 'false'
}

// Quantity validation (string integer)
export function isValidQuantity(value: string): value is QuantityString {
	const num = parseInt(value, 10)
	return !isNaN(num) && num > 0 && num.toString() === value
}

// Filament profile validation
export function isValidProfile(value: string): value is FilamentProfile {
	return value === 'PLA' || value === 'PETG'
}

// ZIP code validation (basic US format)
export function isValidZipCode(zip: string): boolean {
	const zipRegex = /^\d{5}(-\d{4})?$/
	return zipRegex.test(zip)
}

// State validation (US states)
export function isValidState(state: string): boolean {
	const states = [
		'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
		'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
		'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
		'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
		'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
	]
	return states.includes(state.toUpperCase())
}

// Validate API key (accepts any non-empty string)
export function isValidApiKey(apiKey: string): boolean {
	return typeof apiKey === 'string' && apiKey.trim().length > 0
}

// Type guards for runtime validation
export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !isNaN(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
} 