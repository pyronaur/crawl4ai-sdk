/**
 * Example demonstrating LLM-based content extraction
 * Note: Requires API keys for the LLM providers
 */

import Crawl4AI from 'crawl4ai-sdk';
import type { CrawlResult } from 'crawl4ai-sdk';

async function main() {
  const client = new Crawl4AI({
    baseUrl: 'https://c4.kaste.lol',
    timeout: 120000, // LLM extraction can take longer
  });

  try {
    // 1. Basic LLM extraction with schema
    console.log('1. LLM extraction with schema:');
    const newsResults = await client.crawl({
      urls: 'https://www.bbc.com/news',
      crawler_config: {
        extraction_strategy: {
          type: 'llm',
          params: {
            provider: 'openai/gpt-4o-mini',
            api_token: process.env.OPENAI_API_KEY, // Set your API key
            schema: {
              type: 'object',
              properties: {
                articles: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      headline: { type: 'string' },
                      summary: { type: 'string' },
                      category: { type: 'string' },
                      author: { type: 'string' },
                      published_date: { type: 'string' },
                      tags: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                    required: ['headline', 'summary'],
                  },
                },
                main_story: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
            extraction_type: 'schema',
            instruction:
              'Extract all news articles from the page. Focus on the main news stories and categorize them appropriately.',
          },
        },
      },
    });

    if (newsResults[0].extracted_content) {
      const extracted = JSON.parse(newsResults[0].extracted_content);
      console.log('\nMain story:');
      console.log('  Title:', extracted.main_story?.title);
      console.log('  Description:', extracted.main_story?.description);
      console.log(`\nFound ${extracted.articles?.length || 0} articles`);
      extracted.articles?.slice(0, 3).forEach((article: any, i: number) => {
        console.log(`\nArticle ${i + 1}:`);
        console.log('  Headline:', article.headline);
        console.log('  Summary:', article.summary);
        console.log('  Category:', article.category);
        console.log('  Tags:', article.tags?.join(', '));
      });
    }

    // 2. Markdown extraction with LLM filtering
    console.log('\n2. LLM-filtered markdown extraction:');
    const techContent = await client.markdown({
      url: 'https://techcrunch.com',
      f: 'llm', // Use LLM filtering
      q: 'artificial intelligence startups funding', // Query for filtering
    });
    console.log('Filtered content length:', techContent.length);
    console.log('Preview:', techContent.slice(0, 300) + '...');

    // 3. Multi-provider example (using different LLM providers)
    console.log('\n3. Multi-provider LLM extraction:');
    const providers = [
      {
        name: 'OpenAI',
        provider: 'openai/gpt-4o-mini',
        api_key_env: 'OPENAI_API_KEY',
      },
      {
        name: 'Anthropic',
        provider: 'anthropic/claude-3-haiku',
        api_key_env: 'ANTHROPIC_API_KEY',
      },
    ];

    for (const llm of providers) {
      if (!process.env[llm.api_key_env]) {
        console.log(`\nSkipping ${llm.name} (no API key set)`);
        continue;
      }

      console.log(`\nUsing ${llm.name}:`);
      const result = await client.crawl({
        urls: 'https://example.com',
        crawler_config: {
          extraction_strategy: {
            type: 'llm',
            params: {
              provider: llm.provider,
              api_token: process.env[llm.api_key_env],
              extraction_type: 'block',
              instruction: 'Summarize the main content of this page in 2-3 sentences.',
            },
          },
        },
      });

      if (result[0].extracted_content) {
        console.log('Summary:', result[0].extracted_content);
      }
    }

    // 4. Cosine similarity extraction
    console.log('\n4. Cosine similarity extraction:');
    const blogResults = await client.crawl({
      urls: 'https://blog.example.com',
      crawler_config: {
        extraction_strategy: {
          type: 'cosine',
          params: {
            semantic_filter: 'machine learning artificial intelligence deep learning neural networks',
            word_count_threshold: 100, // Minimum words per chunk
            max_dist: 0.3, // Maximum cosine distance (lower = more similar)
            top_k: 5, // Return top 5 most relevant chunks
          },
        },
      },
    });

    if (blogResults[0].extracted_content) {
      console.log('Semantically filtered content found');
      const content = blogResults[0].extracted_content;
      console.log('Relevant content length:', content.length);
    }

    // 5. Using the ask endpoint for AI assistant context
    console.log('\n5. Getting Crawl4AI documentation context:');
    const context = await client.ask({
      query: 'extraction strategies',
      context_type: 'doc',
      max_results: 5,
    });
    console.log('Documentation context retrieved');
    console.log('Context type:', context.type);
    console.log('Results count:', context.results_count);
    console.log('Preview:', context.context.slice(0, 200) + '...');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Check for required environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.log('Note: For LLM extraction, set these environment variables:');
  missingVars.forEach((v) => console.log(`  export ${v}="your_api_key_here"`));
  console.log('\nSome examples will be skipped without API keys.\n');
}

// Run the example
main().catch(console.error);