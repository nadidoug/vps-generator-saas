# Contributing to VPS Deployment Script Generator

Thank you for your interest in contributing! This guide will help you get started.

## Ways to Contribute 🌟

1. **Add New Components**
   - Server software installations
   - Security tools
   - Monitoring solutions
   - Cloud provider integrations

2. **Improve Documentation**
   - Usage examples
   - Component descriptions
   - Deployment guides
   - Best practices

3. **Bug Fixes**
   - Script generation issues
   - Component compatibility
   - Documentation errors
   - UI/UX improvements

4. **Feature Requests**
   - New deployment options
   - Additional Linux distributions
   - Integration suggestions
   - UI/UX enhancements

## Development Setup 🛠️

1. Fork and clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start development server:
```bash
npm run dev
```

## Component Development Guide 📝

### Component Structure
```typescript
{
  name: string;
  description: string;
  scriptTemplate: string;
  category: string;
  isRequired: boolean;
  dependencies: string[];
  infrastructureProvider: string | null;
  terraformConfig: string | null;
}
```

### Example Component
```typescript
{
  name: "Redis",
  description: "In-memory data structure store",
  scriptTemplate: "sudo $PKG_INSTALL redis-server",
  category: "database",
  isRequired: false,
  dependencies: [],
  infrastructureProvider: null,
  terraformConfig: null
}
```

## Pull Request Process 🔄

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## Code Style 📐

- Follow TypeScript best practices
- Use clear, descriptive names
- Add comments for complex logic
- Include type definitions
- Write unit tests

## Community 👥

- Join our Discord community
- Participate in discussions
- Help other contributors
- Share your success stories

## Recognition 🏆

Contributors will be:
- Listed in our README
- Featured in release notes
- Invited to beta program
- Considered for core team

## Questions? 💭

Open an issue or join our Discord server for help.

Thank you for contributing! 🙏
