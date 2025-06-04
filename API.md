# Mock Slant3D API Documentation

**🎯 Complete API reference for 1:1 production-compatible Slant3D Print Factory API**

This documentation covers all endpoints, request/response formats, and authentication methods for the Mock Slant3D API server. As of 6/4/2025 all formats match the official Slant3D API specification exactly.

## Table of Contents

- [Authentication](#authentication)
- [Core API Endpoints](#core-api-endpoints)
- [Dashboard & Testing Endpoints](#dashboard--testing-endpoints)
- [Data Models & Types](#data-models--types)
- [Error Handling](#error-handling)
- [Webhook System](#webhook-system)
- [Rate Limiting & CORS](#rate-limiting--cors)

## Authentication

### API Key Authentication

Protected endpoints require authentication using the `api-key` header:

```http
api-key: YOUR_API_KEY
```

### Development API Keys

For development and testing, any non-empty string is accepted as a valid API key:

```bash
# Example requests
curl -H "api-key: test-key" http://localhost:4000/api/order
curl -H "api-key: my-dev-key" http://localhost:4000/api/slicer
curl -H "api-key: demo-123" http://localhost:4000/api/order/estimate
```

### Production Alignment

In production, use your actual Slant3D API key. The mock accepts any key for development convenience.

---

## Core API Endpoints

### 🎨 Filaments Catalog

Get available 3D printing materials and colors.

**Endpoint:** `GET /api/filament`  
**Authentication:** None required  

**Response:**
```json
{
  "filaments": [
    {
      "filament": "PLA BLACK",
      "hexColor": "000000",
      "colorTag": "black",
      "profile": "PLA"
    },
    {
      "filament": "PLA WHITE", 
      "hexColor": "FFFFFF",
      "colorTag": "white",
      "profile": "PLA"
    },
    {
      "filament": "PETG BLACK",
      "hexColor": "000000", 
      "colorTag": "black",
      "profile": "PETG"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:4000/api/filament
```

---

### 🔍 File Analysis (Slicer)

Analyze a 3D model file for printing specifications.

**Endpoint:** `POST /api/slicer`  
**Authentication:** Required (`api-key` header)

**Request Body:**
```json
{
  "fileURL": "https://example.com/models/robot-arm.stl"
}
```

**Response:**
```json
{
  "weight": 45.2,
  "volume": 38.7,
  "printTime": 180,
  "material": "PLA",
  "layerHeight": 0.2,
  "infill": 20,
  "supportMaterial": false,
  "estimatedCost": 12.50
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/slicer \
  -H "api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{"fileURL": "https://example.com/model.stl"}'
```

---

### 💰 Order Pricing Estimation

Calculate total pricing for an order before placing it.

**Endpoint:** `POST /api/order/estimate`  
**Authentication:** Required (`api-key` header)

**Request Body:** (Official Slant3D format - array of order items)
```json
[{
  "email": "customer@example.com",
  "phone": "+1-555-0123",
  "name": "John Doe",
  "orderNumber": "ORD-001",
  "filename": "robot-arm.stl",
  "fileURL": "https://example.com/files/robot-arm.stl",
  "bill_to_street_1": "123 Main St",
  "bill_to_city": "San Francisco",
  "bill_to_state": "CA",
  "bill_to_zip": "94105",
  "bill_to_country_as_iso": "US",
  "bill_to_is_US_residential": "true",
  "ship_to_name": "John Doe",
  "ship_to_street_1": "123 Main St",
  "ship_to_city": "San Francisco", 
  "ship_to_state": "CA",
  "ship_to_zip": "94105",
  "ship_to_country_as_iso": "US",
  "ship_to_is_US_residential": "true",
  "order_item_name": "Robot Arm",
  "order_quantity": "1",
  "order_item_color": "black",
  "profile": "PLA"
}]
```

**Response:**
```json
{
  "totalPrice": 18.52,
  "shippingCost": 4.99,
  "printingCost": 13.53
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/order/estimate \
  -H "api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '[{
    "email": "test@example.com",
    "name": "Test User",
    "orderNumber": "TEST-001",
    "filename": "test.stl",
    "fileURL": "https://example.com/test.stl",
    "bill_to_street_1": "123 Test St",
    "bill_to_city": "Test City",
    "bill_to_state": "CA",
    "bill_to_zip": "90210",
    "bill_to_country_as_iso": "US",
    "bill_to_is_US_residential": "true",
    "ship_to_name": "Test User",
    "ship_to_street_1": "123 Test St",
    "ship_to_city": "Test City",
    "ship_to_state": "CA",
    "ship_to_zip": "90210",
    "ship_to_country_as_iso": "US",
    "ship_to_is_US_residential": "true",
    "order_item_name": "Test Item",
    "order_quantity": "1",
    "order_item_color": "black"
  }]'
```

---

### 🚚 Shipping Cost Estimation

Calculate shipping costs for an order.

**Endpoint:** `POST /api/order/estimateShipping`  
**Authentication:** Required (`api-key` header)

**Request Body:** (Same format as order estimation)
```json
[{
  "ship_to_street_1": "123 Main St",
  "ship_to_city": "San Francisco",
  "ship_to_state": "CA", 
  "ship_to_zip": "94105",
  "ship_to_country_as_iso": "US",
  "ship_to_is_US_residential": "true",
  "order_quantity": "1"
}]
```

**Response:**
```json
{
  "shippingCost": 4.99,
  "currencyCode": "usd"
}
```

---

### 📦 Order Management

#### Create Order

Submit a new 3D printing order.

**Endpoint:** `POST /api/order`  
**Authentication:** Required (`api-key` header)

**Request Body:** (Official Slant3D format)
```json
[{
  "email": "customer@example.com",
  "phone": "+1-555-0123", 
  "name": "John Doe",
  "orderNumber": "ORD-001",
  "filename": "robot-arm.stl",
  "fileURL": "https://example.com/files/robot-arm.stl",
  "bill_to_street_1": "123 Main St",
  "bill_to_street_2": "Apt 4B",
  "bill_to_city": "San Francisco",
  "bill_to_state": "CA",
  "bill_to_zip": "94105", 
  "bill_to_country_as_iso": "US",
  "bill_to_is_US_residential": "true",
  "ship_to_name": "John Doe",
  "ship_to_street_1": "123 Main St",
  "ship_to_street_2": "Apt 4B",
  "ship_to_city": "San Francisco",
  "ship_to_state": "CA",
  "ship_to_zip": "94105",
  "ship_to_country_as_iso": "US", 
  "ship_to_is_US_residential": "true",
  "order_item_name": "Robot Arm",
  "order_quantity": "1",
  "order_item_color": "black",
  "profile": "PLA"
}]
```

**Response:**
```json
{
  "orderId": "1234567890"
}
```

#### List Orders (Minimal Format)

Get a list of orders with minimal information (official format).

**Endpoint:** `GET /api/order`  
**Authentication:** Required (`api-key` header)

**Response:**
```json
{
  "ordersData": [
    {
      "orderId": 3796987527,
      "orderTimestamp": {
        "_seconds": 1749010948,
        "_nanoseconds": 559000000
      }
    },
    {
      "orderId": 3796987528,
      "orderTimestamp": {
        "_seconds": 1749010950,
        "_nanoseconds": 123000000
      }
    }
  ]
}
```

**Example:**
```bash
curl -H "api-key: test-key" http://localhost:4000/api/order
```

#### Get Order Tracking

Get tracking information for a specific order.

**Endpoint:** `GET /api/order/{orderId}/get-tracking`  
**Authentication:** Required (`api-key` header)

**Response:**
```json
{
  "status": "SHIPPED",
  "trackingNumbers": ["TRACK123456789", "TRACK987654321"]
}
```

**Example:**
```bash
curl -H "api-key: test-key" http://localhost:4000/api/order/1234567890/get-tracking
```

#### Cancel Order

Cancel an existing order.

**Endpoint:** `DELETE /api/order/{orderId}`  
**Authentication:** Required (`api-key` header)

**Response:**
```json
{
  "status": "Order cancelled"
}
```

**Example:**
```bash
curl -X DELETE -H "api-key: test-key" http://localhost:4000/api/order/1234567890
```

---

### 🔗 Webhook Management

#### Subscribe to Webhooks

Register a webhook URL to receive order status updates.

**Endpoint:** `POST /api/customer/subscribeWebhook`  
**Authentication:** Required (`api-key` header)

**Request Body:**
```json
{
  "endPoint": "https://your-app.com/webhook/orders"
}
```

**Response:**
```json
{
  "message": "Endpoint Configured",
  "endPoint": "https://your-app.com/webhook/orders"
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/customer/subscribeWebhook \
  -H "api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{"endPoint": "https://example.com/webhook"}'
```

---

## Dashboard & Testing Endpoints

These endpoints provide administrative functions and testing capabilities.

### 📊 System Statistics

Get real-time system statistics.

**Endpoint:** `GET /api/dashboard/stats`  
**Authentication:** None required

**Response:**
```json
{
  "totalRequests": 1247,
  "activeOrders": 5,
  "registeredWebhooks": 3,
  "apiStatus": "healthy",
  "uptime": 86400
}
```

### 📋 Dashboard Orders

Get all orders with detailed information for dashboard management.

**Endpoint:** `GET /api/dashboard/orders`  
**Authentication:** None required

**Response:**
```json
{
  "orders": [
    {
      "orderId": "1234567890",
      "orderNumber": "ORD-001",
      "status": "printing",
      "filename": "robot-arm.stl",
      "color": "black",
      "quantity": "1",
      "totalPrice": 18.52,
      "createdAt": "2024-01-10T08:00:00Z",
      "email": "customer@example.com"
    }
  ],
  "totalCount": 1
}
```

### 🔗 Dashboard Webhooks

Get all registered webhooks.

**Endpoint:** `GET /api/dashboard/webhooks`  
**Authentication:** None required

**Response:**
```json
{
  "webhooks": [
    {
      "endPoint": "https://example.com/webhook",
      "registeredAt": "2024-01-10T08:00:00Z",
      "deliveryAttempts": []
    }
  ],
  "totalCount": 1
}
```

### 📝 API Request Logs

Get API request logs for monitoring.

**Endpoint:** `GET /api/dashboard/logs?limit=50`  
**Authentication:** None required

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)

**Response:**
```json
{
  "logs": [
    {
      "id": "req_1704963600_abc123",
      "timestamp": "2024-01-11T10:00:00Z",
      "method": "POST",
      "path": "/api/order", 
      "statusCode": 200,
      "duration": 45,
      "apiKey": "test-key"
    }
  ],
  "totalCount": 1
}
```

### 🧪 Webhook Testing (Proxy)

Test webhook delivery via server-side proxy to avoid CORS issues.

**Endpoint:** `POST /api/webhooks/test`  
**Authentication:** None required

**Request Body:**
```json
{
  "endPoint": "https://your-app.com/webhook/test",
  "orderId": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Test payload sent successfully",
  "payload": {
    "orderId": "1234567890",
    "status": "SHIPPED",
    "trackingNumber": "ABCDEF123456",
    "carrierCode": "usps"
  },
  "endPoint": "https://your-app.com/webhook/test"
}
```

---

## Data Models & Types

### Order Item (Official Slant3D Format)

```typescript
interface SlantOrderItem {
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
```

### Filament Definition

```typescript
interface Filament {
  filament: string      // Display name like "PLA BLACK"
  hexColor: string     // Color code without # prefix
  colorTag: string     // Short name like "black"
  profile: string      // Material type: "PLA" | "PETG"
}
```

### Order Status Types

```typescript
type OrderStatus = 
  | 'pending'   // Order received, not yet printing
  | 'printing'  // Currently being printed
  | 'printed'   // Printing complete, preparing to ship
  | 'shipped'   // Order shipped to customer
  | 'cancelled' // Order cancelled
```

### Firebase Timestamp Format

```typescript
interface FirebaseTimestamp {
  _seconds: number      // Unix timestamp in seconds
  _nanoseconds: number  // Additional nanoseconds precision
}
```

---

## Error Handling

### Error Response Format

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error, malformed JSON)
- `401` - Unauthorized (missing or invalid API key)
- `404` - Not Found (order ID not found, endpoint not found)
- `500` - Internal Server Error

### Authentication Errors

```json
{
  "error": "API key is required",
  "code": "MISSING_API_KEY"
}
```

### Validation Errors

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": "Missing required field: email"
}
```

---

## Webhook System

### Webhook Payload Format

When order status changes, registered webhooks receive:

```json
{
  "orderId": "1234567890",
  "orderNumber": "ORD-001",
  "status": "SHIPPED",
  "timestamp": "2024-01-15T10:00:00Z",
  "trackingNumbers": ["TRACK123456789"],
  "carrierCode": "usps"
}
```

### Webhook Delivery

- **Method:** POST
- **Content-Type:** application/json
- **Timeout:** 30 seconds
- **Retries:** 3 attempts with exponential backoff
- **User-Agent:** MockSlant3D-Webhooks/1.0

### Testing Webhooks

Use the webhook test proxy to avoid CORS issues during development:

```bash
curl -X POST http://localhost:4000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "endPoint": "https://webhook.site/your-unique-url",
    "orderId": "1234567890"
  }'
```

---

## Rate Limiting & CORS

### Rate Limiting

**Development:** No rate limiting applied  
**Production Simulation:** Can be configured with environment variables

### CORS Configuration

All origins allowed for development:

```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, api-key, Authorization
```

### Request Logging

All API requests are logged with:
- Timestamp
- HTTP method and path
- Status code and response time
- API key (partial, for security)
- Request/response bodies (configurable)

---

## Production vs Mock Differences

### Identical Behavior
✅ **Request/Response Formats** - Exact match  
✅ **Authentication** - Same api-key header  
✅ **Error Responses** - Identical structure  
✅ **Data Types** - String quantities, boolean flags  
✅ **Webhook Payloads** - Official format  

### Mock-Specific Features
🔧 **Dashboard Interface** - Web UI for monitoring  
🔧 **Webhook Test Proxy** - CORS-free testing  
🔧 **Development API Keys** - Any string accepted  
🔧 **Request Logging** - Complete API activity tracking  
🔧 **In-Memory Storage** - No persistent database  

### Migration to Production

Simply change the base URL and use your production API key:

```javascript
// Development
const API_BASE = 'http://localhost:4000/api'
const API_KEY = 'test-key'

// Production  
const API_BASE = 'https://api.slant3d.com/api'
const API_KEY = 'your-production-api-key'
```

---

**🎯 Ready to start? Check the [README](README.md) for setup instructions!** 