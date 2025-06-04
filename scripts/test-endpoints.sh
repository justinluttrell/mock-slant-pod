#!/bin/bash

# Mock Slant3D API Endpoint Testing Script - 1:1 Parity Version
# This script tests all available endpoints for validation and documentation

set -e

# Configuration
BASE_URL="http://localhost:4000"
API_KEY="test-api-key"
TEST_WEBHOOK_URL="https://webhook.site/test-endpoint"

echo "🧪 Mock Slant3D API Endpoint Testing (1:1 Parity)"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo "API Key: $API_KEY"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to make requests and check status
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_required=${4:-false}
    local description=$5
    
    echo -e "${BLUE}Testing:${NC} $method $endpoint - $description"
    
    # Build curl command
    local curl_cmd="curl -s -w 'HTTP_STATUS:%{http_code}' -X $method"
    
    if [ "$auth_required" = true ]; then
        curl_cmd="$curl_cmd -H 'api-key: $API_KEY'"
    fi
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
        if [ -n "$data" ]; then
            curl_cmd="$curl_cmd -d '$data'"
        fi
    fi
    
    curl_cmd="$curl_cmd $BASE_URL$endpoint"
    
    # Execute request
    local response=$(eval $curl_cmd)
    local http_status=$(echo "$response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
    local body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    # Check status and format output
    if [[ $http_status -ge 200 && $http_status -lt 300 ]]; then
        echo -e "${GREEN}✅ Success ($http_status)${NC}"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
        fi
    elif [[ $http_status -ge 400 && $http_status -lt 500 ]]; then
        echo -e "${YELLOW}⚠️  Client Error ($http_status)${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Error ($http_status)${NC}"
        echo "$body"
    fi
    echo ""
}

# Check if server is running
echo "🔍 Checking server status..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running at $BASE_URL${NC}"
    echo "Please start the server with: bun run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test Public Endpoints
echo "📋 PUBLIC ENDPOINTS"
echo "===================="

test_endpoint "GET" "/health" "" false "Health check"
test_endpoint "GET" "/api" "" false "API information"
test_endpoint "GET" "/api/filament" "" false "Filaments catalog (singular)"

# Test Protected Endpoints (these should fail without API key)
echo "🔒 PROTECTED ENDPOINTS (Without API Key)"
echo "========================================="

test_endpoint "POST" "/api/slicer" '{"fileURL": "https://example.com/test.stl"}' false "Slicer analysis (should fail)"
test_endpoint "POST" "/api/order" '[{"email":"test@example.com","phone":"123-456-7890","name":"John Doe","orderNumber":"TEST001","filename":"test.stl","fileURL":"https://example.com/test.stl","bill_to_street_1":"123 Main St","bill_to_city":"Test City","bill_to_state":"CA","bill_to_zip":"12345","bill_to_country_as_iso":"US","bill_to_is_US_residential":"true","ship_to_name":"John Doe","ship_to_street_1":"123 Main St","ship_to_city":"Test City","ship_to_state":"CA","ship_to_zip":"12345","ship_to_country_as_iso":"US","ship_to_is_US_residential":"true","order_item_name":"Test Item","order_quantity":"1","order_item_color":"black","profile":"PLA"}]' false "Order creation (should fail)"
test_endpoint "POST" "/api/customer/subscribeWebhook" '{"endPoint": "https://test.com"}' false "Webhook subscription (should fail)"

# Test Protected Endpoints (with API key)
echo "🔑 PROTECTED ENDPOINTS (With API Key)"
echo "======================================"

test_endpoint "POST" "/api/slicer" '{"fileURL": "https://example.com/test.stl"}' true "Slicer analysis"

# Test Estimate Endpoints
test_endpoint "POST" "/api/order/estimate" '[{"email":"test@example.com","phone":"123-456-7890","name":"John Doe","orderNumber":"EST001","filename":"test.stl","fileURL":"https://example.com/test.stl","bill_to_street_1":"123 Main St","bill_to_city":"Test City","bill_to_state":"CA","bill_to_zip":"12345","bill_to_country_as_iso":"US","bill_to_is_US_residential":"true","ship_to_name":"John Doe","ship_to_street_1":"123 Main St","ship_to_city":"Test City","ship_to_state":"CA","ship_to_zip":"12345","ship_to_country_as_iso":"US","ship_to_is_US_residential":"true","order_item_name":"Test Item","order_quantity":"1","order_item_color":"black","profile":"PLA"}]' true "Order estimate"

test_endpoint "POST" "/api/order/estimateShipping" '[{"email":"test@example.com","phone":"123-456-7890","name":"John Doe","orderNumber":"SHIP001","filename":"test.stl","fileURL":"https://example.com/test.stl","bill_to_street_1":"123 Main St","bill_to_city":"Test City","bill_to_state":"CA","bill_to_zip":"12345","bill_to_country_as_iso":"US","bill_to_is_US_residential":"true","ship_to_name":"John Doe","ship_to_street_1":"123 Main St","ship_to_city":"Test City","ship_to_state":"CA","ship_to_zip":"12345","ship_to_country_as_iso":"US","ship_to_is_US_residential":"true","order_item_name":"Test Item","order_quantity":"1","order_item_color":"black","profile":"PLA"}]' true "Shipping estimate"

# Create a test order
ORDER_DATA='[{
  "email": "test@example.com",
  "phone": "123-456-7890",
  "name": "Test User",
  "orderNumber": "ORD001",
  "filename": "robot-arm.stl",
  "fileURL": "https://example.com/robot-arm.stl",
  "bill_to_street_1": "123 Test St",
  "bill_to_city": "Test City",
  "bill_to_state": "CA",
  "bill_to_zip": "12345",
  "bill_to_country_as_iso": "US",
  "bill_to_is_US_residential": "true",
  "ship_to_name": "Test User",
  "ship_to_street_1": "123 Test St",
  "ship_to_city": "Test City",
  "ship_to_state": "CA",
  "ship_to_zip": "12345",
  "ship_to_country_as_iso": "US",
  "ship_to_is_US_residential": "true",
  "order_item_name": "Robot Arm",
  "order_quantity": "1",
  "order_item_color": "black",
  "profile": "PLA"
}]'

echo "Creating test order..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/order" \
  -H "api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$ORDER_DATA")

if echo "$ORDER_RESPONSE" | grep -q "orderId"; then
    ORDER_ID=$(echo "$ORDER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['orderId'])" 2>/dev/null)
    echo -e "${GREEN}✅ Test order created: $ORDER_ID${NC}"
    echo ""
    
    # Test order tracking
    test_endpoint "GET" "/api/order/$ORDER_ID/get-tracking" "" true "Get order tracking"
    
    # Test order list
    test_endpoint "GET" "/api/order" "" true "List all orders"
    
    # Test order cancellation
    test_endpoint "DELETE" "/api/order/$ORDER_ID" "" true "Cancel order"
else
    echo -e "${RED}❌ Failed to create test order${NC}"
    echo "$ORDER_RESPONSE"
    echo ""
fi

# Test webhook endpoints
test_endpoint "POST" "/api/customer/subscribeWebhook" "{\"endPoint\": \"$TEST_WEBHOOK_URL\"}" true "Subscribe webhook"

# Final summary
echo "📝 TESTING SUMMARY"
echo "=================="
echo -e "${GREEN}✅ Testing completed successfully${NC}"
echo ""
echo "📖 For complete documentation, see:"
echo "   - README.md (main documentation)"
echo "   - API.md (detailed API reference)"
echo "   - Dashboard: $BASE_URL/dashboard"
echo ""
echo "🐳 To test with Docker:"
echo "   docker-compose up -d"
echo "   ./scripts/test-endpoints.sh"
echo "" 