# SmartPlugDecoder Backend Architecture

## 🎯 Backend Purpose & Vision

**Core Mission**: Create a robust, scalable IoT device management system that seamlessly discovers, connects, and controls smart plugs while providing real-time energy monitoring and optimization.

**Key Value Propositions**:
1. **Universal Device Support** - Works with multiple smart plug protocols (Tuya, UPnP, Zigbee, Z-Wave)
2. **Real-time Performance** - Sub-500ms device control and status updates
3. **Scalable Architecture** - Supports 100+ devices per user with room for growth
4. **Energy Intelligence** - Advanced analytics for cost optimization and energy efficiency
5. **Future-Ready** - Designed for solar panel and battery integration

## 🏗️ Architecture Overview

### Microservices Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                             │
│           (Rate Limiting, Auth, Load Balancing)            │
└─────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
    ┌───────────▼─────────┐  ┌─▼──────────┐  ┌▼─────────────┐
    │   Device Service    │  │  Energy    │  │   User       │
    │                     │  │  Service   │  │   Service    │
    │ • Discovery         │  │            │  │              │
    │ • Control           │  │ • Monitor  │  │ • Auth       │
    │ • Status            │  │ • Analytics│  │ • Profiles   │
    │ • Protocols         │  │ • Costs    │  │ • Settings   │
    └─────────────────────┘  └────────────┘  └──────────────┘
                │                     │              │
    ┌───────────▼─────────┐  ┌─────────▼──────┐     │
    │   Message Queue     │  │   Time Series  │     │
    │   (Redis/Bull)      │  │   Database     │     │
    │                     │  │   (InfluxDB)   │     │
    │ • Device Events     │  │                │     │
    │ • Control Commands  │  │ • Power Data   │     │
    │ • Status Updates    │  │ • Energy Logs  │     │
    └─────────────────────┘  └────────────────┘     │
                │                     │              │
    ┌───────────▼─────────┐  ┌─────────▼──────┐     │
    │   Protocol Layer    │  │   PostgreSQL   │     │
    │                     │  │                │     │
    │ • Tuya Client       │  │ • Devices      │◄────┘
    │ • UPnP Scanner      │  │ • Users        │
    │ • Zigbee Hub        │  │ • Settings     │
    │ • Z-Wave Controller │  │ • Schedules    │
    └─────────────────────┘  └────────────────┘
```

## 🛠️ Technology Stack

### Core Backend Technologies
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with Helmet, CORS, Rate Limiting
- **API**: RESTful APIs + GraphQL for complex queries
- **Real-time**: Socket.io for device status updates
- **Validation**: Zod for type-safe API validation

### Databases
- **Primary Database**: PostgreSQL with Prisma ORM
  - User accounts, device registry, settings, schedules
- **Time-Series Database**: InfluxDB
  - Power consumption data, energy metrics, historical analytics
- **Cache/Session**: Redis
  - Session management, API rate limiting, device state cache

### Device Communication
- **Tuya Integration**: Official Tuya IoT SDK
- **UPnP Discovery**: node-ssdp for network scanning
- **Zigbee Support**: zigbee-herdsman for Zigbee devices
- **Z-Wave Support**: node-zwave-js for Z-Wave devices
- **MQTT**: For local device communication

### DevOps & Monitoring
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for development
- **Monitoring**: Prometheus + Grafana for metrics
- **Logging**: Winston with structured logging
- **Error Tracking**: Sentry for error monitoring

## 📋 MVP Backend Features (Priority Order)

### Phase 1: Core Device Management (Weeks 1-2)
1. **Device Discovery Service**
   - UPnP/SSDP network scanning
   - Tuya Cloud API integration
   - Device capability detection
   - Connection validation

2. **Device Control Service**
   - ON/OFF device control
   - Status monitoring
   - Connection management
   - Error handling and retries

3. **Basic API Endpoints**
   - `GET /api/devices` - List devices
   - `POST /api/devices/discover` - Scan network
   - `PUT /api/devices/:id/control` - Control device
   - `GET /api/devices/:id/status` - Get device status

### Phase 2: Real-time Features (Weeks 2-3)
1. **WebSocket Integration**
   - Real-time device status updates
   - Live power consumption streaming
   - Connection status notifications

2. **Energy Monitoring**
   - Power consumption tracking
   - Basic energy calculations
   - Historical data storage (InfluxDB)

3. **Enhanced API**
   - `GET /api/energy/:deviceId` - Energy data
   - `GET /api/energy/summary` - Total consumption
   - WebSocket events for real-time updates

### Phase 3: Intelligence & Optimization (Weeks 3-4)
1. **Analytics Service**
   - Cost calculations
   - Usage patterns analysis
   - Energy efficiency recommendations

2. **Scheduling System**
   - Basic device scheduling
   - Time-based automation
   - Energy optimization rules

### Phase 4: Production Ready (Week 4)
1. **Security Implementation**
   - JWT authentication
   - Device encryption
   - API rate limiting
   - Security headers

2. **Production Optimization**
   - Database optimization
   - Caching strategies
   - Error monitoring
   - Performance metrics

## 🔌 Device Protocol Support Strategy

### Primary Focus: Tuya Ecosystem
- **Tuya Cloud API**: Official cloud integration for wide device support
- **Local Tuya**: Direct local communication for faster response times
- **Device Pairing**: Automated pairing through Tuya Smart Life app

### Secondary Protocols
- **UPnP/SSDP**: Universal discovery for various manufacturers
- **Matter/Thread**: Future-proofing for new IoT standard
- **Zigbee/Z-Wave**: Hub-based smart home devices

### Protocol Abstraction Layer
```typescript
interface DeviceController {
  discover(): Promise<DiscoveredDevice[]>;
  connect(device: DiscoveredDevice): Promise<ConnectedDevice>;
  control(deviceId: string, command: DeviceCommand): Promise<void>;
  getStatus(deviceId: string): Promise<DeviceStatus>;
  subscribe(deviceId: string, callback: StatusCallback): void;
}

class TuyaController implements DeviceController { /* ... */ }
class UPnPController implements DeviceController { /* ... */ }
class ZigbeeController implements DeviceController { /* ... */ }
```

## 📊 Database Design

### PostgreSQL Schema
```sql
-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Device Registry
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  room VARCHAR(100),
  device_type VARCHAR(50) NOT NULL,
  protocol VARCHAR(50) NOT NULL,
  mac_address VARCHAR(17),
  ip_address INET,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  firmware_version VARCHAR(50),
  is_online BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Device Capabilities
CREATE TABLE device_capabilities (
  device_id UUID PRIMARY KEY REFERENCES devices(id),
  has_power_monitoring BOOLEAN DEFAULT false,
  has_scheduling BOOLEAN DEFAULT false,
  has_dimming BOOLEAN DEFAULT false,
  max_power INTEGER,
  supported_commands TEXT[] -- JSON array of supported commands
);

-- Schedules and Automation
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id),
  name VARCHAR(255) NOT NULL,
  cron_expression VARCHAR(100) NOT NULL,
  command JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### InfluxDB Schema
```
// Power consumption measurements
power_consumption,device_id=uuid,user_id=uuid power=float,voltage=float,current=float,energy=float timestamp

// Device status events
device_status,device_id=uuid,user_id=uuid online=boolean,power_state=boolean timestamp

// Energy costs
energy_costs,device_id=uuid,user_id=uuid cost=float,rate=float timestamp
```

## 🚀 Performance Optimizations

### Real-time Performance
- **Connection Pooling**: Maintain persistent connections to devices
- **Redis Caching**: Cache device states and frequently accessed data
- **WebSocket Optimization**: Efficient event broadcasting
- **Database Indexing**: Optimized queries for device lookups

### Scalability Measures
- **Horizontal Scaling**: Stateless service design
- **Load Balancing**: Multiple service instances
- **Database Sharding**: User-based data partitioning
- **CDN Integration**: Static asset optimization

### Monitoring & Metrics
- **Response Time Tracking**: <2s device control, <500ms status updates
- **Error Rate Monitoring**: <0.1% error rate target
- **Device Connection Health**: Real-time connection monitoring
- **Resource Usage**: Memory, CPU, and network utilization

## 🔒 Security Implementation

### Device Security
- **End-to-End Encryption**: Secure device communication
- **Device Authentication**: Certificate-based device validation
- **Network Isolation**: Separate IoT network recommendations
- **Firmware Validation**: Device firmware integrity checks

### API Security
- **JWT Authentication**: Stateless user authentication
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests

### Data Protection
- **Data Encryption**: At-rest and in-transit encryption
- **Access Logging**: Comprehensive audit trails
- **GDPR Compliance**: User data protection measures
- **Backup Security**: Encrypted backup strategies

## 🎯 Integration Roadmap

### Phase 1: MVP Foundation (Current)
- Basic device discovery and control
- Simple energy monitoring
- RESTful API with WebSocket updates

### Phase 2: Enhanced Intelligence
- Advanced analytics and reporting
- Automated scheduling and optimization
- Cost analysis and recommendations

### Phase 3: Ecosystem Integration
- Solar panel integration (SolarEdge, Enphase, Fronius)
- Battery storage integration (Tesla Powerwall, LG Chem)
- Smart home hub integration (Home Assistant, SmartThings)

### Phase 4: Advanced Features
- Machine learning for usage prediction
- Dynamic pricing optimization
- Multi-user and organization support
- Mobile app development

## 📈 Success Metrics

### Technical Metrics
- **Device Control Latency**: <2 seconds average
- **Real-time Update Latency**: <500ms average
- **System Uptime**: >99.5%
- **Error Rate**: <0.1%
- **Concurrent Device Support**: 100+ per user

### Business Metrics
- **Energy Cost Reduction**: 15-30% for users
- **Device Compatibility**: Support for 80% of popular smart plugs
- **User Engagement**: Daily active usage >70%
- **Setup Success Rate**: >95% successful device additions

This architecture provides a solid foundation for building a production-ready smart plug management system that can scale with user needs and integrate with future technologies.