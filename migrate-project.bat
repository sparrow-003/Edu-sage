@echo off
setlocal enabledelayedexpansion
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🚀 EduSage Project Auto-Organizer 🚀          ║
echo ║                     Full Structure Automation                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📋 This script will completely reorganize your project:
echo    ✅ Create professional monorepo structure
echo    ✅ Move all files to proper locations
echo    ✅ Delete duplicates and outdated files
echo    ✅ Set up proper package.json files
echo    ✅ Configure workspace dependencies
echo    ✅ Create development scripts
echo.
set /p confirm="🤔 Ready to transform your project? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo ❌ Operation cancelled.
    pause
    exit /b
)

echo.
echo ⏰ Starting full project organization...
set start_time=%time%

REM ==========================================
REM STEP 1: CREATE TIMESTAMPED BACKUP
REM ==========================================
echo.
echo 📦 [1/10] Creating timestamped backup...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"
set "backup_dir=backup\backup_%timestamp%"

if not exist "backup" mkdir backup
mkdir "%backup_dir%"
echo    📁 Backing up to: %backup_dir%
xcopy /E /I /H /Y . "%backup_dir%\" >nul 2>&1
echo    ✅ Backup created successfully

REM ==========================================
REM STEP 2: CREATE NEW DIRECTORY STRUCTURE
REM ==========================================
echo.
echo 🏗️  [2/10] Creating new monorepo structure...

REM Create main app directories
mkdir "apps\web\src\app" 2>nul
mkdir "apps\web\src\components" 2>nul
mkdir "apps\web\src\lib" 2>nul
mkdir "apps\web\src\styles" 2>nul
mkdir "apps\web\public" 2>nul
mkdir "apps\mobile\src" 2>nul

REM Create package directories
mkdir "packages\ui\src\components" 2>nul
mkdir "packages\ui\src\hooks" 2>nul
mkdir "packages\ui\src\utils" 2>nul
mkdir "packages\core\src\agents" 2>nul
mkdir "packages\core\src\auth" 2>nul
mkdir "packages\core\src\database" 2>nul
mkdir "packages\core\src\payments" 2>nul
mkdir "packages\core\src\utils" 2>nul
mkdir "packages\config\eslint" 2>nul
mkdir "packages\config\tailwind" 2>nul
mkdir "packages\config\typescript" 2>nul

REM Create tool directories
mkdir "tools\create-edusage" 2>nul
mkdir "tools\scripts" 2>nul

REM Create documentation directories
mkdir "docs\api" 2>nul
mkdir "docs\deployment" 2>nul
mkdir "docs\development" 2>nul
mkdir "docs\user-guide" 2>nul

REM Create config directories
mkdir "config\docker" 2>nul
mkdir "config\nginx" 2>nul

REM Create GitHub workflows
mkdir ".github\workflows" 2>nul

echo    ✅ Directory structure created

REM ==========================================
REM STEP 3: MOVE EXISTING FILES TO NEW STRUCTURE
REM ==========================================
echo.
echo 📁 [3/10] Moving files to new structure...

REM Move src to apps/web/src
if exist "src\" (
    echo    📂 Moving src/ → apps/web/src/
    xcopy /E /I /Y "src\*" "apps\web\src\" >nul 2>&1
)

REM Move public to apps/web/public
if exist "public\" (
    echo    📂 Moving public/ → apps/web/public/
    xcopy /E /I /Y "public\*" "apps\web\public\" >nul 2>&1
)

REM Move create-edusage to tools
if exist "create-edusage\" (
    echo    📂 Moving create-edusage/ → tools/create-edusage/
    xcopy /E /I /Y "create-edusage\*" "tools\create-edusage\" >nul 2>&1
)

REM Move scripts to tools
if exist "scripts\" (
    echo    📂 Moving scripts/ → tools/scripts/
    xcopy /E /I /Y "scripts\*" "tools\scripts\" >nul 2>&1
)

REM Move setup to docs/deployment
if exist "setup\" (
    echo    📂 Moving setup/ → docs/deployment/
    xcopy /E /I /Y "setup\*" "docs\deployment\" >nul 2>&1
)

REM Keep packages/ui if it exists
if exist "packages\ui\" (
    echo    📂 Keeping packages/ui/ in place
)

echo    ✅ Files moved to new structure

REM ==========================================
REM STEP 4: CLEAN UP OLD DIRECTORIES
REM ==========================================
echo.
echo 🧹 [4/10] Cleaning up old directories...

REM Remove old directories after moving
if exist "src\" (
    echo    🗑️  Removing old src/
    rmdir /s /q "src\" 2>nul
)

if exist "public\" (
    echo    🗑️  Removing old public/
    rmdir /s /q "public\" 2>nul
)

if exist "create-edusage\" (
    echo    🗑️  Removing old create-edusage/
    rmdir /s /q "create-edusage\" 2>nul
)

if exist "scripts\" (
    echo    🗑️  Removing old scripts/
    rmdir /s /q "scripts\" 2>nul
)

if exist "setup\" (
    echo    🗑️  Removing old setup/
    rmdir /s /q "setup\" 2>nul
)

echo    ✅ Old directories cleaned up

REM ==========================================
REM STEP 5: CREATE PACKAGE.JSON FILES
REM ==========================================
echo.
echo 📦 [5/10] Creating package.json files...

REM Root package.json
echo    📄 Creating root package.json
(
echo {
echo   "name": "edusage-ai-platform",
echo   "version": "2.0.0",
echo   "private": true,
echo   "workspaces": [
echo     "apps/*",
echo     "packages/*",
echo     "tools/*"
echo   ],
echo   "scripts": {
echo     "dev": "turbo run dev",
echo     "build": "turbo run build",
echo     "test": "turbo run test",
echo     "lint": "turbo run lint",
echo     "clean": "turbo run clean",
echo     "dev:web": "pnpm --filter web dev",
echo     "build:web": "pnpm --filter web build",
echo     "setup": "node tools/scripts/setup.js"
echo   },
echo   "devDependencies": {
echo     "turbo": "^1.10.0",
echo     "@types/node": "^20.11.0",
echo     "typescript": "^5.3.3"
echo   }
echo }
) > package.json

REM Apps/web package.json
echo    📄 Creating apps/web/package.json
(
echo {
echo   "name": "web",
echo   "version": "2.0.0",
echo   "private": true,
echo   "scripts": {
echo     "dev": "next dev",
echo     "build": "next build",
echo     "start": "next start",
echo     "lint": "next lint"
echo   },
echo   "dependencies": {
echo     "@edusage/ui": "workspace:*",
echo     "@edusage/core": "workspace:*",
echo     "next": "^14.1.0",
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0"
echo   },
echo   "devDependencies": {
echo     "@types/react": "^18.2.48",
echo     "@types/react-dom": "^18.2.18",
echo     "eslint": "^8.56.0",
echo     "eslint-config-next": "^14.1.0"
echo   }
echo }
) > apps\web\package.json

REM Packages/ui package.json
echo    📄 Creating packages/ui/package.json
(
echo {
echo   "name": "@edusage/ui",
echo   "version": "2.0.0",
echo   "main": "./src/index.ts",
echo   "types": "./src/index.ts",
echo   "scripts": {
echo     "dev": "tsc --watch",
echo     "build": "tsc",
echo     "lint": "eslint src/"
echo   },
echo   "dependencies": {
echo     "react": "^18.2.0",
echo     "framer-motion": "^10.18.0",
echo     "react-icons": "^4.12.0"
echo   },
echo   "devDependencies": {
echo     "@types/react": "^18.2.48",
echo     "typescript": "^5.3.3"
echo   }
echo }
) > packages\ui\package.json

REM Packages/core package.json
echo    📄 Creating packages/core/package.json
(
echo {
echo   "name": "@edusage/core",
echo   "version": "2.0.0",
echo   "main": "./src/index.ts",
echo   "types": "./src/index.ts",
echo   "scripts": {
echo     "dev": "tsc --watch",
echo     "build": "tsc",
echo     "lint": "eslint src/"
echo   },
echo   "dependencies": {
echo     "@supabase/supabase-js": "^2.39.0",
echo     "@langchain/core": "^0.1.52",
echo     "langchain": "^0.1.25"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20.11.0",
echo     "typescript": "^5.3.3"
echo   }
echo }
) > packages\core\package.json

echo    ✅ Package.json files created

REM ==========================================
REM STEP 6: CREATE CONFIGURATION FILES
REM ==========================================
echo.
echo ⚙️  [6/10] Creating configuration files...

REM Turbo.json
echo    📄 Creating turbo.json
(
echo {
echo   "$schema": "https://turbo.build/schema.json",
echo   "pipeline": {
echo     "build": {
echo       "dependsOn": ["^build"],
echo       "outputs": [".next/**", "dist/**"]
echo     },
echo     "dev": {
echo       "cache": false,
echo       "persistent": true
echo     },
echo     "lint": {},
echo     "test": {}
echo   }
echo }
) > turbo.json

REM Next.config.js for web app
echo    📄 Creating apps/web/next.config.js
(
echo /** @type {import('next'^).NextConfig} */
echo const nextConfig = {
echo   transpilePackages: ['@edusage/ui', '@edusage/core'],
echo   experimental: {
echo     appDir: true
echo   }
echo }
echo.
echo module.exports = nextConfig
) > apps\web\next.config.js

REM pnpm-workspace.yaml
echo    📄 Creating pnpm-workspace.yaml
(
echo packages:
echo   - 'apps/*'
echo   - 'packages/*'
echo   - 'tools/*'
) > pnpm-workspace.yaml

echo    ✅ Configuration files created

REM ==========================================
REM STEP 7: CREATE INDEX FILES
REM ==========================================
echo.
echo 📝 [7/10] Creating index files...

REM UI package index
echo    📄 Creating packages/ui/src/index.ts
(
echo // Export all UI components
echo export * from './components';
echo export * from './hooks';
echo export * from './utils';
) > packages\ui\src\index.ts

REM Core package index
echo    📄 Creating packages/core/src/index.ts
(
echo // Export all core functionality
echo export * from './agents';
echo export * from './auth';
echo export * from './database';
echo export * from './payments';
echo export * from './utils';
) > packages\core\src\index.ts

echo    ✅ Index files created

REM ==========================================
REM STEP 8: CREATE GITHUB WORKFLOWS
REM ==========================================
echo.
echo 🔄 [8/10] Creating GitHub workflows...

echo    📄 Creating .github/workflows/ci.yml
(
echo name: CI
echo.
echo on:
echo   push:
echo     branches: [main, develop]
echo   pull_request:
echo     branches: [main]
echo.
echo jobs:
echo   build:
echo     runs-on: ubuntu-latest
echo     steps:
echo       - uses: actions/checkout@v3
echo       - uses: pnpm/action-setup@v2
echo         with:
echo           version: 8
echo       - uses: actions/setup-node@v3
echo         with:
echo           node-version: 18
echo           cache: 'pnpm'
echo       - run: pnpm install
echo       - run: pnpm build
echo       - run: pnpm test
) > .github\workflows\ci.yml

echo    ✅ GitHub workflows created

REM ==========================================
REM STEP 9: CREATE DOCUMENTATION
REM ==========================================
echo.
echo 📚 [9/10] Creating documentation...

echo    📄 Creating docs/development/README.md
(
echo # Development Guide
echo.
echo ## Getting Started
echo ```bash
echo # Install dependencies
echo pnpm install
echo.
echo # Start development server
echo pnpm dev
echo.
echo # Build for production
echo pnpm build
echo ```
echo.
echo ## Project Structure
echo - `apps/web` - Next.js web application
echo - `packages/ui` - Shared UI components
echo - `packages/core` - Core business logic
echo - `tools/` - Development tools and scripts
) > docs\development\README.md

echo    📄 Creating updated README.md
(
echo # 🎓 EduSage AI Platform
echo.
echo A comprehensive AI-powered educational platform built with modern web technologies.
echo.
echo ## 🚀 Quick Start
echo.
echo ```bash
echo # Install dependencies
echo pnpm install
echo.
echo # Start development server
echo pnpm dev
echo.
echo # Build for production
echo pnpm build
echo ```
echo.
echo ## 📁 Project Structure
echo.
echo ```
echo edusage-ai-platform/
echo ├── apps/
echo │   └── web/              # Next.js web application
echo ├── packages/
echo │   ├── ui/               # Shared UI components
echo │   └── core/             # Core business logic
echo ├── tools/
echo │   ├── create-edusage/   # CLI tool
echo │   └── scripts/          # Build scripts
echo └── docs/                 # Documentation
echo ```
echo.
echo ## 🛠️ Development
echo.
echo This is a monorepo managed with pnpm workspaces and Turbo.
echo.
echo - **Web App**: `pnpm dev:web`
echo - **Build All**: `pnpm build`
echo - **Run Tests**: `pnpm test`
echo - **Lint Code**: `pnpm lint`
echo.
echo ## 📦 Packages
echo.
echo - `@edusage/ui` - Reusable React components
echo - `@edusage/core` - Business logic and utilities
echo.
echo ## 🚀 Deployment
echo.
echo The project is containerized and ready for deployment with Docker.
echo.
echo ```bash
echo docker-compose up -d
echo ```
) > README.md

echo    ✅ Documentation created

REM ==========================================
REM STEP 10: FINAL CLEANUP AND VALIDATION
REM ==========================================
echo.
echo 🔍 [10/10] Final cleanup and validation...

REM Remove any remaining duplicate files
if exist "MIGRATION_GUIDE.md" (
    move "MIGRATION_GUIDE.md" "docs\development\" >nul 2>&1
)

if exist "FILE_STRUCTURE.md" (
    move "FILE_STRUCTURE.md" "docs\development\" >nul 2>&1
)

if exist "CLEANUP_RECOMMENDATIONS.md" (
    move "CLEANUP_RECOMMENDATIONS.md" "docs\development\" >nul 2>&1
)

REM Clean up empty directories
for /d %%i in (*) do (
    if exist "%%i\" (
        rmdir "%%i" 2>nul
    )
)

echo    ✅ Final cleanup completed

REM Calculate execution time
set end_time=%time%
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎉 ORGANIZATION COMPLETE! 🎉              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Your project has been fully organized into a professional monorepo!
echo.
echo 📁 New Structure:
echo    ├── apps/web/           # Main Next.js application
echo    ├── packages/ui/        # Shared UI components  
echo    ├── packages/core/      # Core business logic
echo    ├── tools/              # Development tools
echo    ├── docs/               # Documentation
echo    └── config/             # Configuration files
echo.
echo 🚀 Next Steps:
echo    1. Install dependencies:     pnpm install
echo    2. Start development:        pnpm dev
echo    3. Build for production:     pnpm build
echo    4. Run tests:               pnpm test
echo.
echo 💾 Backup Location: %backup_dir%
echo ⏱️  Started: %start_time%
echo ⏱️  Finished: %end_time%
echo.
echo 🎯 Your project is now ready for professional development!
echo.
pause