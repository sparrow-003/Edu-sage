# 🎓 EduSage AI Platform

A comprehensive AI-powered educational platform built with modern web technologies.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📁 Project Structure

```
edusage-ai-platform/
├── apps/
│   └── web/              # Next.js web application
├── packages/
│   ├── ui/               # Shared UI components
│   └── core/             # Core business logic
├── tools/
│   ├── create-edusage/   # CLI tool
│   └── scripts/          # Build scripts
└── docs/                 # Documentation
```

## 🛠️ Development

This is a monorepo managed with pnpm workspaces and Turbo.

- **Web App**: `pnpm dev:web`
- **Build All**: `pnpm build`
- **Run Tests**: `pnpm test`
- **Lint Code**: `pnpm lint`

## 📦 Packages

- `@edusage/ui` - Reusable React components
- `@edusage/core` - Business logic and utilities

## 🚀 Deployment

The project is containerized and ready for deployment with Docker.

```bash
docker-compose up -d
```
