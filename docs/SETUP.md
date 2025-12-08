# Environment Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)
- Docker and Docker Compose (for containerized setup)

## Quick Start with Docker

1. **Clone the repository:**

```bash
git clone <repository-url>
cd Global-Eats2
```

2. **Start with Docker Compose:**

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 5000
- Frontend on port 3000

## Manual Setup

### Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=global_eats_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (for OTP/notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload Configuration
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Payment Gateway (example for Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Maps API (for location services)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AWS S3 (for file storage in production)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

5. **Set up PostgreSQL database:**

```bash
# Create database
createdb global_eats_dev

# Run migrations
npm run migrate

# Seed database with sample data
npm run seed
```

6. **Start the backend server:**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`:**

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000

# Authentication
VITE_JWT_TOKEN_KEY=global_eats_token

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Payment Gateway
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# App Configuration
VITE_APP_NAME=Global Eats
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true

# CDN Configuration (for production)
VITE_CDN_BASE_URL=https://cdn.yourdomain.com

# Sentry (for error tracking)
VITE_SENTRY_DSN=your_sentry_dsn
```

5. **Start the frontend development server:**

```bash
npm run dev
```

## Database Setup

### PostgreSQL Configuration

1. **Install PostgreSQL:**

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql

# Windows - Download from postgresql.org
```

2. **Create database and user:**

```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE global_eats_dev;

-- Create user
CREATE USER global_eats_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE global_eats_dev TO global_eats_user;

-- Exit
\q
```

3. **Run database migrations:**

```bash
cd backend
npm run migrate
```

4. **Seed database with sample data:**

```bash
npm run seed
```

### Redis Configuration (Optional)

Redis is used for caching and session storage:

1. **Install Redis:**

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS with Homebrew
brew install redis

# Windows - Download from redis.io
```

2. **Start Redis server:**

```bash
redis-server
```

## Available Scripts

### Backend Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run dev:debug    # Start with debugging enabled

# Production
npm start           # Start production server
npm run build       # Build for production

# Database
npm run migrate     # Run database migrations
npm run migrate:undo # Undo last migration
npm run seed        # Seed database with sample data
npm run seed:undo   # Undo all seeds

# Testing
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier
```

### Frontend Scripts

```bash
# Development
npm run dev        # Start development server
npm run dev:host   # Start with network access

# Production
npm run build      # Build for production
npm run preview    # Preview production build

# Testing
npm test          # Run tests
npm run test:ui   # Run tests with UI
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint      # Run ESLint
npm run lint:fix  # Fix ESLint issues
npm run type-check # TypeScript type checking
```

## Environment-Specific Configurations

### Development Environment

- Hot reloading enabled
- Detailed error messages
- Debug logging
- Source maps enabled
- CORS enabled for localhost

### Staging Environment

- Production-like setup
- Limited error details
- Performance monitoring
- SSL enabled
- Database connection pooling

### Production Environment

- Optimized builds
- Error tracking (Sentry)
- Performance monitoring
- CDN for static assets
- Database clustering
- Redis clustering
- Load balancing

## Troubleshooting

### Common Issues

1. **Port already in use:**

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

2. **Database connection failed:**

- Check PostgreSQL is running
- Verify database credentials
- Ensure database exists
- Check firewall settings

3. **Frontend can't connect to backend:**

- Verify backend is running
- Check CORS configuration
- Verify API URL in frontend env

4. **Build failures:**

- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify environment variables

### Debug Mode

1. **Backend debugging:**

```bash
npm run dev:debug
```

2. **Frontend debugging:**

- Open browser developer tools
- Check Network tab for API calls
- Check Console for errors

### Logs

1. **Backend logs:**

```bash
# Development
tail -f logs/development.log

# Production
tail -f logs/production.log
```

2. **Frontend logs:**

- Browser console
- Network tab in developer tools

## Performance Optimization

### Backend

- Database indexing
- Query optimization
- Caching with Redis
- Connection pooling
- Compression middleware

### Frontend

- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis
- PWA features

## Security Considerations

1. **Environment Variables:**

- Never commit `.env` files
- Use strong JWT secrets
- Rotate API keys regularly

2. **Database Security:**

- Use connection pooling
- Implement proper indexing
- Regular backups

3. **API Security:**

- Rate limiting
- Input validation
- CORS configuration
- HTTPS in production
