# ========================================
# OpsMind AI - Docker Deployment Test Script (PowerShell)
# ========================================
# Run with: .\test-deployment.ps1

Write-Host "🚀 OpsMind AI - Deployment Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$TestsPassed = 0
$TestsFailed = 0

function Test-Result {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "✓ $Message" -ForegroundColor Green
        $script:TestsPassed++
    } else {
        Write-Host "✗ $Message" -ForegroundColor Red
        $script:TestsFailed++
    }
}

# ========================================
# 1. Prerequisites Check
# ========================================
Write-Host "📋 Step 1: Checking Prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Docker
try {
    $dockerVersion = docker --version
    Test-Result -Success $true -Message "Docker is installed: $dockerVersion"
} catch {
    Test-Result -Success $false -Message "Docker is NOT installed"
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Test-Result -Success $true -Message "Docker Compose is installed: $composeVersion"
} catch {
    Test-Result -Success $false -Message "Docker Compose is NOT installed"
    exit 1
}

# Check .env file
if (Test-Path .env) {
    Test-Result -Success $true -Message ".env file exists"
    
    $envContent = Get-Content .env -Raw
    if ($envContent -match "GOOGLE_API_KEY=your_google_api_key_here") {
        Write-Host "⚠ Warning: GOOGLE_API_KEY not configured in .env" -ForegroundColor Yellow
    } else {
        Test-Result -Success $true -Message "GOOGLE_API_KEY is configured"
    }
} else {
    Test-Result -Success $false -Message ".env file NOT found"
    Copy-Item .env.example .env
    Write-Host "Created .env from template. Please configure it." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ========================================
# 2. Build Docker Images
# ========================================
Write-Host "🔨 Step 2: Building Docker Images..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose build --no-cache
    Test-Result -Success $true -Message "Docker images built successfully"
} catch {
    Test-Result -Success $false -Message "Docker build failed"
    exit 1
}

Write-Host ""

# ========================================
# 3. Start Services
# ========================================
Write-Host "🚀 Step 3: Starting Services..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose up -d
    Test-Result -Success $true -Message "Services started successfully"
} catch {
    Test-Result -Success $false -Message "Failed to start services"
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting 30 seconds for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# ========================================
# 4. Check Container Status
# ========================================
Write-Host ""
Write-Host "📦 Step 4: Checking Container Status..." -ForegroundColor Yellow
Write-Host ""

$containersMongo = docker-compose ps -q mongo
$containersServer = docker-compose ps -q server
$containersClient = docker-compose ps -q client

Test-Result -Success ($null -ne $containersMongo) -Message "MongoDB container is running"
Test-Result -Success ($null -ne $containersServer) -Message "Server container is running"
Test-Result -Success ($null -ne $containersClient) -Message "Client container is running"

# ========================================
# 5. Test Health Endpoints
# ========================================
Write-Host ""
Write-Host "🏥 Step 5: Testing Health Endpoints..." -ForegroundColor Yellow
Write-Host ""

# Test Server Health
try {
    $serverHealth = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 10
    Test-Result -Success ($serverHealth.StatusCode -eq 200) -Message "Server health endpoint responding (200)"
} catch {
    Test-Result -Success $false -Message "Server health endpoint failed"
}

# Test Client Health
try {
    $clientHealth = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 10
    Test-Result -Success ($clientHealth.StatusCode -eq 200) -Message "Client health endpoint responding (200)"
} catch {
    Test-Result -Success $false -Message "Client health endpoint failed"
}

# ========================================
# 6. Test API Endpoints
# ========================================
Write-Host ""
Write-Host "🔌 Step 6: Testing API Endpoints..." -ForegroundColor Yellow
Write-Host ""

# Test Server Root
try {
    $serverRoot = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing
    Test-Result -Success ($serverRoot.Content -match "OpsMind") -Message "Server root endpoint responding"
} catch {
    Test-Result -Success $false -Message "Server root endpoint failed"
}

# Test API Proxy
Write-Host ""
Write-Host "Testing API proxy (this may take longer)..." -ForegroundColor Cyan
try {
    $body = @{
        message = "test"
        history = @()
    } | ConvertTo-Json

    $apiResponse = Invoke-WebRequest -Uri "http://localhost/api/chat" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -TimeoutSec 30

    Test-Result -Success ($apiResponse.StatusCode -eq 200) -Message "API proxy working (200)"
    Write-Host "Response preview:" -ForegroundColor Gray
    Write-Host ($apiResponse.Content.Substring(0, [Math]::Min(200, $apiResponse.Content.Length))) -ForegroundColor Gray
} catch {
    Test-Result -Success $false -Message "API proxy failed: $($_.Exception.Message)"
}

# ========================================
# 7. Test MongoDB Connection
# ========================================
Write-Host ""
Write-Host "🗄️  Step 7: Testing MongoDB Connection..." -ForegroundColor Yellow
Write-Host ""

try {
    $mongoPing = docker exec opsmind-mongo mongosh --quiet --eval "db.adminCommand('ping').ok"
    Test-Result -Success ($mongoPing -eq "1") -Message "MongoDB is responding to ping"
} catch {
    Test-Result -Success $false -Message "MongoDB ping failed"
}

# ========================================
# 8. Check Logs for Errors
# ========================================
Write-Host ""
Write-Host "📜 Step 8: Checking Logs..." -ForegroundColor Yellow
Write-Host ""

$serverLogs = docker-compose logs server | Select-String -Pattern "error" -CaseSensitive:$false
if ($serverLogs.Count -eq 0) {
    Test-Result -Success $true -Message "No errors in server logs"
} else {
    Write-Host "⚠ Found errors in server logs" -ForegroundColor Yellow
    docker-compose logs --tail=20 server
}

# ========================================
# 9. Resource Usage
# ========================================
Write-Host ""
Write-Host "💻 Step 9: Checking Resource Usage..." -ForegroundColor Yellow
Write-Host ""

docker stats --no-stream

# ========================================
# 10. Summary
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $TestsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $TestsFailed" -ForegroundColor Red
Write-Host ""

if ($TestsFailed -eq 0) {
    Write-Host "✓ All tests passed! Deployment is healthy." -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your OpsMind AI stack is ready!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access points:"
    Write-Host "  • Frontend: http://localhost"
    Write-Host "  • Backend:  http://localhost:5000"
    Write-Host "  • Health:   http://localhost:5000/health"
    Write-Host ""
    Write-Host "Useful commands:"
    Write-Host "  • View logs:    docker-compose logs -f"
    Write-Host "  • Stop:         docker-compose down"
    Write-Host "  • Restart:      docker-compose restart"
    Write-Host ""
    exit 0
} else {
    Write-Host "✗ Some tests failed. Please check the logs above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Debugging commands:"
    Write-Host "  • docker-compose logs server"
    Write-Host "  • docker-compose logs client"
    Write-Host "  • docker-compose logs mongo"
    Write-Host "  • docker-compose ps"
    Write-Host ""
    exit 1
}
