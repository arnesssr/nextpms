# Contributing to  PMS

Thank you for your interest in contributing to Frontend PMS! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Contribution Types](#contribution-types)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project adheres to a code of conduct to ensure a welcoming environment for all contributors. By participating, you are expected to uphold this code:

- **Be respectful**: Treat all community members with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together to solve problems and improve the project
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that everyone has different experience levels

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v18 or later)
- npm or yarn package manager
- Git for version control
- A code editor (VS Code recommended)
- Basic knowledge of React, Next.js, and TypeScript

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/arnesssr/nextpms.git
   cd frontend-pms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify setup**
   - Open http://localhost:3000
   - Ensure all features work correctly

## Development Process

### Branching Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: New features (`feature/add-inventory-management`)
- **bugfix/**: Bug fixes (`bugfix/fix-login-error`)
- **hotfix/**: Critical production fixes

### Workflow

1. **Create an issue** (if one doesn't exist)
2. **Create a branch** from `develop`
3. **Make your changes** following coding standards
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Submit a pull request**

## Contribution Types

### Code Contributions

- **New Features**: Implement new PMS functionality
- **Bug Fixes**: Resolve existing issues
- **Performance Improvements**: Optimize existing code
- **Refactoring**: Improve code structure without changing functionality

### Non-Code Contributions

- **Documentation**: Improve guides, API docs, or README files
- **Bug Reports**: Report issues with detailed reproduction steps
- **Feature Requests**: Suggest new functionality
- **Design**: UI/UX improvements and mockups
- **Testing**: Add or improve test coverage

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type usage
- Use strict type checking

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Bad
const user: any = {};
```

### React Guidelines

- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use React.memo for performance when needed

```typescript
// Good
const UserCard: React.FC<{ user: User }> = ({ user }) => {
  return <div>{user.name}</div>;
};

// Use custom hooks for complex logic
const useUserData = (userId: string) => {
  // Hook implementation
};
```

### Styling Guidelines

- Use Tailwind CSS for styling
- Follow responsive design principles
- Maintain consistent spacing and colors
- Use semantic class names

```tsx
// Good
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    {title}
  </h2>
</div>
```

### File Structure

- Keep components small and focused
- Use proper file naming conventions
- Organize files by feature/module
- Export components properly

```
components/
  ui/
    Button.tsx
    Input.tsx
    Modal.tsx
  features/
    inventory/
      InventoryList.tsx
      InventoryForm.tsx
```

## Commit Guidelines

### Commit Message Format

Follow the conventional commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting changes (no code change)
- **refactor**: Code refactoring
- **test**: Adding or modifying tests
- **chore**: Build process or auxiliary tool changes

### Examples

```bash
feat(inventory): add product search functionality
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
refactor(components): extract reusable Button component
```

## Pull Request Process

### Before Submitting

1. **Ensure your branch is up to date**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

3. **Test your changes thoroughly**

### PR Template

Use this template for your pull request:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** verification
4. **Documentation** review if applicable
5. **Approval** and merge

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (when available)
npm run test:e2e
```

### Writing Tests

- Write tests for new features
- Include edge cases and error scenarios
- Follow testing best practices
- Maintain good test coverage

```typescript
// Example test
describe('UserCard Component', () => {
  it('should render user name', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserCard user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Documentation

### Types of Documentation

- **API Documentation**: Document all API endpoints
- **Component Documentation**: Props, usage examples
- **Feature Documentation**: How to use new features
- **Setup Guides**: Installation and configuration

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use proper markdown formatting

## Community

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Wiki**: For additional documentation and guides

### Reporting Issues

When reporting bugs, include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, browser, Node.js version)
5. **Screenshots** or error logs if applicable

### Feature Requests

For feature requests, provide:

1. **Clear description** of the proposed feature
2. **Use case** and benefits
3. **Possible implementation** approach
4. **Mockups or examples** if applicable

## Recognition

Contributors will be recognized in:

- **Contributors list** in the README
- **Release notes** for significant contributions
- **Special mentions** for outstanding contributions

---

## Quick Start Checklist

For new contributors:

- [ ] Read this contributing guide
- [ ] Set up development environment
- [ ] Look for "good first issue" labels
- [ ] Join community discussions
- [ ] Make your first contribution
- [ ] Ask questions when needed

Thank you for contributing to Frontend PMS! Your efforts help make this project better for everyone.
