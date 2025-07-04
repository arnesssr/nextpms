

A modern, modular Product Management System (PMS)  application built with Next.js 15, React 19, and TypeScript. This project follows a clean, modular architecture designed for scalability, maintainability, and ease of development.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, pnpm, or bun package manager
- Git for version control

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-pms
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📸 Screenshots

Here are some screenshots of the application:

### Dashboard Overview
![Dashboard](./docs/assets/images/dashboard.png)

### Product Management
![Product Management](./docs/assets/images/product-management.png)

### User Interface
![User Interface](./docs/assets/images/ui-components.png)

*Note: Add your application screenshots to the `docs/assets/images/` directory with appropriate names.*

## 📁 Project Structure

```
frontend-pms/
├── src/                    # Source code
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable UI components
│   ├── modules/           # Feature modules
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript type definitions
├── docs/                  # Project documentation
│   ├── architecture/     # System architecture docs
│   ├── guides/           # Development guides
│   ├── examples/         # Code examples
│   ├── api/              # API documentation
│   ├── README.md         # Documentation overview
│   └── TOOLS.md          # Tools and technologies
├── public/               # Static assets
├── CONTRIBUTING.md       # Contribution guidelines
├── CHANGELOG.md          # Project changelog
└── LICENSE               # MIT License
```

## 🏗️ Architecture

This project implements a **modular architecture** where features are organized into self-contained modules. Each module encapsulates its own components, utilities, types, and logic, promoting:

- **Separation of Concerns**: Clear boundaries between different features
- **Reusability**: Components and utilities can be shared across modules
- **Scalability**: Easy to add new features without affecting existing code
- **Maintainability**: Isolated modules are easier to test and debug

For detailed architecture information, see [docs/architecture/](./docs/architecture/).

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture Overview](./docs/architecture/README.md)** - System design and patterns
- **[Development Guides](./docs/guides/README.md)** - How-to guides for developers
- **[API Documentation](./docs/api/README.md)** - API specifications and examples
- **[Tools & Technologies](./docs/TOOLS.md)** - Tech stack and development tools

### Key Documentation Files

- [Module Definitions](./docs/architecture/module-definitions.md) - Understanding the module system
- [Creating Modules Guide](./docs/guides/creating-modules.md) - Step-by-step module creation
- [Product Module Example](./docs/examples/product-module.md) - Complete module implementation example
- [System Flow](./docs/architecture/system-flow.md) - Data flow and system interactions

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Testing framework
- **Storybook** - Component development

For a complete list of tools and technologies, see [TOOLS.md](./docs/TOOLS.md).

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our coding standards
4. Write or update tests as needed
5. Update documentation if required
6. Submit a pull request

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run type-check   # Check TypeScript types
```

## 🔧 Configuration

The project includes configuration files for:

- **TypeScript** (`tsconfig.json`) - TypeScript compiler options
- **ESLint** (`.eslintrc.json`) - Code linting rules
- **Prettier** (`.prettierrc`) - Code formatting rules
- **Tailwind CSS** (`tailwind.config.js`) - CSS framework configuration
- **Next.js** (`next.config.js`) - Framework configuration

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 📞 Support

For questions, issues, or contributions:

- Create an issue in the repository
- Follow the contributing guidelines
- Check existing documentation in the `docs/` directory

---

**Note**: This project is in active development. Features and documentation are continuously being improved. Check the [CHANGELOG.md](./CHANGELOG.md) for recent updates.
