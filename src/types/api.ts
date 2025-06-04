// API type definitions
// Based on confirmed Slant3D API response structures

export interface ApiResponse<T> {
	data?: T
	message?: string
	error?: string
	success?: boolean
}

// Error response format for missing API key (401)
export interface ApiKeyError {
	error: 'API key required' | 'Invalid API key'
}

// Complex validation error format (400) - JSON schema style
export interface ValidationError {
	error: string
	details: Array<{
		field: string
		message: string
		code: string
	}>
}

// Generic successful response with data
export interface SuccessResponse<T> {
	data: T
	message: string
}

// Slicing successful response format
export interface SliceResponse {
	message: 'Slicing successful'
	data: {
		price: string
	}
}

// Common request headers
export interface ApiHeaders {
	'api-key': string
	'Content-Type': 'application/json'
}

// Residential flag type - API requires string booleans
export type ResidentialFlag = boolean | 'true' | 'false'

// Quantity type - API requires string integers
export type QuantityString = string

// File URL validation
export interface FileUploadRequest {
	fileURL: string
	filename?: string
}

// Base API request interface
export interface BaseApiRequest {
	fileURL?: string
	filename?: string
}

// Common address interface for billing/shipping
export interface Address {
	firstName: string
	lastName: string
	companyName?: string
	address1: string
	address2?: string
	city: string
	state: string
	zip: string
	country: string
	phone?: string
}

// Email validation type
export type EmailAddress = string 