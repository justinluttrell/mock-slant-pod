# Unofficial Mock Slant3D API

🎯 **Production-ready mock implementation of the Slant3D Print Factory API**

A lightweight, containerized mock server that provides **1:1 API format compatibility** with the official Slant3D API. Built with Bun + Hono + TypeScript for blazing-fast development testing.

![image](https://github.com/user-attachments/assets/1ea433e1-ca86-4006-9a1c-7628dc67d0b0)


## ✨ Features

- **🎯 Official Format Alignment**: Exact request/response formats matching production Slant3D API
- **🔧 Complete Toolkit**: API server + React dashboard + Docker support
- **📊 Real-time Dashboard**: Monitor orders, webhooks, and API activity
- **🔗 Webhook Testing**: Built-in proxy for CORS-free webhook testing
- **🐳 Docker Ready**: Production and development containers included
- **📝 Request Logging**: Complete API request/response tracking

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) >= 1.0.0
- Node.js 18+ (for Docker builds)
- Docker (optional)

### Local Development

```bash
# Clone and install
git clone <repository-url>
cd mock-slant-pod
bun install

# Start development server with hot reload
bun run dev

# Build and start dashboard
bun run build:web
```

### Access Points
- **API Server**: http://localhost:4000
- **Dashboard**: http://localhost:4000/dashboard  
- **Health Check**: http://localhost:4000/health
- **API Info**: http://localhost:4000/api

## 📋 API Endpoints

### Core Slant3D API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/filament` | List available 3D printing materials | ❌ |
| `POST` | `/api/slicer` | Analyze 3D model files | ✅ |
| `POST` | `/api/order/estimate` | Calculate order pricing | ✅ |
| `POST` | `/api/order/estimateShipping` | Calculate shipping costs | ✅ |
| `POST` | `/api/order` | Create new print order | ✅ |
| `GET` | `/api/order` | List orders (minimal format) | ✅ |
| `GET` | `/api/order/{id}/get-tracking` | Get order tracking info | ✅ |
| `DELETE` | `/api/order/{id}` | Cancel order | ✅ |
| `POST` | `/api/customer/subscribeWebhook` | Register webhook URL | ✅ |

### Dashboard & Testing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/dashboard/stats` | System statistics | ❌ |
| `GET` | `/api/dashboard/orders` | All orders (detailed) | ❌ |
| `GET` | `/api/dashboard/webhooks` | Registered webhooks | ❌ |
| `GET` | `/api/dashboard/logs` | API request logs | ❌ |
| `POST` | `/api/webhooks/test` | Test webhook (proxy) | ❌ |

## 🔐 Authentication

Use the `api-key` header for protected endpoints:

```bash
curl -H "api-key: your-test-key" \
     -H "Content-Type: application/json" \
     http://localhost:4000/api/order
```

**Development**: Any non-empty string works as an API key.

## 📋 Official API Format Examples

### Create Order (Official Slant3D Format)

```bash
curl -X POST http://localhost:4000/api/order \
  -H "api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '[{
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
  }]'
```

**Response:**
```json
{
  "orderId": "1234567890"
}
```

### List Orders (Firebase Timestamp Format)

```bash
curl -H "api-key: test-key" http://localhost:4000/api/order
```

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
    }
  ]
}
```

## 🎛️ Dashboard Features

The React dashboard provides comprehensive API monitoring:

### 📊 Overview
- Real-time system statistics
- API request metrics  
- Active order counts
- System uptime tracking

### 📦 Order Management
- View all orders with status filtering
- Update order statuses (pending → printing → shipped)
- Cancel orders with confirmation
- Real-time status updates

### 🔗 Webhook Management  
- Register new webhook endpoints
- Test webhooks with custom order IDs
- View delivery history and success rates
- CORS-free testing via server proxy

### 📝 API Logs
- Real-time request/response logging
- Method, endpoint, and status code tracking
- Response time monitoring
- API key usage analytics

### 🎨 Filaments Catalog
- Browse available 3D printing materials
- Color swatches and material properties
- PLA/PETG profile information

## 🐳 Docker Deployment

### Production Container

```bash
# Build production image
bun run docker:build

# Run production container
bun run docker:run

# Or use Docker Compose
bun run docker:up
```

### Development Container

```bash
# Build development image with hot reload
bun run docker:build:dev

# Run with volume mounting for live editing
bun run docker:run:dev

# Or use Docker Compose development profile
bun run docker:up:dev
```

## 🛠️ Development

### Project Structure

```
src/
├── index.ts              # Main server entry point
├── routes/               # API route handlers
│   ├── orders.ts         # Order management (official format)
│   ├── filaments.ts      # Materials catalog
│   ├── slicer.ts         # File analysis
│   ├── estimate.ts       # Pricing calculations
│   ├── webhooks.ts       # Webhook management
│   └── dashboard.ts      # Dashboard API
├── types/                # TypeScript definitions
│   ├── orders.ts         # Order interfaces (official format)
│   ├── api.ts            # Core API types
│   └── responses.ts      # Response schemas
├── services/             # Business logic
│   └── storage.ts        # In-memory data storage
├── middleware/           # Request middleware
│   └── auth.ts           # API key validation
├── utils/                # Helper functions
│   └── generators.ts     # ID and data generation
└── web/                  # React dashboard
    ├── components/       # UI components
    ├── api-client.ts     # Dashboard API client
    └── app.tsx           # Main dashboard app
```

### Available Scripts

```bash
# Development
bun run dev              # Start with hot reload
bun run build:web        # Build React dashboard

# Production  
bun run start            # Production server
bun run build            # Build server bundle

# Docker
bun run docker:build     # Build production image
bun run docker:up        # Start containers
bun run docker:down      # Stop containers
bun run docker:logs      # View container logs

# Code Quality
bun run type-check       # TypeScript validation
bun run lint             # ESLint checks
bun run format           # Prettier formatting
```

## 🎯 API Compatibility

### **1:1 Production Parity**

This mock provides **identical interface/contract parity** with the production Slant3D API. As changes are made to production API this mock will need to be updated.

✅ **Identical Request/Response Formats**
- Official snake_case field names
- Array-based order requests  
- Firebase timestamp structures
- Exact error response formats

✅ **Authentication Compatibility**
- Same `api-key` header requirement
- Compatible error responses

✅ **Data Type Alignment**
- String quantities, boolean flags
- Official filament color codes
- Standard address structures

### **Seamless Migration**

Applications built against this mock work with production by **only changing the base URL and API key**:

```javascript
// Development
const API_BASE = 'http://localhost:4000/api'

// Production  
const API_BASE = 'https://api.slant3d.com/api'
```

## 🔧 Configuration

### Environment Variables

```bash
PORT=4000                # Server port (default: 4000)
NODE_ENV=development     # Environment mode
```

### Mock Behavior

- **Orders**: Auto-generate IDs, calculate realistic pricing
- **Webhooks**: Simulate delivery with configurable delays  
- **Tracking**: Generate mock tracking numbers
- **Filaments**: Based on confirmed Slant3D materials catalog

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly  
4. Run quality checks: `bun run type-check && bun run lint`
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](https://mit-license.org/) file for details.

## 🔗 Related

- [Official Slant3D API](https://api-fe-two.vercel.app/Docs)
- [Bun Runtime](https://bun.sh)
- [Hono Web Framework](https://hono.dev)

---
