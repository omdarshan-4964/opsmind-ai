#!/bin/bash

# ========================================
# OpsMind AI - Docker Deployment Test Script
# ========================================
# This script tests the entire Docker deployment
# Run with: bash test-deployment.sh

set -e  # Exit on error

echo "🚀 OpsMind AI - Deployment Test Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

# ========================================
# 1. Prerequisites Check
# ========================================
echo "📋 Step 1: Checking Prerequisites..."
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    test_result 0 "Docker is installed"
    docker --version
else
    test_result 1 "Docker is NOT installed"
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    test_result 0 "Docker Compose is installed"
    docker-compose --version
else
    test_result 1 "Docker Compose is NOT installed"
    exit 1
fi

# Check .env file
if [ -f .env ]; then
    test_result 0 ".env file exists"
    
    # Check if GOOGLE_API_KEY is set
    if grep -q "GOOGLE_API_KEY=your_google_api_key_here" .env; then
        echo -e "${YELLOW}⚠ Warning: GOOGLE_API_KEY not configured in .env${NC}"
        echo "Please edit .env and add your Google API Key"
    else
        test_result 0 "GOOGLE_API_KEY is configured"
    fi
else
    test_result 1 ".env file NOT found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please edit .env and add your credentials"
    exit 1
fi

echo ""

# ========================================
# 2. Build Docker Images
# ========================================
echo "🔨 Step 2: Building Docker Images..."
echo ""

docker-compose build --no-cache
if [ $? -eq 0 ]; then
    test_result 0 "Docker images built successfully"
else
    test_result 1 "Docker build failed"
    exit 1
fi

echo ""

# ========================================
# 3. Start Services
# ========================================
echo "🚀 Step 3: Starting Services..."
echo ""

docker-compose up -d
if [ $? -eq 0 ]; then
    test_result 0 "Services started successfully"
else
    test_result 1 "Failed to start services"
    exit 1
fi

echo ""
echo "⏳ Waiting 30 seconds for services to initialize..."
sleep 30

# ========================================
# 4. Check Container Status
# ========================================
echo ""
echo "📦 Step 4: Checking Container Status..."
echo ""

# Check if containers are running
MONGO_STATUS=$(docker-compose ps -q mongo)
SERVER_STATUS=$(docker-compose ps -q server)
CLIENT_STATUS=$(docker-compose ps -q client)

if [ -n "$MONGO_STATUS" ]; then
    test_result 0 "MongoDB container is running"
else
    test_result 1 "MongoDB container is NOT running"
fi

if [ -n "$SERVER_STATUS" ]; then
    test_result 0 "Server container is running"
else
    test_result 1 "Server container is NOT running"
fi

if [ -n "$CLIENT_STATUS" ]; then
    test_result 0 "Client container is running"
else
    test_result 1 "Client container is NOT running"
fi

# ========================================
# 5. Test Health Endpoints
# ========================================
echo ""
echo "🏥 Step 5: Testing Health Endpoints..."
echo ""

# Test Server Health
SERVER_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ "$SERVER_HEALTH" == "200" ]; then
    test_result 0 "Server health endpoint responding (200)"
else
    test_result 1 "Server health endpoint failed ($SERVER_HEALTH)"
fi

# Test Client Health
CLIENT_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
if [ "$CLIENT_HEALTH" == "200" ]; then
    test_result 0 "Client health endpoint responding (200)"
else
    test_result 1 "Client health endpoint failed ($CLIENT_HEALTH)"
fi

# ========================================
# 6. Test API Endpoints
# ========================================
echo ""
echo "🔌 Step 6: Testing API Endpoints..."
echo ""

# Test Server Root
SERVER_ROOT=$(curl -s http://localhost:5000/)
if [[ "$SERVER_ROOT" == *"OpsMind"* ]]; then
    test_result 0 "Server root endpoint responding"
else
    test_result 1 "Server root endpoint failed"
fi

# Test API Proxy through Nginx
echo ""
echo "Testing API proxy (this may take longer due to AI processing)..."
API_RESPONSE=$(curl -s -X POST http://localhost/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test","history":[]}' \
    -w "%{http_code}" -o /tmp/api_response.json)

if [ "$API_RESPONSE" == "200" ]; then
    test_result 0 "API proxy working (200)"
    echo "Response preview:"
    cat /tmp/api_response.json | head -c 200
    echo ""
else
    test_result 1 "API proxy failed ($API_RESPONSE)"
    echo "Response:"
    cat /tmp/api_response.json
fi

# ========================================
# 7. Test MongoDB Connection
# ========================================
echo ""
echo "🗄️  Step 7: Testing MongoDB Connection..."
echo ""

MONGO_PING=$(docker exec opsmind-mongo mongosh --quiet --eval "db.adminCommand('ping').ok")
if [ "$MONGO_PING" == "1" ]; then
    test_result 0 "MongoDB is responding to ping"
else
    test_result 1 "MongoDB ping failed"
fi

# ========================================
# 8. Check Logs for Errors
# ========================================
echo ""
echo "📜 Step 8: Checking Logs for Errors..."
echo ""

# Check server logs
SERVER_ERRORS=$(docker-compose logs server | grep -i "error" | grep -v "0 error" | wc -l)
if [ "$SERVER_ERRORS" -eq 0 ]; then
    test_result 0 "No errors in server logs"
else
    echo -e "${YELLOW}⚠ Found $SERVER_ERRORS error entries in server logs${NC}"
    echo "Recent server logs:"
    docker-compose logs --tail=20 server
fi

# Check client logs
CLIENT_ERRORS=$(docker-compose logs client | grep -i "error" | wc -l)
if [ "$CLIENT_ERRORS" -eq 0 ]; then
    test_result 0 "No errors in client logs"
else
    echo -e "${YELLOW}⚠ Found $CLIENT_ERRORS error entries in client logs${NC}"
fi

# ========================================
# 9. Test Resource Usage
# ========================================
echo ""
echo "💻 Step 9: Checking Resource Usage..."
echo ""

docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# ========================================
# 10. Summary
# ========================================
echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Deployment is healthy.${NC}"
    echo ""
    echo "🎉 Your OpsMind AI stack is ready!"
    echo ""
    echo "Access points:"
    echo "  • Frontend: http://localhost"
    echo "  • Backend:  http://localhost:5000"
    echo "  • Health:   http://localhost:5000/health"
    echo ""
    echo "Useful commands:"
    echo "  • View logs:    docker-compose logs -f"
    echo "  • Stop:         docker-compose down"
    echo "  • Restart:      docker-compose restart"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the logs above.${NC}"
    echo ""
    echo "Debugging commands:"
    echo "  • docker-compose logs server"
    echo "  • docker-compose logs client"
    echo "  • docker-compose logs mongo"
    echo "  • docker-compose ps"
    echo ""
    exit 1
fi
