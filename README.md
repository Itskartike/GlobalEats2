GlobalEats – Food Delivery Web App

Overview
GlobalEats is a full‑stack food delivery web app featuring a modern mobile-first UI (React + Vite + Tailwind) and a Node/Express backend with a PostgreSQL database. It supports brand/outlet management, authentication (JWT + sessions), order flows, and an admin dashboard. The project is structured for iterative migrations and seeding, with an emphasis on clean API design and scalable frontend architecture.

Tech Stack
- Frontend: React, TypeScript, Vite, TailwindCSS, Framer Motion, Lucide Icons
- Backend: Node.js, Express.js
- Database: PostgreSQL (with migrations and seeders)
- Auth: JWT, session middleware
- Tooling: ESLint, npm scripts, Postman collections (manual), Docker (optional), Vite dev server

Repository Structure (high level)
- backend/ – Express app, migrations, seeders, services, routes, and tests
- frontend/ – React app with pages, components, services, types, and tests
- docs/ – Project documentation (API, OJT report, setup)
- scripts/ – Project setup and utilities
- docker-compose.yml – Optional local stack (DB + app)

Getting Started
Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 13+ (or Docker)

1) Clone and install
```bash
git clone <repo-url>
cd Global-Eats2
```

Install backend
```bash
cd backend
npm install
```

Install frontend
```bash
cd ../frontend
npm install
```

2) Environment configuration
- Copy backend/config/config.json template and set your DB credentials
- Ensure JWT secrets and mail credentials as needed (see backend/src/services)

3) Database setup
Run migrations and seeders (choose one path):
- Using provided scripts (Windows):
```bash
cd ..
./run_migration.bat
./run_seed.bat
```
- Using backend scripts:
```bash
cd backend
npm run migrate
npm run seed
```

4) Run the apps
Backend
```bash
cd backend
npm run dev
```

Frontend
```bash
cd frontend
npm run dev
```
Visit http://localhost:5173

Core Features
- Auth: Registration, login, JWT/session middleware, role-aware admin endpoints
- Brands & Outlets: List, featured brands, outlet-brand mapping, migrations
- Orders: Create/read user orders, basic order lifecycle
- Address/Location: Location prompt, outlet discovery integration point
- Mobile-first UI: App-like experience on mobile with bottom navigation
- Admin: Admin routes for brand/outlet/user management (backend)

Frontend Highlights
- Pages: Home (mobile-first hero, featured brands), brand listing (/restaurants)
- Components: FeaturedBrands, HeroSection, Card, Badge, Rating
- Styling: Tailwind utilities, responsive patterns, app-style bottom nav on mobile
- Data flow: Services under frontend/src/services communicate with backend APIs

Backend Highlights
- Routes/controllers in backend/src for auth, users, brands, outlets, orders
- Migrations and seeders for evolving schema
- Session and JWT middleware for secure endpoints

Common Commands
Backend
```bash
npm run dev         # start backend in watch mode
npm run migrate     # run DB migrations
npm run seed        # seed demo data
```

Frontend
```bash
npm run dev         # start Vite dev server
npm run build       # production build
npm run preview     # preview production build
```

API Documentation
See docs/API.md for endpoint details, payload shapes, and auth requirements.

Testing & Debugging
- Use Postman/Thunder Client to exercise endpoints
- Frontend: Chrome DevTools + React DevTools
- Lint: `npm run lint` (where configured)

Deployment Notes
- Build frontend (`npm run build`) and serve via static hosting or reverse proxy
- Backend can be deployed to any Node-friendly host; configure env for DB/JWT
- Optionally run PostgreSQL via managed service or Docker

Contributing
- Use feature branches, open PRs
- Match code style, keep functions small and well‑named
- Update docs and types when changing APIs

License
Proprietary – for educational/OJT purposes unless otherwise specified.

# Global Eats 🍔 - Food Delivery Platform

A modern, full-stack food delivery application built with React, Node.js, PostgreSQL, and Docker.

## 🏗️ Project Structure

```
Global-Eats2/
├── 📁 backend/                     # Backend API Server (Node.js + Express)
│   ├── 📁 src/
│   │   ├── 📁 controllers/         # Route controllers
│   │   ├── 📁 middleware/          # Custom middleware
│   │   ├── 📁 models/              # Database models (Sequelize)
│   │   ├── 📁 routes/              # API routes
│   │   ├── 📁 services/            # Business logic services
│   │   ├── 📁 database/            # Database related files
│   │   │   ├── 📁 config/          # Database configuration
│   │   │   ├── 📁 migrations/      # Database migrations
│   │   │   └── 📁 seeders/         # Database seeders
│   │   ├── � validators/          # Input validation schemas
│   │   ├── 📁 utils/               # Utility functions
│   │   ├── 📁 constants/           # App constants
│   │   ├── 📁 types/               # TypeScript type definitions
│   │   └── 📄 index.js             # Application entry point
│   ├── 📁 tests/                   # Backend tests
│   ├── 📁 logs/                    # Application logs
│   └── 📄 package.json
│
├── 📁 frontend/                    # Customer Web App (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable components
│   │   │   ├── 📁 ui/              # Basic UI components
│   │   │   ├── 📁 forms/           # Form components
│   │   │   ├── 📁 layout/          # Layout components
│   │   │   ├── 📁 common/          # Common components
│   │   │   └── 📁 features/        # Feature-specific components
│   │   │       ├── 📁 auth/        # Authentication components
│   │   │       ├── 📁 restaurants/ # Restaurant components
│   │   │       ├── 📁 cart/        # Cart components
│   │   │       ├── 📁 orders/      # Order components
│   │   │       └── 📁 profile/     # Profile components
│   │   ├── 📁 pages/               # Page components
│   │   ├── 📁 hooks/               # Custom React hooks
│   │   ├── 📁 services/            # API services
│   │   ├── 📁 store/               # State management (Zustand)
│   │   ├── 📁 utils/               # Utility functions
│   │   ├── 📁 constants/           # App constants
│   │   ├── 📁 types/               # TypeScript types
│   │   ├── 📁 assets/              # Static assets
│   │   └── 📁 styles/              # Global styles
│   ├── 📁 tests/                   # Frontend tests
│   └── 📄 package.json
│
├── 📁 docs/                        # Documentation
├── 📁 scripts/                     # Build and deployment scripts
├── 📄 docker-compose.yml           # Development environment
└── 📄 README.md                    # Project documentation
```

## �🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

### Automated Setup

```bash
node setup-new.js
```

### Manual Setup

1. **Install Dependencies**

   ```bash
   # Install backend dependencies
   cd backend && npm install

   # Install frontend dependencies
   cd ../frontend && npm install
   ```

2. **Start Database Services**

   ```bash
   docker-compose up -d postgres redis
   ```

3. **Setup Database**

   ```bash
   cd backend
   npm run db:setup
   ```

4. **Start Development Servers**

   ```bash
   # Terminal 1 - Backend (Port 5000)
   cd backend
   npm run dev

   # Terminal 2 - Frontend (Port 3000)
   cd frontend
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/health

## 🔐 Demo Accounts

After running the setup, you can login with:

**Customer Account:**

- Email: john.doe@example.com
- Password: password123

**Restaurant Owner:**

- Email: owner@mcdonalds.com
- Password: password123

**Delivery Agent:**

- Email: delivery@example.com
- Password: password123

## 🛠️ Technology Stack

### Backend

- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** authentication
- **bcryptjs** for password hashing
- **Joi** for input validation
- **Nodemailer** for emails
- **Redis** for caching
- **Winston** for logging

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation

### Infrastructure

- **Docker** for containerization
- **Docker Compose** for multi-service setup

## 📊 Database Schema

The application includes the following main entities:

- **Users** (customers, restaurant owners, delivery agents, admins)
- **Restaurants** with detailed information and location
- **Menu Items** with categories, pricing, and dietary information
- **Orders** with complete lifecycle tracking
- **Addresses** for delivery locations
- **Order Items** with customizations and special instructions

## 🔧 Development Commands

### Backend Development

```bash
cd backend
npm run dev        # Start with nodemon
npm run start      # Start production server
npm run db:setup   # Setup database with demo data
npm run lint       # Lint code
npm test           # Run tests
```

### Frontend Development

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
```

### Database Commands

```bash
cd backend
npm run db:setup   # Setup database with migrations and seeds
npm run db:reset   # Reset database (recreate tables and data)
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

## 📂 Key Features

### Current Features

- ✅ User authentication (login/register)
- ✅ Restaurant browsing and search
- ✅ Menu viewing with categories
- ✅ Cart management with Zustand
- ✅ Order placement and tracking
- ✅ Multiple address management
- ✅ Real-time order updates
- ✅ Rating and reviews
- ✅ Responsive design
- ✅ Type-safe APIs

### Upcoming Features

- 🔄 Payment integration (Stripe/Razorpay)
- 🔄 Live order tracking with maps
- 🔄 Push notifications
- 🔄 Restaurant dashboard
- 🔄 Delivery agent app
- 🔄 Admin panel
- 🔄 Mobile app (React Native)

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test              # Run all tests
npm run test:unit     # Run unit tests
npm run test:integration # Run integration tests
npm run test:coverage # Generate coverage report
```

### Frontend Testing

```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📝 Code Quality

```bash
# Backend
cd backend
npm run lint          # Lint code
npm run lint:fix      # Fix linting issues

# Frontend
cd frontend
npm run lint          # Lint code
```

## 🔒 Security Features

- **Helmet**: Sets various HTTP headers for security
- **Rate Limiting**: Prevents abuse with request rate limiting
- **Input Validation**: Joi validation for all inputs
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **CORS**: Configured for cross-origin requests
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection

## 🚀 Performance Features

- **Redis Caching**: Cache frequently accessed data
- **Database Indexing**: Optimized database queries
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Efficient database connections
- **Code Splitting**: Lazy loading of React components
- **Image Optimization**: Optimized image delivery

## 📖 Documentation

- [Project Structure](./PROJECT_STRUCTURE.md) - Detailed project structure
- [API Documentation](./docs/API.md) - API endpoints and examples
- [Deployment Guide](./docs/DEPLOYMENT.md) - How to deploy
- [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For support or questions, please create an issue in the repository.

---

Made with ❤️ for food lovers everywhere! 🍕🍜🍰

A comprehensive food delivery platform supporting customers, restaurants, delivery agents, and administrators with real-time tracking, multi-restaurant ordering, and comprehensive notification systems.

## 🚀 Features

### For Customers

- Multi-restaurant ordering from a single cart
- Real-time order tracking with live location updates
- Advanced search and filtering options
- Personalized recommendations
- Multiple payment methods
- Order history and reordering
- Push notifications for order updates

### For Restaurants

- Order management dashboard
- Menu management with real-time updates
- Analytics and reporting
- Inventory tracking
- Customer feedback management
- Business insights and performance metrics

### For Delivery Agents

- Order acceptance and management
- Real-time navigation and route optimization
- Earnings tracking and analytics
- Customer communication tools
- Status updates and proof of delivery

### For Administrators

- Comprehensive system overview
- User and restaurant management
- Order monitoring and dispute resolution
- Financial management and reporting
- System configuration and maintenance

## 🛠 Tech Stack

### Backend

- **Node.js** with Express.js
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **Socket.io** for real-time features
- **JWT** for authentication
- **Nodemailer** for email notifications
- **Multer** for file uploads

### Frontend

- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for forms
- **Socket.io Client** for real-time updates
- **Axios** for API calls

### Development Tools

- **ESLint** and **Prettier** for code formatting
- **Husky** for git hooks
- **Jest** for testing
- **Docker** for containerization

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm or yarn

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**

```bash
git clone https://github.com/your-username/globaleats.git
cd globaleats
```

2. **Run the setup script**

```bash
npm run setup
```

This will automatically:

- Create environment files
- Install all dependencies
- Set up the project structure

3. **Start the application**

```bash
# Using Docker (recommended)
npm run docker:up

# Or using local development
npm run dev
```

### Option 2: Manual Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/globaleats.git
cd globaleats
```

2. **Install dependencies**

```bash
npm run install:all
```

3. **Set up environment variables**

```bash
# Create server environment file
cat > server/.env << EOF
# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=postgres
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=faltuemailhaisala@gmail.com
SMTP_PASS=frilymrfoqojlmuf
SMTP_FROM=Global-Eats <faltuemailhaisala@gmail.com>

# Application Configuration
APP_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
EOF

# Create client environment file
cat > client/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GlobalEats
EOF
```

4. **Set up the database**

```bash
# Start PostgreSQL (if not using Docker)
# Create database tables
cd server && npm run db:migrate

# Seed initial data
npm run db:seed
```

5. **Start the development servers**

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:server  # Backend on port 5000
npm run dev:client  # Frontend on port 3000
```

## 📁 Project Structure

```
globaleats/
├── server/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   └── package.json
├── client/                 # Customer frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   └── package.json
├── admin/                  # Admin dashboard
├── restaurant-panel/       # Restaurant management
├── delivery-app/           # Delivery agent app
├── shared/                 # Shared utilities
└── docs/                   # Documentation
```

## 🔧 Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all applications for production
- `npm run test` - Run tests for all applications
- `npm run lint` - Run linting for all applications

### Server

- `npm run dev:server` - Start backend server in development mode
- `npm run build:server` - Build backend for production
- `npm run test:server` - Run backend tests
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data

### Client

- `npm run dev:client` - Start frontend in development mode
- `npm run build:client` - Build frontend for production
- `npm run test:client` - Run frontend tests

## 🗄 Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts (customers, restaurants, delivery agents, admins)
- **restaurants** - Restaurant information and settings
- **menu_items** - Restaurant menu items
- **orders** - Order information with multi-restaurant support
- **order_items** - Individual items in orders
- **addresses** - User delivery addresses
- **payments** - Payment transactions
- **notifications** - System notifications
- **ratings** - User ratings and reviews

## 🔐 Authentication & Authorization

The application implements role-based access control with the following user roles:

- **customer** - Can place orders, track deliveries, manage profile
- **restaurant** - Can manage menu, process orders, view analytics
- **delivery** - Can accept orders, update delivery status
- **admin** - Full system access and management

## 📱 Real-Time Features

- Live order tracking with GPS coordinates
- Real-time notifications for all stakeholders
- Live chat between customers and delivery agents
- Real-time dashboard updates for restaurants and admins

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:server
npm run test:client

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```bash
docker-compose up -d
```

### Environment Variables for Production

Make sure to update all environment variables for production deployment, including:

- Database connection strings
- JWT secrets
- SMTP credentials
- API keys for external services

## 📊 Monitoring & Analytics

The application includes comprehensive monitoring and analytics:

- Application performance monitoring
- Error tracking and logging
- Business metrics and KPIs
- User behavior analytics
- Real-time dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@globaleats.com or create an issue in the repository.

## 🔗 Links

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guidelines](CONTRIBUTING.md)
