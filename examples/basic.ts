/**
 * Basic example of using Crawl4AI SDK
 */

import Crawl4AI from 'crawl4ai-sdk';

async function main() {
  // Initialize the client
  const client = new Crawl4AI({
    baseUrl: 'https://example.com', // or your local instance: http://localhost:11235
    timeout: 30000,
    debug: true, // Enable to see request/response logs
  });

  try {
    // Test connection
    const isConnected = await client.testConnection();
    console.log('Connection status:', isConnected ? 'Connected' : 'Failed');

    if (!isConnected) {
      console.error('Failed to connect to Crawl4AI server');
      return;
    }

    // Basic crawl
    console.log('\n1. Basic crawl example:');
    const results = await client.crawl({
      urls: 'https://example.com',
      browser_config: {
        headless: true,
        viewport: { width: 1920, height: 1080 },
      },
      crawler_config: {
        cache_mode: 'bypass',
        word_count_threshold: 10,
      },
    });

    const result = results[0];
    console.log('URL:', result.url);
    console.log('Success:', result.success);
    console.log('Title:', result.metadata?.title);
    console.log('Content preview:', result.markdown?.slice(0, 200) + '...');

    // Get markdown content
    console.log('\n2. Markdown extraction:');
    const markdown = await client.markdown({
      url: 'https://example.com',
      f: 'fit', // Content filter: 'raw', 'fit', 'bm25', 'llm'
    });
    console.log('Markdown length:', markdown.length);

    // Capture screenshot
    console.log('\n3. Screenshot capture:');
    const screenshot = await client.screenshot({
      url: 'https://example.com',
      screenshot_wait_for: 2, // Wait 2 seconds before capture
    });
    console.log('Screenshot captured, base64 length:', screenshot.length);

    // Get health status
    console.log('\n4. Health check:');
    const health = await client.health();
    console.log('API Status:', health.status);
    console.log('API Version:', health.version);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);