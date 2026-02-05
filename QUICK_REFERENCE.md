# 🚀 OpsMind AI - Quick Reference Card

## 📋 Essential Commands

### Start/Stop
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a service
docker-compose restart server

# Rebuild and start
docker-compose up --build -d
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongo

# Last 50 lines
docker-compose logs --tail=50 server
```

### Status
```bash
# Check running containers
docker-compose ps

# Resource usage
docker stats

# Health checks
curl http://localhost:5000/health
curl http://localhost/health
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | React app served by Nginx |
| Backend | http://localhost:5000 | Express API |
| API (via proxy) | http://localhost/api/chat | API through Nginx |
| Server Health | http://localhost:5000/health | Backend health |
| Client Health | http://localhost/health | Frontend health |
| MongoDB | mongodb://localhost:27017 | Direct DB access |

---

## 🔧 Debugging

### Container Issues
```bash
# Enter container shell
docker exec -it opsmind-server sh
docker exec -it opsmind-client sh
docker exec -it opsmind-mongo mongosh

# Check container details
docker inspect opsmind-server

# Test network connectivity
docker exec -it opsmind-client ping server
docker exec -it opsmind-server ping mongo
```

### Clean Slate
```bash
# Remove everything (including volumes)
docker-compose down -v

# Remove all unused Docker data
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Test API
```bash
# Test server directly
curl http://localhost:5000/

# Test chat endpoint
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","history":[]}'

# Test through Nginx proxy
curl -X POST http://localhost/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","history":[]}'
```

---

## 📁 Project Structure

```
opsmind-ai/
├── client/              # React Frontend
│   ├── Dockerfile       # Multi-stage build
│   ├── nginx.conf       # Nginx config
│   └── src/
├── server/              # Express Backend  
│   ├── Dockerfile       # Server build
│   └── src/
├── ai-engine/           # AI & RAG Engine
│   └── src/
├── docker-compose.yml   # Service orchestration
├── .env                 # Environment (DO NOT COMMIT)
├── .env.example         # Template
└── .github/             # CI/CD
    └── workflows/
        └── ci.yml
```

---

## 🐛 Common Issues & Fixes

### "Port already in use"
```bash
# Find process using port
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <pid> /F

# Or change port in docker-compose.yml
ports:
  - "8080:80"  # Use 8080 instead
```

### "Cannot connect to MongoDB"
```bash
# Restart mongo with clean volumes
docker-compose stop mongo
docker volume rm opsmind-ai_mongo_data
docker-compose up -d mongo

# Wait 10 seconds, then restart server
docker-compose restart server
```

### "API returns 502 Bad Gateway"
```bash
# Check if server is running
docker-compose ps server

# Check server logs
docker-compose logs server

# Verify nginx proxy config
docker exec -it opsmind-client cat /etc/nginx/conf.d/default.conf

# Test from client container
docker exec -it opsmind-client wget -O- http://server:5000/health
```

### "Build fails"
```bash
# Clear Docker cache
docker-compose build --no-cache

# Check disk space
docker system df

# Clean up
docker system prune -a --volumes
```

---

## 🔐 Environment Variables

Required in `.env`:
```env
GOOGLE_API_KEY=your_api_key_here
```

Optional (with defaults):
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://mongo:27017/opsmind
```

---

## 📊 Monitoring

### Container Health
```bash
# All containers
docker-compose ps

# Detailed health
docker inspect --format='{{.State.Health.Status}}' opsmind-server
docker inspect --format='{{.State.Health.Status}}' opsmind-client
```

### Resource Usage
```bash
# Live stats
docker stats

# Specific container
docker stats opsmind-server

# Disk usage
docker system df
```

### Logs Analysis
```bash
# Search for errors
docker-compose logs | grep -i error

# Count errors
docker-compose logs server | grep -i error | wc -l

# Server startup logs
docker-compose logs server | head -n 50
```

---

## 🚀 Deploy to Production

### Preparation
1. Get a VPS (DigitalOcean, AWS, Azure)
2. Install Docker & Docker Compose
3. Clone repository
4. Configure `.env` file
5. Setup firewall (allow 80, 443)
6. Get SSL certificate (Caddy/Certbot)

### Commands
```bash
# On server
git clone <your-repo>
cd opsmind-ai
cp .env.example .env
nano .env  # Configure

# Deploy
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### SSL with Caddy
```bash
# Install Caddy
sudo apt install caddy

# Caddyfile
yourdomain.com {
    reverse_proxy localhost:80
}

# Start Caddy
sudo systemctl start caddy
```

---

## 📞 Testing Checklist

- [ ] Containers are running: `docker-compose ps`
- [ ] Server health: `curl http://localhost:5000/health`
- [ ] Client health: `curl http://localhost/health`
- [ ] Frontend loads: Open http://localhost
- [ ] API works: Test chat endpoint
- [ ] MongoDB connects: Check server logs
- [ ] No errors in logs: `docker-compose logs`

---

## 🎯 Performance Tips

1. **Use BuildKit** for faster builds:
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

2. **Prune regularly**:
   ```bash
   docker system prune -a --volumes
   ```

3. **Monitor resources**:
   ```bash
   docker stats --no-stream
   ```

4. **Limit logs**:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

---

## 📚 Documentation

- **DEPLOYMENT.md** - Full deployment guide
- **WEEK4_COMPLETE_SUMMARY.md** - Technical overview
- **WEEK3_INTEGRATION_COMPLETE.md** - Service integration
- **.env.example** - Environment template

---

## 🆘 Get Help

1. Check logs: `docker-compose logs <service>`
2. Test scripts: `.\test-deployment.ps1`
3. Review documentation files
4. Check container status: `docker-compose ps`
5. Inspect networks: `docker network ls`

---

**Quick Start**: `docker-compose up -d` → http://localhost 🚀
