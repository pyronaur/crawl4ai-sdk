# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Proper SSE (Server-Sent Events) parsing for streaming endpoints
- MIT License file
- Comprehensive .gitignore and .npmignore files
- prepublishOnly script to ensure quality before publishing
- publishConfig for npm registry
- Additional keywords for better discoverability
- Missing API endpoints: `getRoot()`, `getMcpSse()`, `getMcpSchema()`
- Comprehensive error handling with specific error classes:
  - `NetworkError` for connection failures
  - `TimeoutError` for request timeouts
  - `RequestValidationError` for invalid inputs
  - `RateLimitError` with retry-after support
  - `AuthError` for authentication issues
  - `ServerError` for 5xx responses
  - `ParseError` for response parsing failures
- Examples directory with three comprehensive examples:
  - `basic.ts` - Fundamental SDK usage
  - `advanced.ts` - Streaming, CSS extraction, JS execution
  - `llm-extraction.ts` - AI-powered content extraction
- Enhanced JSDoc documentation for all public APIs
- Type guards for error checking (`isCrawl4AIError`, `isRateLimitError`, etc.)
- Automatic handling of rate limit retry-after headers

### Changed
- Fixed package.json to enable npm publishing (removed private flag)
- Updated repository URLs to point to correct GitHub repository
- Updated author information to "Crawl4AI Community"
- Made TypeScript peer dependency optional
- Improved SSE streaming implementation to handle events correctly
- Enhanced retry logic with exponential backoff and rate limit awareness
- Updated tests to avoid accessing private properties
- Improved error messages with request context

### Fixed
- SSE streaming now properly parses Server-Sent Events format
- Error handling in streaming to properly release resources
- Stream cleanup on errors with proper reader.releaseLock()
- URL validation now throws specific `RequestValidationError`
- Network errors are properly detected and wrapped

## [2.0.0] - 2024-01-01

### Added
- Complete TypeScript implementation of Crawl4AI SDK
- Support for all major Crawl4AI REST API endpoints
- Streaming support with async generators
- Comprehensive type definitions
- Built-in retry logic with exponential backoff
- URL validation
- Debug mode for development
- Bun and Node.js compatibility

### Features
- Main crawl endpoint with full configuration options
- Content generation (Markdown, HTML, Screenshot, PDF)
- JavaScript execution on pages
- LLM-based extraction strategies
- CSS selector extraction
- Cosine similarity filtering
- Authentication token management
- Health check and metrics endpoints
- Configurable timeouts and retries

[Unreleased]: https://github.com/unclecode/crawl4ai-sdk/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/unclecode/crawl4ai-sdk/releases/tag/v2.0.0