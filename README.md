# Crawl4AI TypeScript SDK

A type-safe TypeScript SDK for the Crawl4AI REST API. Built for modern JavaScript/TypeScript environments with full Bun and Node.js compatibility.

## 🚀 Features

- **Full TypeScript Support** - Complete type definitions for all API endpoints and responses
- **Bun & Node.js Compatible** - Works seamlessly in both runtimes
- **Modern Async/Await** - Promise-based API for all operations
- **Comprehensive Coverage** - All Crawl4AI endpoints including specialized features
- **Smart Error Handling** - Custom error classes with retry logic and timeouts
- **Batch Processing** - Efficiently crawl multiple URLs in a single request
- **Input Validation** - Built-in URL validation and parameter checking
- **Debug Mode** - Optional request/response logging for development
- **Zero Dependencies** - Uses only native fetch API

## 📦 Installation

### Using Bun (Recommended)

```bash
bun add crawl4ai
```

### Using npm/yarn

```bash
npm install crawl4ai
# or
yarn add crawl4ai
```

## 📚 About Crawl4AI

> ⚠️ **Unofficial Package**: This is an unofficial TypeScript SDK for the Crawl4AI REST API. This package was created for personal use to provide a type-safe way to interact with Crawl4AI's REST API.

- **Official Project**: [https://github.com/unclecode/crawl4ai](https://github.com/unclecode/crawl4ai)
- **Official Documentation**: [https://docs.crawl4ai.com/](https://docs.crawl4ai.com/)


## 🏗️ Prerequisites

1. **Crawl4AI Server Running**
   
   You can use the hosted version or run your own:
   
   ```bash
   # Using Docker
   docker run -p 11235:11235 unclecode/crawl4ai:latest
   
   # With LLM support
   docker run -p 11235:11235 \
     -e OPENAI_API_KEY=your_openai_key \
     -e ANTHROPIC_API_KEY=your_anthropic_key \
     unclecode/crawl4ai:latest
   ```

2. **TypeScript** (if using TypeScript)
   ```bash
   bun add -d typescript
   ```

## 🚀 Quick Start

### Basic Usage

```typescript
import Crawl4AI from 'crawl4ai';

// Initialize the client
const client = new Crawl4AI({
  baseUrl: 'https://example.com', // or your local instance
  apiToken: 'your_token_here', // Optional
  timeout: 30000,
  debug: true // Enable request/response logging
});

// Perform a basic crawl
const results = await client.crawl({
  urls: 'https://example.com',
  browser_config: {
    headless: true,
    viewport: { width: 1920, height: 1080 }
  },
  crawler_config: {
    cache_mode: 'bypass',
    word_count_threshold: 10
  }
});

const result = results[0]; // API returns array of results
console.log('Title:', result.metadata?.title);
console.log('Content:', result.markdown?.slice(0, 200));
```

### Configuration Options

```typescript
const client = new Crawl4AI({
  baseUrl: 'https://example.com',
  apiToken: 'optional_api_token',
  timeout: 60000,          // Request timeout in ms
  retries: 3,              // Number of retry attempts
  retryDelay: 1000,        // Delay between retries in ms
  throwOnError: true,      // Throw on HTTP errors
  debug: false,            // Enable debug logging
  defaultHeaders: {        // Additional headers
    'User-Agent': 'MyApp/1.0'
  }
});
```

## 📖 API Reference

### Core Methods

#### `crawl(request)` - Main Crawl Endpoint
Crawl one or more URLs with full configuration options:

```typescript
const results = await client.crawl({
  urls: ['https://example.com', 'https://example.org'],
  browser_config: {
    headless: true,
    simulate_user: true,
    magic: true // Anti-detection features
  },
  crawler_config: {
    cache_mode: 'bypass',
    extraction_strategy: {
      type: 'json_css',
      params: { /* CSS extraction config */ }
    }
  }
});
```


### Content Generation

#### `markdown(request)` - Get Markdown
Extract markdown with various filters:

```typescript
const markdown = await client.markdown({
  url: 'https://example.com',
  filter: 'fit',  // 'raw' | 'fit' | 'bm25' | 'llm'
  query: 'search query for bm25/llm filters'
});
```

#### `html(request)` - Get Processed HTML
Get sanitized HTML for schema extraction:

```typescript
const html = await client.html({
  url: 'https://example.com'
});
```

#### `screenshot(request)` - Capture Screenshot
Capture full-page screenshots:

```typescript
const screenshotBase64 = await client.screenshot({
  url: 'https://example.com',
  screenshot_wait_for: 2,  // Wait 2 seconds before capture
  output_path: '/path/to/save.png'  // Optional: save to file
});
```

#### `pdf(request)` - Generate PDF
Generate PDF documents:

```typescript
const pdfData = await client.pdf({
  url: 'https://example.com',
  output_path: '/path/to/save.pdf'  // Optional: save to file
});
```

### JavaScript Execution

#### `executeJs(request)` - Run JavaScript
Execute JavaScript on the page and get full crawl results:

```typescript
const result = await client.executeJs({
  url: 'https://example.com',
  scripts: [
    'return document.title;',
    'return document.querySelectorAll("a").length;',
    'window.scrollTo(0, document.body.scrollHeight);'
  ]
});

console.log('JS Results:', result.js_execution_result);
```

### AI/LLM Features

#### `ask(params)` - Get Library Context
Get Crawl4AI documentation for AI assistants:

```typescript
const answer = await client.ask({
  query: 'extraction strategies',
  context_type: 'doc',  // 'code' | 'doc' | 'all'
  max_results: 10
});
```

#### `llm(url, query)` - LLM Endpoint
Process URLs with LLM:

```typescript
const response = await client.llm(
  'https://example.com',
  'What is the main purpose of this website?'
);
```

### Utility Methods

```typescript
// Test connection
const isConnected = await client.testConnection();
// With error details
const isConnected = await client.testConnection({ throwOnError: true });

// Get health status
const health = await client.health();

// Get API version
const version = await client.version();
// With error details
const version = await client.version({ throwOnError: true });

// Get Prometheus metrics
const metrics = await client.metrics();

// Update configuration
client.setApiToken('new_token');
client.setBaseUrl('https://new-url.com');
client.setDebug(true);
```

## 🎯 Data Extraction Strategies

### CSS Selector Extraction

Extract structured data using CSS selectors:

```typescript
const results = await client.crawl({
  urls: 'https://news.ycombinator.com',
  crawler_config: {
    extraction_strategy: {
      type: 'json_css',
      params: {
        schema: {
          baseSelector: '.athing',
          fields: [
            {
              name: 'title',
              selector: '.titleline > a',
              type: 'text'
            },
            {
              name: 'url', 
              selector: '.titleline > a',
              type: 'href'
            },
            {
              name: 'score',
              selector: '+ tr .score',
              type: 'text'
            }
          ]
        }
      }
    }
  }
});

const posts = JSON.parse(results[0].extracted_content || '[]');
```

### LLM-Based Extraction

Use AI models for intelligent data extraction:

```typescript
const results = await client.crawl({
  urls: 'https://www.bbc.com/news',
  crawler_config: {
    extraction_strategy: {
      type: 'llm',
      params: {
        provider: 'openai/gpt-4o-mini',
        api_token: process.env.OPENAI_API_KEY,
        schema: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            summary: { type: 'string' },
            author: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        extraction_type: 'schema',
        instruction: 'Extract news articles with their key information'
      }
    }
  }
});
```

### Cosine Similarity Extraction

Filter content based on semantic similarity:

```typescript
const results = await client.crawl({
  urls: 'https://example.com/blog',
  crawler_config: {
    extraction_strategy: {
      type: 'cosine',
      params: {
        semantic_filter: 'artificial intelligence machine learning',
        word_count_threshold: 50,
        max_dist: 0.3,
        top_k: 5
      }
    }
  }
});
```

## 🛠️ Error Handling

The SDK provides custom error handling with detailed information:

```typescript
import { Crawl4AIError } from 'crawl4ai-sdk';

try {
  const results = await client.crawl({ urls: 'https://example.com' });
} catch (error) {
  if (error instanceof Crawl4AIError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.data);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
bun test

# Run specific test file
bun test src/sdk.test.ts
```

## 📚 Examples

Run the included examples:

```bash
# Basic usage
bun run example:basic

# Advanced features
bun run example:advanced

# LLM extraction
bun run example:llm
```

## 🔒 Security & Best Practices

### Authentication

Always use API tokens in production:

```typescript
const client = new Crawl4AI({
  baseUrl: 'https://your-crawl4ai-server.com',
  apiToken: process.env.CRAWL4AI_API_TOKEN
});
```

### Rate Limiting

Implement client-side throttling:

```typescript
// Sequential processing with delays
for (const url of urls) {
  const results = await client.crawl({ urls: url });
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
}
```

### Input Validation

The SDK automatically validates URLs before making requests. Invalid URLs will throw a `Crawl4AIError`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This SDK is released under the MIT License.

## 🙏 Acknowledgments

Built for the amazing [Crawl4AI](https://github.com/unclecode/crawl4ai) project by [@unclecode](https://github.com/unclecode) and the Crawl4AI community.