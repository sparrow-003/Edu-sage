# EduΣage Platform File Structure

## Overview

The EduΣage platform is a fortress-grade monorepo with zero-trust security, credit-bound throttling, and a seamless learning experience powered by multiple AI agents working together. This document outlines the complete file structure and architecture.

## Root Structure

```
edusage/
├── .env.example                # Example environment variables
├── .env.vault                  # Encrypted environment variables (age encrypted)
├── .github/                    # GitHub workflows and CI/CD
│   └── workflows/
│       └── deploy.yml          # Automated deployment pipeline
├── .kiro/                      # Kiro AI assistant configuration
│   └── specs/                  # Feature specifications
│       └── edusage-complete-experience/
│           ├── requirements.md # EARS format requirements
│           ├── design.md       # Technical design document
│           └── tasks.md        # Implementation tasks
├── apps/                       # Application packages
├── config/                     # Shared configuration files
├── create-edusage/             # CLI scaffolding tool
├── docker-compose.yml          # Docker configuration with Supabase + pgvector
├── FILE_STRUCTURE.md           # This file - complete architecture documentation
├── mcp.config.json             # Model Context Protocol configuration
├── packages/                   # Shared packages
├── scripts/                    # Utility scripts
├── src/                        # Core source code
├── pnpm-workspace.yaml         # Workspace configuration
├── README.md                   # Project documentation
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.base.json          # Base TypeScript configuration with path aliases
└── tsconfig.json               # Root TypeScript configuration
```

## Applications

```
apps/
├── web/                        # Vite-React PWA
│   ├── public/                 # Static assets
│   │   ├── images/             # Image assets
│   │   ├── videos/             # Video assets
│   │   └── fonts/              # Font assets
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   ├── stores/             # State management
│   │   ├── styles/             # CSS and styling
│   │   ├── utils/              # Utility functions
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # Entry point
│   │   └── sw.ts               # Service worker
│   ├── index.html              # HTML template
│   ├── package.json            # Dependencies
│   ├── tsconfig.json           # TypeScript config
│   └── vite.config.ts          # Vite configuration
└── native/                     # Expo React Native
    ├── assets/                 # Native assets
    ├── src/                    # Source code
    │   ├── components/         # React components
    │   ├── hooks/              # Custom React hooks
    │   ├── screens/            # Screen components
    │   ├── stores/             # State management
    │   ├── utils/              # Utility functions
    │   └── App.tsx             # Root component
    ├── App.tsx                 # Entry point
    ├── app.json                # Expo configuration
    ├── package.json            # Dependencies
    └── tsconfig.json           # TypeScript config
```

## Shared Packages

```
packages/
└── ui/                         # Shared UI component library
    ├── src/                    # Source code
    │   ├── components/         # Reusable components
    │   │   ├── Button/         # Button component
    │   │   ├── ChatBubble/     # Chat bubble component
    │   │   ├── VideoPlayer/    # Video player component
    │   │   ├── QuizCard/       # Quiz card component
    │   │   ├── PlanTimeline/   # Plan timeline component
    │   │   └── ThemeToggle/    # Theme toggle component
    │   ├── tokens/             # Design tokens
    │   ├── animations/         # Animation presets
    │   └── index.ts            # Package entry point
    ├── .storybook/             # Storybook configuration
    ├── package.json            # Dependencies
    └── tsconfig.json           # TypeScript config
```

## Core Source Code

```
src/
├── agents/                     # AI Agent System (LangChain + LangGraph)
│   ├── agents/                 # Individual agent implementations
│   │   ├── taskAnalysisAgent.ts        # Analyzes task complexity and requirements
│   │   ├── agentSelectionAgent.ts      # Selects optimal agent for tasks
│   │   ├── contentCreationAgent.ts     # Creates educational content
│   │   ├── researchAgent.ts            # Performs research and fact-checking
│   │   ├── quizGenerationAgent.ts      # Generates quizzes and assessments
│   │   ├── videoLessonAgent.ts         # Creates video lessons with chapters
│   │   ├── certificateCreationAgent.ts # Creates verifiable certificates
│   │   ├── taskBreakdownAgent.ts       # Breaks complex tasks into subtasks
│   │   ├── resultCombinerAgent.ts      # Combines results from multiple agents
│   │   └── errorHandlingAgent.ts       # Handles agent errors and recovery
│   ├── langgraph.ts            # LangGraph orchestration setup
│   ├── modelManager.ts         # Manages multiple AI models and API keys
│   ├── orchestrator.ts         # Main agent orchestrator
│   ├── registry.ts             # Agent registry and management
│   ├── taskManager.ts          # Task parsing and management
│   ├── types.ts                # Agent type definitions
│   └── workflow.tsx            # Main workflow component connecting all agents
├── api/                        # API endpoints
│   ├── index.ts                # API entry point
│   └── system-prompt.api.ts    # System prompt API with caching
├── components/                 # Shared React components
│   ├── Dashboard/              # Dashboard-specific components
│   │   ├── Cards/              # Interactive card components
│   │   │   ├── WhiteboardCard.tsx      # Live canvas drawing card
│   │   │   ├── SummaryCard.tsx         # Collapsible summary card
│   │   │   └── QuizCard.tsx            # Interactive quiz card with animations
│   │   ├── AIPillToggle.tsx    # AI assistant toggle with heartbeat animation
│   │   ├── ChatBubble.tsx      # Chat message bubble with markdown parsing
│   │   ├── ChatPanel.tsx       # Chat interface with rich cards
│   │   ├── ParallaxCanvas.tsx  # 3-layer parallax background system
│   │   ├── RightDrawer.tsx     # Slide-in drawer with Chat/Quiz/Plan tabs
│   │   └── TopBar.tsx          # Top navigation with cyan glow
│   ├── HeroVideo/              # 4K video player for landing page
│   │   ├── HeroVideo.tsx       # Full-bleed video component
│   │   └── HeroVideo.module.css # Video styling
│   ├── MagnetButton/           # Cursor-magnetic button component
│   │   ├── MagnetButton.tsx    # Button with magnetic attraction
│   │   └── MagnetButton.module.css # Magnetic button styling
│   ├── OnboardingWizard/       # One-time setup wizard components
│   │   ├── RegionSelector.tsx  # Animated world map selector
│   │   ├── LanguageSelector.tsx # Flag animation selector
│   │   ├── GoalSelector.tsx    # Smart search with fuzzy matching
│   │   └── ModeSelector.tsx    # Learning mode preference selector
│   ├── ParallaxText/           # Parallax text animation component
│   │   ├── ParallaxText.tsx    # Smooth parallax text effects
│   │   └── ParallaxText.module.css # Parallax styling
│   ├── VideoPlayer/            # YouTube-like video player
│   │   ├── VideoPlayer.tsx     # Full-featured video player with chapters
│   │   └── VideoPlayer.module.css # Video player styling
│   ├── ProgressIndicator.tsx   # Task progress visualization
│   └── ResultDisplay.tsx       # Agent result display component
├── hooks/                      # Shared React hooks
│   ├── useAuthStore.ts         # Authentication state management
│   ├── useSupabaseClient.ts    # Supabase client with error handling
│   └── useSQLiteClient.ts      # WASM SQLite client hook
├── lib/                        # Core libraries
│   ├── supabase.gen.ts         # Generated Supabase types
│   └── schema.sql              # WASM SQLite schema
├── middleware/                 # Express middleware (Zero-trust security)
│   ├── auth.ts                 # JWT validation + fingerprint matching
│   ├── credits.ts              # Credit-based throttling system
│   ├── security.ts             # CSP, HSTS, SRI, breach detection
│   └── index.ts                # Middleware orchestration
├── pages/                      # Main application pages
│   ├── Dashboard.tsx           # 3-layer parallax dashboard
│   ├── LandingPage.tsx         # Cinematic landing with 4K video
│   ├── OnboardingWizard.tsx    # 4-step animated setup wizard
│   └── NotFound.tsx            # 404 error page
├── payments/                   # Payment processing system
│   ├── api.ts                  # Multi-provider payment API
│   ├── PaymentPortal.tsx       # Animated payment overlay
│   └── index.ts                # Payment system entry point
├── runtime/                    # Runtime utilities
│   └── runtime-error.ts        # Universal error handler with auto-retry
├── stores/                     # Zustand state management
│   └── authStore.ts            # Authentication store
├── styles/                     # Global styling
│   └── globals.css             # CSS variables and utility classes
├── supabase/                   # Supabase configuration
│   ├── migrations/             # Database migrations
│   ├── functions/              # Edge functions for AI processing
│   ├── schema.sql              # Complete database schema with RLS
│   └── seeds.sql               # Sample data and user profiles
├── utils/                      # Utility functions
│   ├── fingerprint.ts          # Browser fingerprinting for security
│   ├── sqlite.ts               # WASM SQLite initialization
│   └── service-worker.ts       # PWA service worker registration
├── pricing.ts                  # Pricing engine with capability tokens
├── security.ts                 # Security manifest with key rotation
└── system-prompt.md            # Master AI system prompt
```

## CLI Scaffolding Tool

```
create-edusage/
├── templates/                  # Project templates
│   └── default/                # Default template
│       ├── apps/               # Application templates
│       ├── packages/           # Package templates
│       ├── src/                # Source code templates
│       ├── scripts/            # Script templates
│       └── ...                 # Configuration files
├── index.js                    # CLI entry point
└── package.json                # Dependencies
```

## Configuration Files

```
config/
├── docker-compose.yml          # Docker configuration
├── mcp.config.json             # MCP configuration
├── next.config.js              # Next.js configuration
├── package.json                # Root dependencies
├── pnpm-workspace.yaml         # Workspace configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.base.json          # Base TypeScript configuration
└── tsconfig.json               # Root TypeScript configuration
```

## Scripts

```
scripts/
├── setup.js                    # Setup script
├── create-component.js         # Component generator
└── deploy.js                   # Deployment script
```

## Security Architecture

The security architecture follows a zero-trust model with multiple layers of defense:

1. **Authentication Layer**
   - JWT validation with fingerprint matching
   - Token blacklisting and automatic rotation
   - Row-level security policies

2. **Authorization Layer**
   - Capability tokens with exact quotas
   - Credit-based throttling
   - Plan-based access control

3. **Data Protection Layer**
   - Encrypted secrets in .env.vault
   - pgcrypto for data at rest
   - WASM SQLite for offline storage

4. **Network Security Layer**
   - Certificate pinning
   - CSP, HSTS, and SRI headers
   - Rate limiting and breach detection

5. **Audit Layer**
   - Append-only audit logs
   - Structured error reporting
   - Sentry integration for monitoring

## Agent Workforce

The platform leverages multiple AI agents working together:

1. **LangGraph Orchestrator**
   - Manages conversation flow
   - Delegates to specialized agents
   - Maintains context and history

2. **Per-user LoRA Adapter**
   - 4MB fine-tuned model per user
   - Adapts to user's learning style
   - Personalizes language and tone

3. **Scraper Agent**
   - Runs in side-browser
   - Extracts information from web sources
   - Summarizes content for learning

4. **Quiz Generator**
   - Creates personalized assessments
   - Adapts difficulty based on performance
   - Provides detailed explanations

5. **Plan Optimizer**
   - Builds learning roadmaps
   - Adjusts based on progress
   - Recommends optimal learning paths

6. **Certificate Minter**
   - Verifies course completion
   - Generates NFT certificates
   - Stores proofs on IPFS