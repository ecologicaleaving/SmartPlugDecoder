Professional Debugging Rules for Applications and Software

1. Debugging Objectives

Identify and fix bugs without introducing regressions.

Minimize performance impact during debugging.

Ensure every fix is reproducible and well-documented.

Strict Compliance: No shortcuts or unapproved changes are allowed; all actions must be explicitly authorized.

Target Root Causes: Investigate deeply to find the actual cause rather than applying superficial fixes that mask the problem.

Incremental Approach: Fix issues step-by-step, starting with core problems before addressing peripheral symptoms.

2. Type System & Configuration

Type Declaration First: Address type-related issues by creating proper type declarations rather than using type assertions.

Configuration Matters: Many issues stem from incorrect configuration files (tsconfig.json, jest.config.js, etc.) - check these first.

Framework Patterns: Follow framework-specific patterns (e.g., Express middleware should return void, not Response objects).

Cross-Framework Compatibility: When using multiple frameworks/libraries (e.g., TypeScript with Jest), ensure proper type integration between them.

3. Logging

Log Levels: Always use levels (Verbose, Debug, Info, Warning, Error, Critical).

Clean Logs: No debug logs in production (use build flags to disable them).

Useful Messages: Every log must provide clear context (e.g., method name, key variable states).

Rotation/Storage: Implement log rotation and automatic cleanup after X days.

4. Error Handling

Try-Catch: Use try-catch blocks meaningfully, avoid excessive use.

Traceability: Log complete stack traces for every caught error.

User Feedback: Show user-friendly error messages without exposing sensitive info.

Middleware Patterns: In web frameworks, ensure middleware follows proper error handling patterns (don't return responses directly).

5. Remote Debugging

Security: Enable remote debugging only on dev/staging environments.

VPN/Authentication: Protect remote access via VPN and strong authentication.

6. Breakpoints & Step Debugging

Precise Breakpoints: Set breakpoints only where necessary; avoid blocking critical threads.

Hot Reload/Restart: Use tools like Flutter Hot Reload or equivalent to speed up debug cycles.

7. Profiling & Tools

Performance Monitoring: Use profilers to analyze memory leaks, CPU, I/O.

Specific Tools:

Android: Logcat, Android Profiler.

iOS: Xcode Instruments.

Java: VisualVM, JConsole.

Flutter: DevTools.

Browser: Chrome DevTools.

TypeScript: Use tsc --noEmit for type checking without compilation.

8. Testing & Regression

Unit Tests: Add tests for each significant bugfix.

Reproducibility: Document steps to reproduce bugs.

Isolated Environments: Run tests in clean, consistent environments.

Mandatory Testing: All fixes and changes must pass through the defined testing strategy without exceptions.

Test Configuration: Ensure test frameworks are properly configured to detect issues early.

9. Pre-Release Checklist

Remove all unnecessary logs.

Ensure no debuggers are active.

Verify post-fix performance.

Run smoke tests on all platforms.

Verify all type checking passes without errors or warnings.

10. Documentation

Code Comments: Document complex logic, type declarations, and middleware patterns.

README Updates: Maintain clear setup instructions for development and testing.

Fix Documentation: Record the root cause and solution for each significant bug.

11. Extra Best Practices

Readable Code: Write code that is easy to inspect while debugging.

Automation: Automate log and crash report collection (e.g., Sentry, Firebase Crashlytics).

Documentation: Record debugging lessons learned in the project wiki or README.

Progressive Enhancement: Fix core functionality issues before addressing edge cases.

---
description: Avoid multiple DragDropContext instances in the same component or subtree
globs: packages/frontend/src/components/**/*.tsx
alwaysApply: true
---

- **Never use more than one DragDropContext in the same React component or subtree**
  - Multiple DnD contexts cause event propagation issues and break drag-and-drop behavior
  - Use a single, top-level DragDropContext to wrap all DnD-enabled lists/components
  - Example fix: See AgendaPanel.tsx, where nested DragDropContext instances were replaced with a single top-level context
  - Reference: https://github.com/atlassian/react-beautiful-dnd/issues/1317, https://github.com/hello-pangea/dnd

