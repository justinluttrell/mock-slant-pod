// Order-related type definitions - Official Slant3D API format only
// Based on confirmed Slant3D API response structures

import type { Address, EmailAddress, QuantityString, ResidentialFlag } from './api.js'

// Order status progression: pending → printing → printed → shipped → cancelled
export type OrderStatus = 'pending' | 'printing' | 'printed' | 'shipped' | 'cancelled'

// Filament profiles available  
export type FilamentProfile = 'PLA' | 'PETG' | string

// Filament definition interface
export interface Filament {
	filament: string    // Display name like "PLA BLACK"
	hexColor: string   // Color code without # prefix
	colorTag: string   // Short name like "black"
	profile: FilamentProfile  // Material type
}

// Official Slant3D API Order Item Structure
export interface SlantOrderItem {
	email: string
	phone: string
	name: string
	orderNumber: string
	filename: string
	fileURL: string
	bill_to_street_1: string
	bill_to_street_2?: string
	bill_to_street_3?: string
	bill_to_city: string
	bill_to_state: string
	bill_to_zip: string
	bill_to_country_as_iso: string
	bill_to_is_US_residential: string
	ship_to_name: string
	ship_to_street_1: string
	ship_to_street_2?: string
	ship_to_street_3?: string
	ship_to_city: string
	ship_to_state: string
	ship_to_zip: string
	ship_to_country_as_iso: string
	ship_to_is_US_residential: string
	order_item_name: string
	order_quantity: string
	order_image_url?: string
	order_sku?: string
	order_item_color: string
	profile?: string
}

// Official Slant3D API Create Order Request (array of order items)
export type SlantCreateOrderRequest = SlantOrderItem[]

// Complete order interface (internal storage format)
export interface Order {
	orderId: string
	orderNumber: string
	status: OrderStatus
	filename: string
	fileURL: string
	quantity: QuantityString
	color: string
	profile: FilamentProfile
	totalPrice: number
	shippingCost: number
	printingCost: number
	trackingNumbers: string[]
	createdAt: Date
	updatedAt: Date
	// Customer details
	billingAddress: Address
	shippingAddress: Address
	email: EmailAddress
	residential: ResidentialFlag
}

// Order estimation request interface - Official Slant3D API format
// Uses the same full order array format as create order
export type SlantOrderEstimateRequest = SlantOrderItem[]

// Order estimation response (confirmed from API testing)
export interface OrderEstimateResponse {
	totalPrice: number
	shippingCost: number
	printingCost: number
}

// Shipping estimation request interface - Official Slant3D API format  
// Uses the same full order array format as create order
export type SlantShippingEstimateRequest = SlantOrderItem[]

// Shipping estimation response (confirmed format)
export interface ShippingEstimateResponse {
	shippingCost: number
	currencyCode: 'usd'
}

// Slicer request interface
export interface SlicerRequest {
	fileURL: string
	filename?: string
	quantity: QuantityString
	color: string
	profile: FilamentProfile
}

// Order tracking response format (confirmed from actual API)
export interface OrderTrackingResponse {
	status: string
	trackingNumbers: string[]
}

// Order creation response - Official Slant3D API format
export interface SlantCreateOrderResponse {
	orderId: string
}

// Order cancellation response - Official Slant3D API format  
export interface SlantCancelOrderResponse {
	status: 'Order cancelled'
}

// GET /api/order response (list all orders) - Official Slant3D API format
export interface OrdersListResponse {
	ordersData: Array<{
		orderId: number
		orderTimestamp: {
			_seconds: number
			_nanoseconds: number
		}
	}>
} 