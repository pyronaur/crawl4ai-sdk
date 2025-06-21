# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Crawl4AI TypeScript SDK** - a comprehensive, type-safe TypeScript SDK for the Crawl4AI REST API. It provides web crawling, data extraction, and AI-powered content analysis capabilities.

## Development Environment

### Build Tools & Runtime
- **Runtime**: Bun (primary) - always use Bun instead of Node.js, npm, pnpm, or vite
- **Build**: `bun build` (targets Node.js for compatibility)
- **Package Manager**: `bun install` (not npm/yarn/pnpm)
- **Testing**: `bun test` (not jest/vitest)
- **Linting**: Biome (not ESLint/Prettier)

### Essential Commands
```bash
# Development
bun test                  # Run all tests
bun test src/sdk.test.ts  # Run specific test file
bun lint                  # Check code style (biome check)
bun fix                   # Auto-fix lint issues (biome check --write)
bun format                # Format code (biome format --write)

# Building
bun build                 # Build JS output
bun build:types          # Generate TypeScript declarations
bun run prepare          # Full build (JS + types)

# Publishing
bun run prepublishOnly   # Lint, test, and build before publish
```

### Code Style (Enforced by Biome)
- **Indentation**: Tabs (4 spaces width)
- **Quotes**: Single quotes for code, double for JSX
- **Semicolons**: Always required
- **Line Width**: 100 characters maximum
- **Imports**: Use `import type` for type-only imports
- **Trailing Commas**: Always use in multi-line structures

## Architecture

### Core Structure
```
src/
├── index.ts      # Main export (re-exports from sdk.ts)
├── sdk.ts        # Main Crawl4AI class implementation
├── types.ts      # TypeScript type definitions
├── errors.ts     # Custom error classes
└── sdk.test.ts   # Test suite
```

### Key Design Principles
1. **Zero Dependencies**: Uses only native fetch API
2. **Type Safety**: Comprehensive TypeScript types for all API endpoints
3. **Streaming Support**: Async generators for real-time results
4. **Smart Error Handling**: Custom error classes with retry logic
5. **Validation**: Built-in URL and parameter validation

### Main Class Architecture
The `Crawl4AI` class in `sdk.ts` provides:
- Configuration management with sensible defaults
- Request building with proper headers and auth
- Response handling with error checking
- Streaming support via async generators
- Retry logic with exponential backoff

### API Methods Pattern
Each API method follows this pattern:
1. Validate input parameters
2. Build request with proper endpoint and config
3. Handle response with error checking
4. Return typed response or throw custom error

### Testing Approach
- Tests are in `src/sdk.test.ts`
- Use Bun's built-in test runner
- Focus on configuration, validation, and error handling
- Mock HTTP responses when testing API calls

## Important Implementation Details

### Error Handling
- `Crawl4AIError`: Base error class with status code and response
- `RequestValidationError`: For invalid input parameters
- Always preserve error context and provide helpful messages

### URL Validation
- Single URL: string starting with http:// or https://
- Multiple URLs: array of valid URL strings
- Validation happens before API calls to fail fast

### Streaming Implementation
- Use async generators for `crawlStream()` and `crawlStreamRaw()`
- Handle chunked responses and parse JSON objects from stream
- Gracefully handle stream interruptions

### Configuration Flexibility
- Client config can be updated after initialization
- Per-request overrides for headers and options
- Debug mode for request/response logging

## Bun-Specific Considerations

From `.cursor/rules/use-bun-instead-of-node-vite-npm-pnpm.mdc`:
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Bun automatically loads .env files (no dotenv needed)
- Prefer Bun's built-in APIs when available
- Use `bun:test` for testing imports

## Publishing Workflow

The SDK is published to npm as `crawl4ai-sdk`:
1. Version is managed in package.json
2. `prepublishOnly` script ensures quality checks
3. Published files: dist/, README.md, LICENSE, CHANGELOG.md
4. TypeScript declarations are included