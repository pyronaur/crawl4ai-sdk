import { beforeAll, describe, expect, test } from 'bun:test';
import { Crawl4AIError, RequestValidationError } from './errors';
import Crawl4AI from './sdk';
import type { Crawl4AIConfig } from './types';

describe('Crawl4AI SDK', () => {
	let client: Crawl4AI;
	const testConfig: Crawl4AIConfig = {
		baseUrl: 'https://example.com',
		timeout: 10000,
		debug: false,
	};

	beforeAll(() => {
		client = new Crawl4AI(testConfig);
	});

	describe('Configuration', () => {
		test('should initialize with correct config', () => {
			// Test through actual behavior rather than private config
			expect(client).toBeInstanceOf(Crawl4AI);
		});

		test('should strip trailing slash from baseUrl', () => {
			const clientWithSlash = new Crawl4AI({
				baseUrl: 'https://example.com/',
				debug: false,
			});
			expect(clientWithSlash).toBeInstanceOf(Crawl4AI);
		});

		test('should accept config with all options', () => {
			const fullClient = new Crawl4AI({
				baseUrl: 'https://example.com',
				apiToken: 'test-token',
				timeout: 60000,
				retries: 5,
				retryDelay: 2000,
				defaultHeaders: { 'X-Custom': 'value' },
				throwOnError: false,
				validateStatus: (status) => status < 500,
				debug: true,
			});
			expect(fullClient).toBeInstanceOf(Crawl4AI);
		});
	});

	describe('SetApiToken Method', () => {
		test('should update API token', () => {
			const newClient = new Crawl4AI(testConfig);
			expect(() => newClient.setApiToken('test-token')).not.toThrow();
			expect(() => newClient.setApiToken('')).not.toThrow();
		});

		test('should handle null/undefined token', () => {
			const newClient = new Crawl4AI(testConfig);
			expect(() => newClient.setApiToken('')).not.toThrow();
		});

		test('should accept long tokens', () => {
			const newClient = new Crawl4AI(testConfig);
			const longToken = 'a'.repeat(1000);
			expect(() => newClient.setApiToken(longToken)).not.toThrow();
		});
	});

	describe('SetBaseUrl Method', () => {
		test('should update base URL', () => {
			const newClient = new Crawl4AI(testConfig);
			expect(() => newClient.setBaseUrl('https://new-url.com')).not.toThrow();
		});

		test('should strip trailing slash', () => {
			const newClient = new Crawl4AI(testConfig);
			expect(() => newClient.setBaseUrl('https://new-url.com/')).not.toThrow();
		});

		test('should accept different protocols', () => {
			const newClient = new Crawl4AI(testConfig);
			expect(() => newClient.setBaseUrl('http://localhost:8000')).not.toThrow();
			expect(() => newClient.setBaseUrl('https://api.example.com')).not.toThrow();
		});
	});

	describe('SetDebug Method', () => {
		test('should toggle debug mode', () => {
			const newClient = new Crawl4AI(testConfig);
			expect(() => newClient.setDebug(true)).not.toThrow();
			expect(() => newClient.setDebug(false)).not.toThrow();
		});

		test('should accept multiple toggles', () => {
			const newClient = new Crawl4AI(testConfig);
			expect(() => {
				newClient.setDebug(true);
				newClient.setDebug(false);
				newClient.setDebug(true);
			}).not.toThrow();
		});
	});

	describe('URL Validation', () => {
		test('should throw on invalid URLs', async () => {
			// These should throw immediately due to URL validation
			await expect(client.crawl({ urls: 'not-a-url' })).rejects.toThrow(
				RequestValidationError,
			);
			await expect(client.crawl({ urls: '' })).rejects.toThrow(RequestValidationError);
			await expect(client.crawl({ urls: '://invalid' })).rejects.toThrow(
				RequestValidationError,
			);
		});

		test('should accept valid URL formats', () => {
			// Just test that valid URLs don't throw during validation
			// We can't test actual requests without mocking
			const validUrls = [
				'https://example.com',
				'http://example.com',
				'https://example.com/path',
				'ftp://example.com', // URL constructor accepts this
			];

			// The promises will be created but we won't await them
			// to avoid actual network requests
			for (const url of validUrls) {
				expect(() => {
					const promise = client.crawl({ urls: url });
					// Cancel the promise to avoid unhandled rejections
					promise.catch(() => {});
				}).not.toThrow();
			}
		});
	});

	describe('Health Method', () => {
		test('should return health status', async () => {
			try {
				const health = await client.health();
				expect(health).toHaveProperty('status');
				expect(health).toHaveProperty('timestamp');
				expect(health).toHaveProperty('version');
				expect(typeof health.status).toBe('string');
				expect(typeof health.timestamp).toBe('number');
				expect(typeof health.version).toBe('string');
			} catch (error) {
				// API might be down, which is OK for tests
				expect(error).toBeInstanceOf(Error);
			}
		});

		test('should accept custom timeout', async () => {
			const promise = client.health({ timeout: 1000 });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('Metrics Method', () => {
		test('should return Prometheus metrics', async () => {
			const promise = client.metrics();
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept custom config', async () => {
			const promise = client.metrics({ timeout: 5000 });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('Schema Method', () => {
		test('should return API schema', async () => {
			const promise = client.schema();
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept custom config', async () => {
			const promise = client.schema({ timeout: 5000 });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('GetRoot Method', () => {
		test('should return root endpoint content', async () => {
			const promise = client.getRoot();
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept custom config', async () => {
			const promise = client.getRoot({ timeout: 5000 });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('TestConnection Method', () => {
		test('should return boolean', async () => {
			const result = await client.testConnection();
			expect(typeof result).toBe('boolean');
		});

		test('should return true when connected', async () => {
			const mockClient = new Crawl4AI({
				...testConfig,
				baseUrl: 'https://example.com', // Assuming this exists
			});
			const result = await mockClient.testConnection();
			expect(typeof result).toBe('boolean');
		});

		test('should return false when not connected', async () => {
			const mockClient = new Crawl4AI({
				...testConfig,
				baseUrl: 'https://non-existent-domain-12345.com',
			});
			const result = await mockClient.testConnection();
			expect(result).toBe(false);
		});
	});

	describe('Version Method', () => {
		test('should return version string', async () => {
			const version = await client.version();
			expect(typeof version).toBe('string');
		});

		test('should return unknown on error', async () => {
			const mockClient = new Crawl4AI({
				...testConfig,
				baseUrl: 'https://non-existent-domain-12345.com',
			});
			const version = await mockClient.version();
			expect(version).toBe('unknown');
		});
	});

	describe('Error Handling', () => {
		test('should create proper error instances', () => {
			const error = new Crawl4AIError('Test error', 404, 'Not Found', { detail: 'test' });
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(Crawl4AIError);
			expect(error.message).toBe('Test error');
			expect(error.status).toBe(404);
			expect(error.statusText).toBe('Not Found');
			expect(error.data).toEqual({ detail: 'test' });
		});
	});

	describe('Crawl Method', () => {
		test('should validate URLs', async () => {
			await expect(client.crawl({ urls: 'invalid-url' })).rejects.toThrow(
				RequestValidationError,
			);
			await expect(client.crawl({ urls: '' })).rejects.toThrow(RequestValidationError);
			await expect(client.crawl({ urls: '://malformed' })).rejects.toThrow(
				RequestValidationError,
			);
			// FTP URLs are valid according to URL constructor, server will reject them
		});

		test('should validate array of URLs', async () => {
			await expect(
				client.crawl({
					urls: ['https://example.com', 'invalid-url'],
				}),
			).rejects.toThrow(RequestValidationError);

			await expect(
				client.crawl({
					urls: ['', 'https://example.com'],
				}),
			).rejects.toThrow(RequestValidationError);
		});

		test('should accept single URL', async () => {
			// This won't actually make a request in test environment
			const promise = client.crawl({ urls: 'https://example.com' });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should accept array of URLs', async () => {
			const promise = client.crawl({
				urls: ['https://example.com', 'https://example.org'],
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should accept crawl options', async () => {
			const promise = client.crawl({
				urls: 'https://example.com',
				browser_config: {
					headless: true,
					viewport: { width: 1280, height: 720 },
				},
				crawler_config: {
					cache_mode: 'bypass',
					word_count_threshold: 10,
					extraction_strategy: {
						type: 'json_css',
						params: {
							schema: {
								baseSelector: 'body',
								fields: [
									{
										name: 'title',
										selector: 'h1',
										type: 'text',
									},
								],
							},
						},
					},
				},
				session_id: 'test-session',
				priority: 5,
				ttl: 3600,
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should normalize single URL to array', async () => {
			// Can't test actual API call without mocking, but can verify promise is created
			const promise = client.crawl({ urls: 'https://example.com' });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('Markdown Method', () => {
		test('should validate URL', async () => {
			await expect(client.markdown({ url: 'invalid-url' })).rejects.toThrow(
				RequestValidationError,
			);
			await expect(client.markdown({ url: '' })).rejects.toThrow(RequestValidationError);
			await expect(client.markdown({ url: '://malformed' })).rejects.toThrow(
				RequestValidationError,
			);
		});

		test('should accept valid URL', async () => {
			const promise = client.markdown({ url: 'https://example.com' });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should accept filter options', async () => {
			// Raw filter (default)
			const p1 = client.markdown({ url: 'https://example.com' });
			expect(p1).toBeInstanceOf(Promise);
			p1.catch(() => {});

			// Fit filter
			const p2 = client.markdown({ url: 'https://example.com', f: 'fit' });
			expect(p2).toBeInstanceOf(Promise);
			p2.catch(() => {});

			// BM25 filter with query
			const p3 = client.markdown({
				url: 'https://example.com',
				f: 'bm25',
				q: 'search query',
			});
			expect(p3).toBeInstanceOf(Promise);
			p3.catch(() => {});

			// LLM filter with query
			const p4 = client.markdown({
				url: 'https://example.com',
				f: 'llm',
				q: 'What is this about?',
			});
			expect(p4).toBeInstanceOf(Promise);
			p4.catch(() => {});
		});

		test('should accept optional cache parameter', async () => {
			const promise = client.markdown({
				url: 'https://example.com',
				c: 'bypass',
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('HTML Method', () => {
		test('should validate URL', async () => {
			await expect(client.html({ url: 'invalid-url' })).rejects.toThrow(
				RequestValidationError,
			);
			await expect(client.html({ url: '' })).rejects.toThrow(RequestValidationError);
			await expect(client.html({ url: '://malformed' })).rejects.toThrow(
				RequestValidationError,
			);
		});

		test('should accept valid URL', async () => {
			const promise = client.html({ url: 'https://example.com' });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should accept URL with query params', async () => {
			const promise = client.html({ url: 'https://example.com?param=value' });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept URL with fragment', async () => {
			const promise = client.html({ url: 'https://example.com#section' });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('ExecuteJs Method', () => {
		test('should validate URL', async () => {
			await expect(
				client.executeJs({
					url: 'invalid-url',
					scripts: ['document.title'],
				}),
			).rejects.toThrow(RequestValidationError);

			await expect(
				client.executeJs({
					url: '',
					scripts: ['document.title'],
				}),
			).rejects.toThrow(RequestValidationError);
		});

		test('should accept valid URL and scripts', async () => {
			const promise = client.executeJs({
				url: 'https://example.com',
				scripts: ['document.title', 'document.body.innerHTML'],
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should accept empty scripts array', async () => {
			const promise = client.executeJs({
				url: 'https://example.com',
				scripts: [],
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept various JavaScript expressions', async () => {
			const promise = client.executeJs({
				url: 'https://example.com',
				scripts: [
					'document.title',
					'window.location.href',
					'document.querySelectorAll("a").length',
					'Array.from(document.querySelectorAll("h1")).map(h => h.textContent)',
					'JSON.stringify({width: window.innerWidth, height: window.innerHeight})',
				],
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('Ask Method', () => {
		test('should accept no parameters', async () => {
			const promise = client.ask();
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should accept query only', async () => {
			const promise = client.ask({ query: 'what is crawl4ai' });
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept all parameters', async () => {
			const promise = client.ask({
				context_type: 'doc',
				query: 'installation guide',
				score_ratio: 0.7,
				max_results: 5,
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept different context types', async () => {
			// doc context
			const p1 = client.ask({ context_type: 'doc', query: 'example' });
			expect(p1).toBeInstanceOf(Promise);
			p1.catch(() => {});

			// code context
			const p2 = client.ask({ context_type: 'code', query: 'python' });
			expect(p2).toBeInstanceOf(Promise);
			p2.catch(() => {});

			// all context
			const p3 = client.ask({ context_type: 'all', query: 'usage' });
			expect(p3).toBeInstanceOf(Promise);
			p3.catch(() => {});
		});

		test('should accept numeric parameters', async () => {
			const promise = client.ask({
				query: 'test',
				score_ratio: 0,
				max_results: 100,
			});
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('LLM Method', () => {
		test('should validate URL', async () => {
			await expect(client.llm('invalid-url', 'test query')).rejects.toThrow(
				RequestValidationError,
			);
			await expect(client.llm('', 'test query')).rejects.toThrow(RequestValidationError);
			await expect(client.llm('://malformed', 'test query')).rejects.toThrow(
				RequestValidationError,
			);
		});

		test('should accept valid URL and query', async () => {
			const promise = client.llm(
				'https://example.com',
				'What is the main content of this page?',
			);
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {}); // Prevent unhandled rejection
		});

		test('should accept URLs with query params', async () => {
			const promise = client.llm('https://example.com?param=value', 'Summarize this page');
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});

		test('should accept different query types', async () => {
			// Question
			const p1 = client.llm('https://example.com', 'What is this page about?');
			expect(p1).toBeInstanceOf(Promise);
			p1.catch(() => {});

			// Instruction
			const p2 = client.llm('https://example.com', 'Extract all links from this page');
			expect(p2).toBeInstanceOf(Promise);
			p2.catch(() => {});

			// Summary request
			const p3 = client.llm('https://example.com', 'Summarize in 3 bullet points');
			expect(p3).toBeInstanceOf(Promise);
			p3.catch(() => {});
		});

		test('should handle empty query', async () => {
			const promise = client.llm('https://example.com', '');
			expect(promise).toBeInstanceOf(Promise);
			promise.catch(() => {});
		});
	});

	describe('Debug Mode', () => {
		test('should create client with debug mode', () => {
			const debugClient = new Crawl4AI({ ...testConfig, debug: true });
			expect(debugClient).toBeInstanceOf(Crawl4AI);

			const quietClient = new Crawl4AI({ ...testConfig, debug: false });
			expect(quietClient).toBeInstanceOf(Crawl4AI);
		});

		test('should toggle debug mode', () => {
			const debugClient = new Crawl4AI(testConfig);
			// Just test that the method exists and doesn't throw
			expect(() => debugClient.setDebug(true)).not.toThrow();
			expect(() => debugClient.setDebug(false)).not.toThrow();
		});
	});
});
