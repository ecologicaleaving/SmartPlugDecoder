# Testing Strategy for Stage Control Project

## Overview

This document outlines the comprehensive testing strategy for the Stage Control project, detailing the selected testing frameworks, implementation approach, and best practices.

## Testing Framework Stack

### 1. Primary Test Runner: Jest
- Industry standard for JavaScript/TypeScript testing
- Excellent TypeScript support
- Built-in mocking capabilities
- Snapshot testing for UI components
- Parallel test execution for improved performance
- Comprehensive coverage reporting

### 2. Frontend Testing

#### React Testing Library
- User-centric testing approach
- Testing components as users interact with them
- Encourages accessibility-first testing practices
- Simple and intuitive API
- Reduces test maintenance by avoiding implementation details

#### Mock Service Worker (MSW)
- API mocking for component tests
- Consistent API mocking across unit and integration tests
- Network request interception
- Realistic API testing environment

### 3. Backend Testing

#### Supertest
- HTTP assertions for Express endpoints
- Clean API for testing REST endpoints
- Support for authentication testing
- File upload/download testing capabilities

#### Mock-Socket
- WebSocket mocking for socket.io functionality
- Testing real-time communication
- Event emission and reception testing
- Connection state testing

### 4. End-to-End Testing: Cypress
- Real browser testing environment
- Excellent developer experience
- Built-in waiting mechanisms
- Time-travel debugging
- Network traffic control
- File upload testing support
- Cross-browser testing capabilities

## Test Implementation Strategy

### 1. Unit Tests

#### Components
- Individual React component testing
- Props validation
- Event handling
- State management
- Rendering logic
- Error boundaries

#### Utilities
- Helper functions
- Data transformations
- Validation logic
- File handling utilities
- Timer calculations

#### Hooks
- Custom hook behavior
- State updates
- Side effects
- Error handling
- Cleanup functions

#### Context Providers and Consumers
- **Test Double Approach**
  - Create standalone test doubles that mimic context API
  - Ensure mocks are self-contained to avoid reference errors
  - Provide mock implementations of custom hooks like `useWebSocket()`
  - Include complete interface implementations

- **Mocking Strategies**
  ```typescript
  // Approach 1: Dedicated mock utilities
  // src/test-utils/setupWebSocketMock.tsx
  export const mockWebSocketValue = {
    status: 'disconnected',
    isConnected: false,
    reconnect: jest.fn(),
  };

  export const renderWithWebSocket = (ui: React.ReactElement) => {
    return render(
      <MockWebSocketProvider>{ui}</MockWebSocketProvider>
    );
  };

  // Approach 2: Test components that mimic real components
  function TestConnectionStatus({
    status = 'disconnected',
    isConnected = false,
    reconnect = jest.fn()
  }) {
    // Implementation that mimics real component behavior
    return <div>Status: {status}</div>;
  }
  ```

- **Factory Function Implementation**
  - Never reference imported variables in `jest.mock()` factories
  - Define all values locally within factory functions
  - For enums/constants, redefine them within the mock
  ```typescript
  // Correct approach for Context mocking
  jest.mock('./WebSocketContext', () => {
    // Local definitions
    const mockStatus = {
      Connected: 'connected',
      Disconnected: 'disconnected'
    };
    
    return {
      useWebSocket: () => ({
        status: mockStatus.Disconnected,
        isConnected: false
      })
    };
  });
  ```

- **State Control in Tests**
  - Expose methods to control mock state during tests
  - Reset state between test runs
  - Provide mechanisms to trigger events

- **Provider Testing**
  - Mock dependencies that context providers use
  - Expose event triggers for testing
  - Verify state propagation to consumers
  ```typescript
  // For provider testing:
  jest.mock('../services/WebSocketService', () => {
    const { Subject } = jest.requireActual('rxjs');
    const statusSubject = new Subject();
    
    return {
      __statusSubject: statusSubject, // Control point
      WebSocketService: {
        getInstance: jest.fn().mockReturnValue({
          // Mock implementation...
        })
      }
    };
  });
  
  test('updates consumers on connection change', () => {
    // Use the exposed subject to trigger changes
    act(() => {
      statusSubject.next('connected');
    });
    // Verify consumer state updated
  });
  ```

- **Consumer Testing**
  - Test components with mock context wrappers
  - Verify they respond correctly to context changes
  - Test all interaction paths

- **TypeScript Integration**
  - Maintain proper type safety in mocks
  - Define interfaces for mock implementations
  - Check props and state types

- **Focus on Behavior, Not Implementation**
  - Test what users would see and interact with
  - Avoid testing context implementation details
  - Test visible component behavior

- **State Change Best Practices**
  - Wrap state changes in act()
  - Use act() for timeouts and async updates
  - Fix act() warnings to ensure test reliability

### 2. Integration Tests

#### API Endpoints
- Route handling
- Request/response validation
- Authentication/authorization
- Error handling
- File operations
- Database interactions

#### WebSocket Events
- Connection management
- Event handling
- Real-time updates
- Reconnection logic
- Error scenarios

#### File Operations
- Upload/download functionality
- Format validation
- Size restrictions
- Storage management
- Error handling

### 3. End-to-End Tests

#### Critical User Flows
- Session management
- Agenda creation and updates
- Timer functionality
- Slide presentation
- Authentication flows

#### Edge Cases
- Network interruptions
- Invalid file formats
- Concurrent operations
- Session conflicts
- Timer synchronization

## Implementation Plan

### Phase 1: Setup Testing Infrastructure

1. Configure Jest
   ```json
   {
     "preset": "ts-jest",
     "testEnvironment": "jsdom",
     "setupFilesAfterEnv": ["<rootDir>/src/setupTests.ts"],
     "moduleNameMapper": {
       "\\.(css|less|scss)$": "identity-obj-proxy"
     }
   }
   ```

2. Setup React Testing Library
   ```typescript
   // src/setupTests.ts
   import '@testing-library/jest-dom';
   import 'jest-extended';
   ```

3. Configure Cypress
   ```javascript
   // cypress.config.js
   export default {
     e2e: {
       baseUrl: 'http://localhost:3000',
       supportFile: 'cypress/support/e2e.ts',
       specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'
     }
   };
   ```

4. Setup Test Database
   - Separate test database configuration
   - Data seeding utilities
   - Cleanup procedures

5. Configure Coverage Reporting
   ```json
   {
     "coverageThreshold": {
       "global": {
         "branches": 80,
         "functions": 80,
         "lines": 80,
         "statements": 80
       }
     }
   }
   ```

### Phase 2: Test Implementation

#### Frontend Tests
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Timer } from './Timer';

describe('Timer Component', () => {
  it('displays correct time format', () => {
    render(<Timer duration={300} />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('handles start/pause correctly', () => {
    render(<Timer duration={300} />);
    const button = screen.getByRole('button', { name: /start/i });
    fireEvent.click(button);
    expect(button).toHaveTextContent(/pause/i);
  });
});
```

#### React Context Tests
```typescript
// Example context test
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { WebSocketProvider, useWebSocket } from './WebSocketContext';
import { ConnectionStatus } from '../services/WebSocketService';

// Mock WebSocketService module
jest.mock('../services/WebSocketService', () => {
  // Create a Subject we can control for testing
  const { Subject } = jest.requireActual('rxjs');
  const connectionStatusSubject = new Subject();
  
  // Define local ConnectionStatus enum to avoid reference errors
  const mockConnectionStatus = {
    Connected: 'connected',
    Connecting: 'connecting',
    Disconnected: 'disconnected',
    Error: 'error'
  };
  
  return {
    __esModule: true,
    // Export the constant for use in tests
    ConnectionStatus: mockConnectionStatus,
    // Export the subject so tests can emit values
    __connectionStatusSubject: connectionStatusSubject,
    WebSocketService: {
      getInstance: jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        emit: jest.fn(),
        on: jest.fn().mockImplementation(() => jest.fn()),
        connectionStatus$: {
          subscribe: jest.fn().mockImplementation(callback => {
            connectionStatusSubject.subscribe(callback);
            return { unsubscribe: jest.fn() };
          })
        }
      })
    }
  };
});

// Get the connection subject for testing
const mockModule = jest.requireMock('../services/WebSocketService');
const connectionStatusSubject = mockModule.__connectionStatusSubject;
const { ConnectionStatus } = mockModule;

// Simple test component that uses the context
const TestComponent = () => {
  const { status, isConnected } = useWebSocket();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="connected">{isConnected.toString()}</div>
    </div>
  );
};

describe('WebSocketContext', () => {
  test('provides WebSocket context to child components', () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );
    
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('connected')).toHaveTextContent('false');
  });

  test('updates connection status when WebSocket state changes', () => {
    render(
      <WebSocketProvider>
        <TestComponent />
      </WebSocketProvider>
    );
    
    // Emit connected status
    act(() => {
      connectionStatusSubject.next(ConnectionStatus.Connected);
    });
    
    // Should update to connected
    expect(screen.getByTestId('status')).toHaveTextContent('connected');
    expect(screen.getByTestId('connected')).toHaveTextContent('true');
  });
});

#### Backend Tests
```typescript
// Example API test
import request from 'supertest';
import { app } from './app';

describe('Session API', () => {
  it('creates new session', async () => {
    const response = await request(app)
      .post('/api/sessions')
      .send({
        title: 'Test Session',
        duration: 3600
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

#### WebSocket Tests
```typescript
// Example WebSocket test
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';

describe('WebSocket Events', () => {
  let io: Server;
  let clientSocket: any;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  it('emits timer updates', (done) => {
    clientSocket.on('timerUpdate', (data: any) => {
      expect(data).toHaveProperty('remaining');
      expect(data).toHaveProperty('status');
      done();
    });
    io.emit('timerUpdate', { remaining: 290, status: 'running' });
  });
});
```

#### E2E Tests
```typescript
// Example Cypress test
describe('Session Management', () => {
  beforeEach(() => {
    cy.login('admin', 'password');
    cy.visit('/sessions');
  });

  it('creates and activates a session', () => {
    cy.get('[data-testid="create-session"]').click();
    cy.get('[data-testid="session-title"]').type('Test Session');
    cy.get('[data-testid="save-session"]').click();
    cy.get('[data-testid="session-list"]')
      .should('contain', 'Test Session');
    cy.get('[data-testid="activate-session"]').click();
    cy.get('[data-testid="session-status"]')
      .should('have.text', 'Active');
  });
});
```

## Best Practices

1. Test Organization
   - Group tests logically by feature/component
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)
   - Keep tests focused and atomic

2. Mocking Strategy
   - Mock external dependencies
   - Use MSW for API mocking
   - Create reusable mock factories
   - Avoid excessive mocking

3. Coverage Goals
   - Maintain 80% or higher coverage
   - Focus on critical business logic
   - Include edge cases
   - Test error scenarios

4. CI/CD Integration
   - Run tests on every PR
   - Enforce coverage thresholds
   - Generate and publish coverage reports
   - Automate E2E tests in staging

## Maintenance

1. Regular Updates
   - Keep dependencies updated
   - Review and update tests with feature changes
   - Refactor tests for maintainability
   - Document testing patterns and utilities

2. Performance
   - Monitor test execution time
   - Optimize slow tests
   - Use test parallelization
   - Implement proper cleanup

3. Documentation
   - Maintain testing documentation
   - Document testing utilities and helpers
   - Include examples for common testing scenarios
   - Update test strategy as needed