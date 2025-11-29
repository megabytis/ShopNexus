# ShopNexus Backend - Docker Setup

This directory contains the backend API server for ShopNexus e-commerce platform.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and update the values, especially:

- `JWT_SECRET` - Use a strong random string
- `COOKIE_SECRET` - Use a strong random string
- `MONGO_PASSWORD` - Set a secure password
- `REDIS_PASSWORD` - Set a secure password

### 2. Start All Services

Start MongoDB, Redis, and the backend server:

```bash
docker-compose up -d
```

This will:

- Start MongoDB on port 27017
- Start Redis on port 6379
- Build and start the backend API on port 8888

### 3. Check Service Status

```bash
docker-compose ps
```

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose logs -f redis
```

### 5. Stop Services

```bash
docker-compose down
```

To also remove volumes (⚠️ this will delete all data):

```bash
docker-compose down -v
```

## Development Workflow

### Building Only the Backend

```bash
docker build -t shopnexus-backend .
```

### Running Backend Standalone

If you have MongoDB and Redis running elsewhere:

```bash
docker run -p 8888:8888 \
  -e MONGO_CONNECTION_STRING=your_mongo_uri \
  -e REDIS_HOST=your_redis_host \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your_secret \
  shopnexus-backend
```

### Rebuilding After Code Changes

```bash
docker-compose up -d --build backend
```

## Health Checks

The backend includes a health check endpoint:

```bash
curl http://localhost:8888/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-29T13:27:24.000Z"
}
```

## Service Details

### Backend API

- **Port**: 8888
- **Entry Point**: `app.js`
- **Dependencies**: MongoDB, Redis
- **Health Check**: `GET /health`

### MongoDB

- **Port**: 27017
- **Default Database**: shopnexus
- **Volume**: `mongodb_data` (persists data)

### Redis

- **Port**: 6379
- **Max Memory**: 256MB
- **Eviction Policy**: allkeys-lru
- **Persistence**: AOF enabled
- **Volume**: `redis_data` (persists data)

## Troubleshooting

### Backend won't start

1. Check if MongoDB and Redis are healthy:

   ```bash
   docker-compose ps
   ```

2. Check backend logs:

   ```bash
   docker-compose logs backend
   ```

3. Verify environment variables:
   ```bash
   docker-compose config
   ```

### Connection refused errors

Make sure services are on the same network:

```bash
docker network inspect shopnexus_shopnexus-network
```

### Port already in use

Change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8889:8888" # Use 8889 on host instead
```

## Production Deployment

For production deployment:

1. **Use secrets management** - Don't commit `.env` file
2. **Set NODE_ENV=production** in environment variables
3. **Use external managed databases** - Consider MongoDB Atlas and Redis Cloud
4. **Enable SSL/TLS** - Use a reverse proxy like Nginx
5. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: "1"
         memory: 512M
   ```

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Port 5173)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│  (Port 8888)    │
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐ ┌──────┐
│ MongoDB │ │ Redis│
│  :27017 │ │ :6379│
└─────────┘ └──────┘
```

## Environment Variables Reference

| Variable                  | Description           | Default     | Required |
| ------------------------- | --------------------- | ----------- | -------- |
| `NODE_ENV`                | Environment mode      | development | No       |
| `PORT`                    | Server port           | 8888        | No       |
| `MONGO_CONNECTION_STRING` | MongoDB URI           | -           | Yes      |
| `REDIS_HOST`              | Redis hostname        | localhost   | Yes      |
| `REDIS_PORT`              | Redis port            | 6379        | Yes      |
| `REDIS_USERNAME`          | Redis username        | default     | Yes      |
| `REDIS_PASSWORD`          | Redis password        | -           | Yes      |
| `JWT_SECRET`              | JWT signing key       | -           | Yes      |
| `JWT_EXPIRES_IN`          | JWT expiration        | 7d          | No       |
| `FRONTEND_URL`            | Frontend URL for CORS | -           | Yes      |
| `COOKIE_SECRET`           | Cookie signing key    | -           | Yes      |
