# Crawl4AI SDK Examples

This directory contains examples demonstrating various features of the Crawl4AI SDK.

## Prerequisites

1. **Crawl4AI Server**: Make sure you have a Crawl4AI server running:
   ```bash
   # Using Docker
   docker run -p 11235:11235 unclecode/crawl4ai:latest
   
   # Or use the hosted version at https://c4.kaste.lol
   ```

2. **Install dependencies**:
   ```bash
   # From the root directory
   bun install
   # or
   npm install
   ```

## Running Examples

### Basic Example
Demonstrates fundamental features like basic crawling, markdown extraction, and screenshots.

```bash
bun run examples/basic.ts
# or
npx tsx examples/basic.ts
```

### Advanced Example
Shows streaming, CSS selector extraction, JavaScript execution, and error handling.

```bash
bun run examples/advanced.ts
# or
npx tsx examples/advanced.ts
```

### LLM Extraction Example
Demonstrates AI-powered content extraction using various LLM providers.

**Note**: This example requires API keys for LLM providers:

```bash
# Set your API keys (optional, but recommended for full functionality)
export OPENAI_API_KEY="your_openai_api_key"
export ANTHROPIC_API_KEY="your_anthropic_api_key"

# Run the example
bun run examples/llm-extraction.ts
# or
npx tsx examples/llm-extraction.ts
```

## Example Features

### basic.ts
- Connecting to Crawl4AI server
- Basic web crawling
- Markdown extraction with filters
- Screenshot capture
- Health checks

### advanced.ts
- Streaming results from multiple URLs
- CSS selector-based data extraction
- JavaScript execution on pages
- Custom headers and user agents
- Batch crawling
- Error handling patterns

### llm-extraction.ts
- Schema-based extraction with LLMs
- Multiple LLM provider support
- Semantic content filtering
- Cosine similarity extraction
- Using the ask endpoint for documentation

## Tips

1. **Server URL**: Examples use `https://c4.kaste.lol` by default. Change to `http://localhost:11235` if running locally.

2. **Debug Mode**: Enable `debug: true` in the client configuration to see detailed request/response logs.

3. **Timeouts**: LLM operations may take longer. Adjust the `timeout` parameter accordingly.

4. **Rate Limiting**: When crawling multiple URLs, consider adding delays to avoid rate limiting:
   ```typescript
   for (const url of urls) {
     await client.crawl({ urls: url });
     await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
   }
   ```

5. **Error Handling**: Always wrap operations in try-catch blocks to handle network and API errors gracefully.

## Contributing

Feel free to add more examples demonstrating other features or use cases!