# SmartPlugDecoder - IoT Energy Management System

A comprehensive web-based IoT energy management platform that enables users to discover, connect, and intelligently control smart plugs while providing advanced energy optimization through integration with photovoltaic (PV) inverters and battery storage systems.

## 🎯 Project Goals

- Reduce household energy consumption by 15-30% through intelligent device control
- Enable optimal utilization of renewable energy sources
- Provide real-time energy monitoring and cost analysis
- Create foundation for comprehensive home energy ecosystem management

## 🏗️ Architecture

The system follows a microservices architecture with these core components:

- **Device Discovery Service**: Handles smart plug detection via UPnP, mDNS, and manufacturer protocols
- **Device Control Service**: Manages secure connections and real-time device control
- **Energy Management Service**: Monitors consumption, calculates costs, and optimizes schedules
- **Web Interface**: Responsive React-based dashboard for device management
- **Future Integration Layer**: Planned support for PV inverters and battery systems

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Socket.io Client** for real-time updates
- **Chart.js/Recharts** for energy visualization

### Backend
- **Node.js** with **Express** and TypeScript
- **Socket.io** for real-time device communication
- **PostgreSQL** for structured data
- **InfluxDB** for time-series energy metrics
- **Docker** for containerized deployment

### IoT Integration
- **Tuya Cloud API** for Tuya-based smart plugs
- **UPnP/SSDP** for universal device discovery
- **mDNS** for local network device detection
- **Matter/Thread** support for future compatibility

## 🚀 Development Workflow

### Frontend-First Development
1. **Phase 1**: Frontend setup with React + TypeScript, component structure, and mock data
2. **Phase 2**: Component testing with Jest + React Testing Library
3. **Phase 3**: Backend service integration with progressive API connection
4. **Phase 4**: End-to-end testing and deployment

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Component interaction and API integration
- **E2E Tests**: Playwright for full user workflow testing
- **Coverage Requirements**: 80% components, 90% business logic

## 📋 Development Commands

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run component tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint         # ESLint code analysis
npm run typecheck    # TypeScript type checking
```

### Backend Development
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run API tests
npm run test:integration # Run integration tests
```

### Docker Development
```bash
docker-compose up -d         # Start all services
docker-compose logs -f       # Follow logs
docker-compose down          # Stop all services
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd SmartPlugDecoder

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Start development environment
docker-compose up -d
```

## 📁 Project Structure

```
SmartPlugDecoder/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   └── types/           # TypeScript definitions
│   └── tests/               # Frontend tests
├── backend/                 # Node.js backend services
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic services
│   │   ├── models/          # Data models
│   │   └── utils/           # Utility functions
│   └── tests/               # Backend tests
├── docs/                    # Technical documentation
├── docker-compose.yml       # Development environment
└── README.md               # This file
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Coverage Requirements
- Minimum 80% coverage for React components
- Minimum 90% coverage for business logic
- All critical user journeys covered by E2E tests

## 🚢 Deployment

The application supports both cloud and on-premises deployment:

- **Development**: Docker Compose with hot reload
- **Staging**: Docker containers with CI/CD integration
- **Production**: Kubernetes or Docker Swarm deployment

## 🔒 Security Considerations

- End-to-end encryption for all device communications
- Multi-factor authentication for user accounts
- Security audit logging for all system activities
- Compliance with IoT Security Foundation guidelines

## 📈 Supported Devices

### Current Support
- **Tuya-based smart plugs**: Direct API integration
- **UPnP compatible devices**: Universal discovery
- **TP-Link Kasa**: Community protocol support

### Future Support
- **Matter/Thread devices**: Standards-based integration
- **Zigbee 3.0 devices**: Hub-based connectivity
- **Z-Wave devices**: Professional integration

## 🔮 Future Roadmap

### Phase 1: Smart Plug Control (Current)
- Device discovery and control
- Real-time monitoring
- Basic scheduling

### Phase 2: Energy Optimization
- Advanced analytics
- Cost optimization
- Usage predictions

### Phase 3: Renewable Integration
- PV inverter integration
- Battery storage management
- Grid optimization

### Phase 4: Ecosystem Expansion
- HVAC integration
- EV charging optimization
- Community energy sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow conventional commit format
- Ensure all tests pass
- Maintain test coverage requirements
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the [CLAUDE.md](CLAUDE.md) for development guidance

---

**Built with ❤️ for smart energy management**