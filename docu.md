# Hospitality Scheduler - Project Documentation

## 📋 Project Overview

A comprehensive web-based scheduling platform designed for hospitality businesses (bars, restaurants, cafes) to manage employee scheduling efficiently. The system allows staff to input their availability and administrators to generate optimized schedules automatically.

## 🏗️ Architecture Overview

### Monorepo Structure
```
hospitality-scheduler/
├── apps/
│   ├── backend/           # Node.js API server
│   └── frontend/          # React web application
├── packages/
│   └── shared/            # Shared types and utilities
├── docker-compose.yml     # Database setup
├── turbo.json            # Build orchestration
└── pnpm-workspace.yaml   # Workspace configuration
```

## 🔧 Technology Stack

### Backend (`apps/backend/`)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet.js, CORS, bcrypt
- **Validation**: Zod schemas
- **Development**: tsx for hot reloading

### Frontend (`apps/frontend/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Zustand (lightweight state management)
- **HTTP Client**: Axios with React Query for server state
- **Forms**: React Hook Form with Zod validation

### Shared Package (`packages/shared/`)
- **Purpose**: Common types, schemas, and utilities
- **Validation**: Zod schemas for API contracts
- **Types**: TypeScript interfaces shared between frontend and backend

### Infrastructure
- **Package Manager**: pnpm with workspaces
- **Build System**: Turbo for monorepo builds
- **Database**: PostgreSQL (Docker container for development)
- **Development**: Hot reloading for both frontend and backend

## 📊 Database Schema

### Core Models

#### User
- Represents staff members and administrators
- Fields: id, email, name, role (ADMIN/STAFF), passwordHash, restaurantId
- Relations: belongsTo Restaurant, hasMany Availability, hasMany ScheduledShift

#### Restaurant
- Multi-tenant support - each restaurant is isolated
- Fields: id, name
- Relations: hasMany Users, hasMany Roles, hasMany ShiftRequirements

#### Role
- Job positions (e.g., "Bartender", "Server", "Kitchen")
- Fields: id, name, restaurantId
- Relations: belongsTo Restaurant, hasMany ShiftRequirements, hasMany ScheduledShifts

#### Availability
- Staff availability preferences
- Fields: id, userId, dayOfWeek, startTime, endTime
- Relations: belongsTo User

#### ShiftRequirement
- Business needs (e.g., "Need 2 bartenders Mon 18:00-02:00")
- Fields: id, restaurantId, roleId, dayOfWeek, startTime, endTime, needed
- Relations: belongsTo Restaurant, belongsTo Role

#### ScheduledShift
- Generated schedule assignments
- Fields: id, userId, roleId, restaurantId, date, startTime, endTime
- Relations: belongsTo User, belongsTo Role, belongsTo Restaurant

## 🔄 Data Flow

### 1. Authentication Flow
```
Frontend → POST /api/auth/login → Backend validates → JWT returned → Stored in memory
```

### 2. Availability Input Flow
```
Staff logs in → Views availability form → Submits preferences → Stored in database
```

### 3. Schedule Generation Flow
```
Admin triggers generation → Backend collects requirements & availability → 
Algorithm matches them → Creates ScheduledShift records → Frontend displays result
```

### 4. Multi-Tenancy Flow
```
All database queries filtered by restaurantId → Users only see their restaurant's data
```

## 🗂️ File Structure & Components

### Backend Structure
```
apps/backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication, validation, error handling
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions
│   └── index.ts          # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts          # Database seeding
└── package.json
```

### Frontend Structure
```
apps/frontend/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── scheduling/  # Scheduling-specific components
│   │   └── layout/      # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API communication
│   ├── stores/          # Zustand state stores
│   ├── types/           # Frontend-specific types
│   ├── utils/           # Helper functions
│   └── App.tsx          # Main application component
└── package.json
```

### Shared Package Structure
```
packages/shared/
├── src/
│   ├── types/           # Shared TypeScript interfaces
│   ├── schemas/         # Zod validation schemas
│   └── utils/           # Shared utility functions
└── package.json
```

## 🔐 Security Model

### Authentication
- JWT tokens for session management
- Password hashing with bcrypt
- Secure HTTP headers with Helmet.js

### Authorization
- Role-based access control (ADMIN/STAFF)
- Restaurant-level data isolation
- API route protection with middleware

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with Prisma
- CORS configuration for frontend communication

## 🚀 Development Workflow

### Starting Development
```bash
# Start database
docker-compose up -d postgres

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Start development servers
pnpm dev
```

### Building for Production
```bash
# Build all packages
pnpm build

# Type checking
pnpm type-check

# Run tests
pnpm test
```

### Database Operations
```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create and run migrations
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Seed database with test data
pnpm --filter backend db:seed
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new restaurant
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users` - List restaurant users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Availability
- `GET /api/availability` - Get user's availability
- `POST /api/availability` - Submit availability
- `PUT /api/availability/:id` - Update availability
- `DELETE /api/availability/:id` - Delete availability

### Scheduling
- `GET /api/schedule` - Get current schedule
- `POST /api/schedule/generate` - Generate new schedule (admin only)
- `PUT /api/schedule/:id` - Manually adjust schedule (admin only)

### Restaurants & Roles
- `GET /api/restaurants/current` - Get current restaurant info
- `PUT /api/restaurants/current` - Update restaurant (admin only)
- `GET /api/roles` - List restaurant roles
- `POST /api/roles` - Create new role (admin only)

## 🎯 Key Features

### For Staff
1. **Availability Input**: Easy-to-use interface for setting weekly availability
2. **Schedule Viewing**: See assigned shifts and schedule updates
3. **Mobile Responsive**: Works on phones for on-the-go access

### for Administrators
1. **Staff Management**: Add/remove staff, assign roles
2. **Schedule Generation**: Automatic scheduling based on availability and needs
3. **Manual Adjustments**: Override automatic assignments when needed
4. **Reporting**: View scheduling statistics and coverage reports

### System Features
1. **Multi-Tenancy**: Multiple restaurants on one system
2. **Real-time Updates**: Changes sync across all connected clients
3. **Export Capabilities**: PDF/CSV export of schedules
4. **Audit Trail**: Track who made what changes when

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hospitality_scheduler"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:3000"
```

#### Frontend (.env.local)
```env
VITE_API_URL="http://localhost:3001"
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Controllers, services, utilities
- **Integration Tests**: API endpoints with test database
- **Authentication Tests**: Login/logout flows
- **Database Tests**: Model relationships and constraints

### Frontend Testing
- **Component Tests**: React component rendering and interactions
- **Hook Tests**: Custom hooks functionality
- **Integration Tests**: User workflows
- **E2E Tests**: Complete user journeys with Cypress

## 📦 Deployment Options

### Self-Hosted (Open Source)
1. **Docker Deployment**: Using provided docker-compose.yml
2. **VPS Deployment**: Direct deployment on virtual private server
3. **Cloud Deployment**: AWS, Google Cloud, or Azure

### SaaS Hosting
1. **Backend**: Railway, Render, or Heroku
2. **Frontend**: Vercel, Netlify, or Cloudflare Pages
3. **Database**: Managed PostgreSQL (AWS RDS, Google Cloud SQL)

## 🔄 State Management

### Frontend State
- **Global State**: User authentication, restaurant info (Zustand)
- **Server State**: API data caching (React Query)
- **Form State**: Form inputs and validation (React Hook Form)
- **UI State**: Component-level state (React useState)

### Backend State
- **Database State**: Persistent data (PostgreSQL + Prisma)
- **Session State**: JWT tokens
- **Cache State**: Optional Redis for performance

## 🚀 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading of route components
- **Bundle Optimization**: Vite's built-in optimizations
- **Image Optimization**: Responsive images and formats
- **Caching**: HTTP caching headers and service workers

### Backend
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Prisma connection management
- **Response Compression**: Gzip compression middleware
- **Rate Limiting**: Prevent API abuse

## 🔍 Monitoring & Observability

### Development
- **Hot Reloading**: Instant development feedback
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting

### Production
- **Error Tracking**: Structured logging and error reporting
- **Performance Monitoring**: API response times and database queries
- **Health Checks**: System status endpoints
- **Metrics**: Usage statistics and system metrics

This documentation provides a complete overview of how the Hospitality Scheduler is architected, how components interact, and how to work with the system effectively.