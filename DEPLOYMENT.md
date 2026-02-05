# 🚀 OpsMind AI - Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker & Docker Compose installed
- Google AI API Key ([Get one here](https://ai.google.dev/))
- 4GB+ RAM available

### Step 1: Clone & Configure
```bash
# Clone the repository
git clone <your-repo-url>
cd opsmind-ai

# Create environment file
cp .env.example .env

# Edit .env and add your Google API Key
nano .env  # or use your favorite editor
```

### Step 2: Launch All Services
```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### Step 3: Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **MongoDB**: mongodb://localhost:27017/opsmind

### Stop Services
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 📁 Project Structure

```
opsmind-ai/
├── client/                 # React Frontend
│   ├── Dockerfile         # Multi-stage: Node → Nginx
│   ├── nginx.conf         # Nginx config with API proxy
│   └── src/
├── server/                # Express Backend
│   ├── Dockerfile         # Node 20 Alpine + TypeScript
│   └── src/
├── ai-engine/             # AI & RAG Engine
│   └── src/
├── docker-compose.yml     # Orchestrates all services
├── .github/workflows/ci.yml  # CI/CD Pipeline
└── .env.example          # Environment template
```

---

## 🏗️ Architecture

```
User Browser (localhost)
        ↓
    Nginx:80 (Client Container)
        ↓
    /api/* → Express:5000 (Server Container)
        ↓
    MongoDB:27017 (Mongo Container)
```

**Key Points:**
- Nginx proxies `/api/*` requests to Express backend
- All services communicate via internal Docker network
- MongoDB data persists in Docker volume

---

## 🔧 Development Workflow

### Local Development (Without Docker)
```bash
# Terminal 1 - Start MongoDB (or use MongoDB Atlas)
# mongod --dbpath ./data

# Terminal 2 - Start Server
cd server
npm install
npm run dev

# Terminal 3 - Start Client
cd client
npm install --legacy-peer-deps
npm run dev
```

### Production Build (With Docker)
```bash
# Build all images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services (future)
docker-compose up -d --scale server=3
```

---

## 🧪 Testing

### Manual Testing
```bash
# Test server health
curl http://localhost:5000/health

# Test chat endpoint
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the company leave policy?",
    "history": []
  }'

# Test via Nginx proxy
curl -X POST http://localhost/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "history": []
  }'
```

### Automated Testing (CI/CD)
```bash
# GitHub Actions runs automatically on push
# Or test locally:
cd server && npm test
cd client && npm test
```

---

## 🌐 Cloud Deployment

### Option 1: AWS EC2 / Digital Ocean Droplet
```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clone and configure
git clone <your-repo>
cd opsmind-ai
nano .env  # Add GOOGLE_API_KEY

# 4. Start services
docker-compose up -d

# 5. Setup reverse proxy (Caddy recommended)
sudo apt install caddy
```

**Caddyfile** (for SSL/HTTPS):
```caddy
yourdomain.com {
    reverse_proxy localhost:80
}
```

### Option 2: Managed Services
- **Frontend**: Deploy to Vercel / Netlify
- **Backend**: Deploy to Railway / Render
- **Database**: MongoDB Atlas

### Option 3: Kubernetes
```bash
# Convert docker-compose to K8s
kompose convert

# Or create manually
kubectl apply -f k8s/
```

---

## 📊 Monitoring & Logs

### View Container Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongo
```

### Check Container Health
```bash
# List running containers
docker-compose ps

# Inspect specific container
docker inspect opsmind-server

# Execute commands inside container
docker exec -it opsmind-server sh
```

### Resource Usage
```bash
# Monitor resource consumption
docker stats

# View disk usage
docker system df
```

---

## 🔐 Security Best Practices

### Production Checklist
- [ ] Change CORS origin from `*` to specific domain
- [ ] Use strong MongoDB authentication
- [ ] Enable SSL/TLS (use Caddy or Let's Encrypt)
- [ ] Set up firewall rules
- [ ] Use environment variables (never commit `.env`)
- [ ] Enable rate limiting on API routes
- [ ] Regular security audits (`npm audit`)
- [ ] Keep dependencies updated

### Example: Tighten CORS
```typescript
// server/src/index.ts
app.use(cors({ 
  origin: 'https://yourdomain.com',
  credentials: true 
}));
```

---

## 🐛 Troubleshooting

### Issue: Server can't connect to MongoDB
```bash
# Solution 1: Check if mongo is running
docker-compose ps

# Solution 2: Restart with fresh volumes
docker-compose down -v
docker-compose up --build

# Solution 3: Check MongoDB logs
docker-compose logs mongo
```

### Issue: Client shows Network Error
```bash
# Solution 1: Verify nginx proxy config
docker exec -it opsmind-client cat /etc/nginx/conf.d/default.conf

# Solution 2: Test from inside container
docker exec -it opsmind-client wget -O- http://server:5000/health

# Solution 3: Check server logs
docker-compose logs server
```

### Issue: Build Fails
```bash
# Solution 1: Clean Docker cache
docker-compose build --no-cache

# Solution 2: Check disk space
docker system df
docker system prune -a

# Solution 3: Test local builds
cd client && npm run build
cd server && npm run build
```

---

## 📈 Performance Optimization

### Current Setup
- Single instance per service
- No caching
- Direct database queries

### Future Improvements
1. **Add Redis Caching**
   ```yaml
   redis:
     image: redis:alpine
     ports:
       - "6379:6379"
   ```

2. **Horizontal Scaling**
   ```bash
   docker-compose up -d --scale server=3
   ```

3. **Load Balancer**
   ```yaml
   nginx-lb:
     image: nginx:alpine
     depends_on:
       - server
   ```

4. **CDN for Static Assets**
   - Use CloudFlare / AWS CloudFront
   - Serve `/assets` from CDN

---

## 🎯 Next Steps

### Week 5+: Enhancements
- [ ] Add user authentication (JWT)
- [ ] Implement conversation persistence
- [ ] Add Redis for caching AI responses
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Implement rate limiting
- [ ] Add unit & integration tests
- [ ] Set up logging aggregation (ELK stack)
- [ ] Implement CI/CD with auto-deploy
- [ ] Add feature flags
- [ ] Performance profiling

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [MongoDB Best Practices](https://www.mongodb.com/docs/manual/administration/production-notes/)
- [React Production Build](https://react.dev/learn/start-a-new-react-project)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 🆘 Support

For issues or questions:
1. Check [WEEK4_DEPLOYMENT_COMPLETE.md](WEEK4_DEPLOYMENT_COMPLETE.md)
2. Review container logs: `docker-compose logs`
3. Create an issue on GitHub
4. Check environment variables in `.env`

---

**Last Updated**: February 5, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
