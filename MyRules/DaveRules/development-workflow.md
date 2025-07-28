# Development Workflow Guidelines

## Task Management

### Task Master Integration
- Use Task Master for all development tasks
- Create subtasks for testing each component/feature
- Link test tasks to implementation tasks via dependencies
- Track test coverage as part of task completion criteria

### Task Status Tracking
- Use `task-master update-subtask` to document progress
- Include test failures and resolutions in task details
- Only mark tasks as "done" when tests are passing

### Test-First Development
- Create test subtasks before implementation
- Document test requirements during task planning
- Use test completion as a gate for feature acceptance

## Development Process

### Code Implementation
- Follow Test-Driven Development (TDD) principles
- Write tests before implementing features
- Implement minimum code to make tests pass
- Refactor while maintaining test coverage

### Pre-Commit Checks
- Run relevant test suite before each commit
- Configure pre-commit hooks for automatic testing
- Block commits that would introduce failing tests
- Include lint checks in pre-commit validation

### Continuous Integration
- Run full test suite on every pull request
- Enforce branch protection requiring passing tests
- Run cross-browser/cross-device tests in CI pipeline
- Generate and archive test coverage reports

## Production Monitoring

### Error Tracking
- Implement comprehensive logging
- Set up error tracking and reporting
- Monitor performance metrics
- Create alerts for unexpected behavior

### Debugging Process
- Fix bugs as soon as they're discovered
- Prioritize bugs affecting critical functionality
- Add regression tests for each fixed bug
- Document root causes and solutions

### Debugging Workflow
- Reproduce issues consistently before fixing
- Isolate problems to smallest possible component
- Use debugging tools over console.log
- Verify fixes in multiple environments

## Team Collaboration

### Code Reviews
- Review code for test coverage
- Verify implementation matches requirements
- Check for proper error handling
- Ensure documentation is updated

### Knowledge Sharing
- Document debugging techniques
- Share lessons learned in team knowledge base
- Update testing strategy based on bug patterns
- Maintain testing documentation 