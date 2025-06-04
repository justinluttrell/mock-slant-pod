// Main types index - exports all type definitions
// Centralized exports for easy importing

// Core API types
export type {
	ApiResponse,
	ApiKeyError,
	ValidationError,
	SuccessResponse,
	SliceResponse,
	ApiHeaders,
	ResidentialFlag,
	QuantityString,
	FileUploadRequest,
	BaseApiRequest,
	Address,
	EmailAddress
} from './api.js'

// Order-related types - Official Slant3D API format only
export type {
	OrderStatus,
	FilamentProfile,
	Filament,
	Order,
	OrderEstimateResponse,
	ShippingEstimateResponse,
	SlicerRequest,
	OrderTrackingResponse,
	OrdersListResponse,
	SlantOrderItem,
	SlantCreateOrderRequest,
	SlantCreateOrderResponse,
	SlantCancelOrderResponse,
	SlantOrderEstimateRequest,
	SlantShippingEstimateRequest
} from './orders.js'

// Response schemas
export type {
	FilamentListResponse,
	SlicerResponse,
	EstimateOrderResponse,
	EstimateShippingResponse,
	CreateOrderApiResponse,
	GetTrackingResponse,
	ListOrdersResponse,
	CancelOrderResponse,
	Webhook,
	WebhookDelivery,
	SubscribeWebhookRequest,
	SubscribeWebhookResponse,
	WebhookPayload,
	DashboardStats,
	ApiRequestLog,
	HealthResponse,
	ErrorResponse,
	AnyApiResponse,
	MockConfig,
	MockStorage
} from './responses.js'

// Re-export utility functions for convenience
export {
	isValidUrl,
	isValidEmail,
	isValidResidential,
	isValidQuantity,
	isValidProfile,
	isValidZipCode,
	isValidState,
	isValidApiKey,
	isString,
	isNumber,
	isObject
} from '../utils/validators.js'

export {
	generateOrderId,
	generateOrderNumber,
	generateTrackingNumber,
	generateWebhookId,
	generateLogId,
	generateMockPrice,
	generateShippingCost,
	generateDelay,
	generateComplexityFactor,
	randomChoice,
	generateWeight
} from '../utils/generators.js' 