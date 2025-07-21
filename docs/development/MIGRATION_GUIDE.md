# EduΣage Project Migration Guide

## 🎯 Goal
Transform the current scattered file structure into a clean, production-ready monorepo with the complete AI agent system as the single source of truth.

## 📋 Current State Analysis
- Multiple duplicate directories and files
- Scattered components across different locations
- Incomplete implementations mixed with complete ones
- Need to consolidate everything into the working `create-edusage/templates/default/` structure

## 🗂️ Target Structure
```
edusage/
├── .env.example
├── .env.vault
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .kiro/
│   └── specs/
├── create-edusage/                    # 🎯 MAIN CLI TOOL
│   ├── templates/
│   │   └── default/                   # 🎯 COMPLETE WORKING SYSTEM
│   │       ├── apps/
│   │       │   ├── web/               # Vite React PWA
│   │       │   └── native/            # Expo React Native
│   │       ├── packages/
│   │       │   └── ui/                # Shared component library
│   │       ├── src/
│   │       │   ├── agents/            # 🤖 AI Agent System (10 agents)
│   │       │   ├── components/        # 🎨 React Components
│   │       │   ├── middleware/        # 🔒 Security & Auth
│   │       │   ├── payments/          # 💳 Payment System
│   │       │   ├── runtime/           # Error Handling
│   │       │   ├── supabase/          # Database Schema
│   │       │   └── utils/             # Utilities
│   │       ├── scripts/               # Setup & Build Scripts
│   │       ├── .env.example
│   │       ├── docker-compose.yml
│   │       ├── package.json
│   │       └── README.md
│   ├── index.js                       # CLI Entry Point
│   └── package.json
├── docker-compose.yml
├── FILE_STRUCTURE.md
├── mcp.config.json
├── package.json                       # Root workspace
├── pnpm-workspace.yaml
├── README.md
└── tsconfig.base.json
```

## 🧹 Files to Delete (Duplicates/Outdated)

### Directories to Remove Completely
- `edusage/` (old structure)
- `apps/` (root level - duplicates)
- `packages/shared/`
- `packages/src/`
- `src/app/`
- `src/components/cards/`
- `src/components/learning/`
- `src/components/modals/`
- `src/components/providers/`
- `src/components/settings/`
- `src/components/ui/`
- `src/components/video/`
- `src/lib/services/`
- `src/styles/` (SCSS files)
- `config/` (duplicate configs)

### Individual Files to Remove
- All `.scss` files (we use CSS)
- Duplicate `package.json` files in wrong locations
- Old component files that are superseded
- Unused configuration files

## 📦 Files to Keep and Consolidate

### Root Level (Keep)
- `.env.example`
- `.env.vault`
- `.github/workflows/deploy.yml`
- `.kiro/specs/`
- `docker-compose.yml`
- `mcp.config.json`
- `package.json` (root)
- `pnpm-workspace.yaml`
- `README.md`
- `tsconfig.base.json`

### Move to Template (Consolidate)
- Any remaining useful components → `create-edusage/templates/default/src/components/`
- Any remaining hooks → `create-edusage/templates/default/src/hooks/`
- Any remaining utils → `create-edusage/templates/default/src/utils/`

## ✅ What's Already Complete
The `create-edusage/templates/default/` directory already contains:
- ✅ Complete AI Agent System (10 specialized agents)
- ✅ Full UI Component Library
- ✅ Security & Authentication System
- ✅ Payment Processing System
- ✅ Video Player with Chapters
- ✅ Dashboard with 3-Layer Parallax
- ✅ Database Schema & Migrations
- ✅ Service Worker & PWA Setup
- ✅ MCP Integration
- ✅ Error Handling System

## 🎯 Post-Migration Benefits
1. **Single Source of Truth**: All working code in one place
2. **Clean CLI**: `npm create edusage@latest` scaffolds complete system
3. **No Duplicates**: Eliminated redundant files and directories
4. **Production Ready**: Immediate deployment capability
5. **Maintainable**: Clear structure for future development

## 🚀 Testing After Migration
```bash
# Test the CLI
npm create edusage@latest test-project
cd test-project
pnpm install
pnpm dev

# Verify all systems work
pnpm dev:web      # Web app
pnpm dev:native   # Native app  
pnpm storybook    # Component library
pnpm test         # Run tests
```

## 📝 Notes
- The migration preserves all working functionality
- Removes only duplicate/outdated files
- Maintains git history for important files
- Creates a clean, professional project structure
- Ready for production deployment immediately after migration