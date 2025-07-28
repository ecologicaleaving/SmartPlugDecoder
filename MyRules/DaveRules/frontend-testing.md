# Frontend Testing Guidelines

## Component Testing

### React Testing Library
- Test components as users interact with them
- Focus on accessibility-first testing
- Use semantic queries over test IDs
- Test user interactions and events
- Verify component state changes

### Component Structure
- Test individual component rendering
- Validate props and default values
- Test event handlers and callbacks
- Verify state management
- Test error boundaries

## Context Testing

### Provider Testing
- Test context providers in isolation
- Verify state propagation
- Test context updates
- Validate error handling
- Test context initialization

### Consumer Testing
- Test components with mock context
- Verify context consumption
- Test context-dependent behavior
- Validate context updates
- Test error scenarios

## Mocking Strategies

### API Mocking
- Use MSW for API mocking
- Mock network requests
- Test loading states
- Verify error handling
- Test data transformations

### Context Mocking
```typescript
// Example context mock
jest.mock('./WebSocketContext', () => {
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

### Component Mocking
```typescript
// Example component mock
function TestConnectionStatus({
  status = 'disconnected',
  isConnected = false,
  reconnect = jest.fn()
}) {
  return <div>Status: {status}</div>;
}
```

## State Management Testing

### Redux/Context Testing
- Test action creators
- Verify reducers
- Test selectors
- Validate state updates
- Test middleware

### Custom Hooks Testing
- Test hook behavior
- Verify state updates
- Test side effects
- Validate cleanup
- Test error handling

## Integration Testing

### Component Integration
- Test component interactions
- Verify data flow
- Test user workflows
- Validate state management
- Test error scenarios

### API Integration
- Test API calls
- Verify data handling
- Test error states
- Validate loading states
- Test retry logic

## E2E Testing

### Cypress Testing
- Test critical user flows
- Verify component interactions
- Test API integration
- Validate state persistence
- Test error scenarios

### Test Structure
```typescript
describe('User Flow', () => {
  beforeEach(() => {
    cy.login('user', 'password');
    cy.visit('/dashboard');
  });

  it('completes user workflow', () => {
    cy.get('[data-testid="start-button"]').click();
    cy.get('[data-testid="progress"]').should('be.visible');
    cy.get('[data-testid="complete"]').should('be.visible');
  });
});
```

## Best Practices

### Test Organization
- Group related tests
- Use descriptive names
- Follow AAA pattern
- Keep tests focused
- Maintain test isolation

### Performance
- Optimize test speed
- Use proper cleanup
- Avoid unnecessary renders
- Mock heavy operations
- Use proper async handling

### Maintenance
- Keep tests updated
- Remove obsolete tests
- Document test patterns
- Share test utilities
- Review test coverage 