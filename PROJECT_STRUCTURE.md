# Global Eats - Project Structure

## 📁 Project Organization

```
Global-Eats2/
├── 📁 backend/                     # Backend API Server (Node.js)
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
│   │   ├── 📁 validators/          # Input validation schemas
│   │   ├── 📁 utils/               # Utility functions
│   │   ├── 📁 constants/           # App constants
│   │   ├── 📁 types/               # TypeScript type definitions
│   │   └── 📄 app.js               # Express app configuration
│   ├── 📁 tests/                   # Backend tests
│   │   ├── 📁 unit/                # Unit tests
│   │   └── 📁 integration/         # Integration tests
│   ├── 📁 logs/                    # Application logs
│   ├── 📄 package.json
│   ├── 📄 Dockerfile
│   └── 📄 .env
│
├── 📁 frontend/                    # Customer Web App (React)
│   ├── 📁 public/                  # Static files
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
│   │   │   ├── 📁 images/          # Images
│   │   │   └── 📁 icons/           # Icons
│   │   ├── 📁 styles/              # Global styles
│   │   └── 📄 main.tsx             # App entry point
│   ├── 📁 tests/                   # Frontend tests
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   ├── 📄 tailwind.config.js
│   └── 📄 .env
│
├── 📁 restaurant-dashboard/        # Restaurant Owner Dashboard (Future)
├── 📁 delivery-app/               # Delivery Agent App (Future)
├── 📁 admin-panel/                # Admin Panel (Future)
├── 📁 mobile-app/                 # React Native Mobile App (Future)
│
├── 📁 shared/                     # Shared utilities across apps
│   ├── 📁 types/                  # Shared TypeScript types
│   ├── 📁 constants/              # Shared constants
│   └── 📁 utils/                  # Shared utility functions
│
├── 📁 docs/                       # Documentation
│   ├── 📄 API.md                  # API documentation
│   ├── 📄 DEPLOYMENT.md           # Deployment guide
│   └── 📄 CONTRIBUTING.md         # Contributing guidelines
│
├── 📁 scripts/                    # Build and deployment scripts
│   ├── 📄 setup.js                # Project setup script
│   ├── 📄 deploy.js               # Deployment script
│   └── 📄 backup.js               # Database backup script
│
├── 📁 infrastructure/             # Infrastructure as Code
│   ├── 📁 docker/                 # Docker configurations
│   ├── 📁 kubernetes/             # K8s manifests
│   └── 📁 terraform/              # Terraform configs
│
├── 📄 docker-compose.yml          # Development environment
├── 📄 docker-compose.prod.yml     # Production environment
├── 📄 README.md                   # Project documentation
├── 📄 .gitignore                  # Git ignore rules
└── 📄 package.json                # Root package.json
```

## 🎯 Directory Purposes

### Backend (`/backend`)

- **controllers/**: Handle HTTP requests and responses
- **middleware/**: Authentication, validation, logging middleware
- **models/**: Database models and relationships
- **routes/**: API endpoint definitions
- **services/**: Business logic and external integrations
- **database/**: All database-related files
- **validators/**: Input validation schemas
- **utils/**: Helper functions and utilities

### Frontend (`/frontend`)

- **components/**: Reusable UI components organized by type
- **pages/**: Top-level page components
- **hooks/**: Custom React hooks for shared logic
- **services/**: API communication layer
- **store/**: Global state management
- **types/**: TypeScript type definitions
- **assets/**: Static files (images, icons, fonts)

### Shared (`/shared`)

- Common types, constants, and utilities used across multiple apps

### Infrastructure

- Docker configurations for development and production
- Deployment scripts and documentation
- Database migration and backup scripts
