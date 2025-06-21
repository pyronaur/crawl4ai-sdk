/**
 * Advanced example demonstrating streaming and extraction strategies
 */

import Crawl4AI, { Crawl4AIError } from 'crawl4ai-sdk';
import type { CrawlResult } from 'crawl4ai-sdk';

async function main() {
  const client = new Crawl4AI({
    baseUrl: 'https://example.com',
    timeout: 60000,
  });

  try {
    // 1. Batch crawling - crawl multiple URLs
    console.log('1. Batch crawl example:');
    const urls = [
      'https://example.com',
      'https://example.org',
      'https://example.net',
    ];

    console.log(`Crawling ${urls.length} URLs...`);
    const results = await client.crawl({ urls });
    for (const result of results) {
      console.log(`✓ Completed: ${result.url} - Success: ${result.success}`);
      if (!result.success && result.error_message) {
        console.log(`  Error: ${result.error_message}`);
      }
    }

    // 2. CSS Selector extraction - extract structured data
    console.log('\n2. CSS Selector extraction from Hacker News:');
    const newsResults = await client.crawl({
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
                  type: 'text',
                },
                {
                  name: 'url',
                  selector: '.titleline > a',
                  type: 'href',
                },
                {
                  name: 'score',
                  selector: '+ tr .score',
                  type: 'text',
                },
                {
                  name: 'comments',
                  selector: '+ tr .subline > a:last-child',
                  type: 'text',
                },
              ],
            },
          },
        },
      },
    });

    if (newsResults[0].extracted_content) {
      const posts = JSON.parse(newsResults[0].extracted_content);
      console.log(`Extracted ${posts.length} posts`);
      posts.slice(0, 3).forEach((post: any, i: number) => {
        console.log(`\nPost ${i + 1}:`);
        console.log(`  Title: ${post.title}`);
        console.log(`  URL: ${post.url}`);
        console.log(`  Score: ${post.score}`);
        console.log(`  Comments: ${post.comments}`);
      });
    }

    // 3. JavaScript execution
    console.log('\n3. JavaScript execution example:');
    const jsResult = await client.executeJs({
      url: 'https://example.com',
      scripts: [
        // Get page title
        'return document.title;',
        // Count all links
        'return document.querySelectorAll("a").length;',
        // Get all h1 text
        'return Array.from(document.querySelectorAll("h1")).map(h => h.textContent);',
        // Scroll to bottom
        'window.scrollTo(0, document.body.scrollHeight); return "Scrolled to bottom";',
      ],
    });

    if (jsResult.js_execution_result) {
      console.log('JavaScript execution results:');
      Object.entries(jsResult.js_execution_result).forEach(([key, value]) => {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      });
    }

    // 4. Batch crawling with different configurations
    console.log('\n4. Batch crawling with custom headers:');
    const batchResults = await client.crawl({
      urls: ['https://httpbin.org/headers', 'https://httpbin.org/user-agent'],
      browser_config: {
        headers: {
          'X-Custom-Header': 'Crawl4AI-SDK',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        user_agent: 'Crawl4AI-SDK/2.0.0',
      },
      crawler_config: {
        cache_mode: 'disabled',
      },
    });

    batchResults.forEach((result) => {
      console.log(`\nURL: ${result.url}`);
      if (result.success && result.markdown) {
        console.log('Response preview:', result.markdown.slice(0, 200));
      }
    });

    // 5. Error handling example
    console.log('\n5. Error handling example:');
    try {
      await client.crawl({
        urls: 'https://this-domain-definitely-does-not-exist-12345.com',
      });
    } catch (error) {
      if (error instanceof Crawl4AIError) {
        console.log('Caught Crawl4AI error:');
        console.log('  Message:', error.message);
        console.log('  Status:', error.status);
        console.log('  Status Text:', error.statusText);
      } else {
        console.log('Unexpected error:', error);
      }
    }
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Run the example
main().catch(console.error);