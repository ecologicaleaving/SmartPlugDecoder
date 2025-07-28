# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartPlugDecoder is an IoT Energy Management System designed to discover, connect, and control smart plugs with future integration for photovoltaic inverters and battery storage systems. The system aims to optimize energy consumption and reduce costs by 15-30% through intelligent device control.

## Architecture

The system follows a microservices architecture with these core components:

- **Device Discovery Service**: Handles smart plug detection via UPnP, mDNS, and manufacturer protocols
- **Device Control Service**: Manages secure connections and real-time device control
- **Energy Management Service**: Monitors consumption, calculates costs, and optimizes schedules
- **Web Interface**: Responsive React-based dashboard for device management
- **Future Integration Layer**: Planned support for PV inverters (SolarEdge, Enphase, Fronius, SMA) and battery systems (Tesla Powerwall, LG Chem, Sonnen)

## Technology Stack (Implemented)

**Frontend Stack:**
- ✅ React 19 with TypeScript for responsive web interface
- ✅ Vite for fast development and optimized builds
- ✅ Tailwind CSS for dark theme styling system
- ✅ React Router for multi-page navigation
- ✅ Recharts for energy monitoring charts and analytics
- ✅ Socket.io-client for real-time device updates

**Backend Stack:**
- ✅ Node.js with TypeScript and Express.js framework
- ✅ Zod for API validation and type safety
- ✅ Winston for structured logging with file rotation
- ✅ Socket.io for real-time WebSocket communication
- 🔄 PostgreSQL with Prisma ORM (planned)
- 🔄 InfluxDB for time-series energy metrics (planned)
- 🔄 Redis for caching and session management (planned)

**IoT Communication:**
- ✅ node-ssdp for UPnP/SSDP device discovery
- 🔄 Tuya Cloud API integration (planned)
- 🔄 Local Tuya protocol support (planned)
- 🔄 Zigbee and Z-Wave hub integration (planned)

**DevOps & Security:**
- ✅ Docker containerization ready
- ✅ Comprehensive error handling and logging
- 🔄 Rate limiting and security headers (planned)
- 🔄 JWT authentication system (planned)
- 🔄 CI/CD pipeline with GitHub Actions (planned)

## Key Development Considerations

### Device Integration
- Primary focus on Tuya-based smart plugs initially
- Support for multiple protocols: Wi-Fi, Zigbee, Z-Wave, planned Matter/Thread
- Secure device authentication with end-to-end encryption
- Automatic reconnection handling for network interruptions

### Performance Requirements
- <2 second response time for device control commands
- Support for 100+ concurrent smart plugs per user
- <500ms latency for real-time data updates
- 99.5% uptime requirement

### Security Implementation
- Multi-factor authentication for user accounts
- Device communication encryption
- Security audit logging
- Compliance with IoT Security Foundation guidelines

### Energy Management Features
- Real-time power consumption monitoring
- Historical data tracking and analytics
- Cost calculation based on utility rates
- Automated schedule optimization
- Load balancing to prevent peak demand charges

## Future Integration Points

### PV Inverter Integration
- RESTful APIs for major inverter brands
- Real-time solar generation monitoring
- Production forecast integration for device scheduling

### Battery Storage Integration
- State of charge monitoring
- Charge/discharge cycle optimization
- Coordination between solar, battery, and device consumption

## Development Workflow

### Frontend-First Development Approach
The project follows a frontend-first development methodology:

1. **Phase 1**: Frontend setup with React + TypeScript, component structure, and mock data
2. **Phase 2**: Component testing with Jest + React Testing Library
3. **Phase 3**: Backend service integration with progressive API connection
4. **Phase 4**: End-to-end testing and deployment

### Testing Strategy
**Component Testing Requirements:**
- Each React component must have unit tests before proceeding to next phase
- Test coverage minimum: 80% for components, 90% for business logic
- Testing tools: Jest, React Testing Library, MSW for API mocking
- Test categories: Unit tests, Integration tests, E2E tests with Playwright

**Testing Phases:**
1. **Component Tests**: Individual component functionality and props
2. **Integration Tests**: Component interaction and data flow
3. **API Tests**: Backend service endpoints and data validation
4. **E2E Tests**: Full user workflow testing

### Task Management
- **tasks.md**: Main task tracking file with detailed subtasks and progress
- **Regular Updates**: Document feature development progress and decisions
- **Milestone Tracking**: Update completion status for each development phase

### Version Control Strategy
**GitHub Repository Management:**
- **Main Branch**: Production-ready code only
- **Develop Branch**: Integration branch for features
- **Feature Branches**: `feature/component-name` or `feature/functionality`
- **Hotfix Branches**: `hotfix/issue-description`

**Commit Standards:**
- Conventional Commits format: `type(scope): description`
- Types: feat, fix, test, docs, refactor, style, chore
- Example: `feat(devices): add device card component with power toggle`

**Branch Protection:**
- Require pull request reviews before merging to main
- Require status checks to pass (tests, linting)
- No direct pushes to main branch

### Development Commands

**Frontend (React + TypeScript + Vite):**
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run test         # Run component tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # ESLint code analysis
npm run lint:fix     # Auto-fix linting issues
npm run typecheck    # TypeScript type checking
```

**Backend (Node.js + Express):**
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run API tests
npm run test:integration # Run integration tests
npm run lint         # ESLint for backend code
```

**Docker Development:**
```bash
docker-compose up -d         # Start all services
docker-compose logs -f       # Follow logs
docker-compose down          # Stop all services
docker-compose run --rm api npm test  # Run tests in container
```

### File Organization
- **src/components/**: React components with co-located test files
- **src/hooks/**: Custom React hooks for state management
- **src/services/**: API service layer and device communication
- **src/types/**: TypeScript type definitions
- **tests/**: E2E tests and test utilities
- **docs/**: Technical documentation and API specs