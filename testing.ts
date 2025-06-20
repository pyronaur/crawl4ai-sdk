import { Crawl4AI } from './src';

// Test configuration
const client = new Crawl4AI({
  baseUrl: 'https://c4.kaste.lol',
  debug: true,
});

// Test the llm method
async function testLlm() {
  try {
    console.log('\nTesting llm() method...');
    const answer = await client.llm(
      'https://example.com',
      'What is the main heading on this page?'
    );
    
    console.log('✅ llm() method working correctly');
    console.log('Answer:', answer);
    console.log('Answer length:', answer.length, 'chars');
  } catch (error) {
    console.error('❌ llm() method failed:', error);
  }
}

testLlm();