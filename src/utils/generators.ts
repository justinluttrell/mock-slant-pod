// ID and mock data generators
// Utilities for generating realistic mock data

// Generate 10-digit order ID
export function generateOrderId(): string {
	const min = 1000000000 // 10 digits
	const max = 9999999999
	return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

// Generate order number (different format from ID)
export function generateOrderNumber(): string {
	const prefix = 'ORD'
	const timestamp = Date.now().toString().slice(-8)
	const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
	return `${prefix}-${timestamp}-${random}`
}

// Generate tracking number (realistic format)
export function generateTrackingNumber(): string {
	const carriers = ['1Z', '92', '94'] // UPS, USPS, FedEx-like prefixes
	const carrier = carriers[Math.floor(Math.random() * carriers.length)]!
	
	if (carrier === '1Z') {
		// UPS-like format: 1Z999AA1234567890
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		const numbers = '0123456789'
		
		let tracking = '1Z'
		for (let i = 0; i < 6; i++) {
			tracking += numbers[Math.floor(Math.random() * numbers.length)]!
		}
		for (let i = 0; i < 2; i++) {
			tracking += letters[Math.floor(Math.random() * letters.length)]!
		}
		for (let i = 0; i < 10; i++) {
			tracking += numbers[Math.floor(Math.random() * numbers.length)]!
		}
		return tracking
	} else {
		// USPS/FedEx-like format: 9400123456789012345678
		let tracking = carrier
		for (let i = 0; i < 20; i++) {
			tracking += Math.floor(Math.random() * 10).toString()
		}
		return tracking
	}
}

// Generate webhook delivery ID
export function generateWebhookId(): string {
	return `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate API request log ID
export function generateLogId(): string {
	return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate mock pricing with variability
export function generateMockPrice(basePrice: number, multiplierRange: [number, number] = [1.2, 3.5]): number {
	const [min, max] = multiplierRange
	const multiplier = Math.random() * (max - min) + min
	const price = basePrice * multiplier
	return Math.round(price * 100) / 100 // Round to 2 decimal places
}

// Generate shipping cost - always $5.62 (matches confirmed API response)
export function generateShippingCost(): number {
	return 5.62
}

// Generate realistic delay (in milliseconds)
export function generateDelay(minMs: number, maxMs: number): number {
	return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
}

// Generate random file complexity factor for pricing
export function generateComplexityFactor(): number {
	// Simulate file complexity analysis results
	const factors = [
		0.8,  // Simple object
		1.0,  // Standard complexity  
		1.3,  // Moderate complexity
		1.8,  // Complex geometry
		2.5   // Very complex
	]
	const selectedFactor = factors[Math.floor(Math.random() * factors.length)]
	if (selectedFactor === undefined) {
		return 1.0 // Fallback to standard complexity
	}
	return selectedFactor
}

// Type-safe random selection from array
export function randomChoice<T>(array: T[]): T {
	if (array.length === 0) {
		throw new Error('Cannot select from empty array')
	}
	const selected = array[Math.floor(Math.random() * array.length)]
	if (selected === undefined) {
		throw new Error('Array selection failed')
	}
	return selected
}

// Generate mock weight based on quantity
export function generateWeight(quantity: number): number {
	const baseWeight = 0.1 // 100g base weight
	const variation = Math.random() * 0.05 // ±50g variation
	return Math.round((baseWeight + variation) * quantity * 100) / 100
}

// Calculate shipping cost with ZIP code modifiers
// Base shipping cost is always $5.62 (confirmed from API)
export function calculateShippingCost(zipCode: string, residential: string): number {
	const baseShippingCost = 5.62 // Confirmed base shipping cost
	
	// ZIP code modifiers for realistic variation
	const zipPrefix = zipCode.substring(0, 2)
	let modifier = 1.0
	
	// Apply regional modifiers based on ZIP code prefixes
	switch (zipPrefix) {
		// West Coast (CA, OR, WA, NV) - higher shipping
		case '90': case '91': case '92': case '93': case '94': case '95': case '96':
		case '97': case '98': case '89':
			modifier = 1.2
			break
		// East Coast (NY, NJ, CT, MA, etc.) - moderate shipping
		case '10': case '11': case '06': case '07': case '08': case '09':
		case '02': case '03': case '04': case '05':
			modifier = 1.0
			break
		// Midwest (IL, IN, OH, MI, etc.) - lower shipping
		case '60': case '61': case '46': case '47': case '43': case '44': case '48': case '49':
			modifier = 0.9
			break
		// South (TX, FL, GA, etc.) - moderate shipping
		case '77': case '78': case '79': case '33': case '34': case '32': case '30': case '31':
			modifier = 1.0
			break
		// Mountain/Central states - higher shipping
		case '80': case '81': case '82': case '83': case '84': case '85': case '86': case '87': case '88':
			modifier = 1.15
			break
		default:
			modifier = 1.0
			break
	}
	
	// Residential addresses get small additional fee
	if (residential === 'true') {
		modifier += 0.05
	}
	
	// Apply modifier and round to 2 decimal places
	const finalCost = Math.round((baseShippingCost * modifier) * 100) / 100
	
	// Ensure minimum shipping cost
	return Math.max(finalCost, 3.99)
} 