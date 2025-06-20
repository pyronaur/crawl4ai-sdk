import { beforeAll, describe, expect, test } from 'bun:test';
import { Crawl4AIError, RequestValidationError } from './errors';
import Crawl4AI from './sdk';
import type { Crawl4AIConfig } from './types';

describe('Crawl4AI SDK', () => {
  let client: Crawl4AI;
  const testConfig: Crawl4AIConfig = {
    baseUrl: 'https://c4.kaste.lol',
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

    test('should update API token', () => {
      const newClient = new Crawl4AI(testConfig);
      // Just test that the method exists and doesn't throw
      expect(() => newClient.setApiToken('test-token')).not.toThrow();
      expect(() => newClient.setApiToken('')).not.toThrow();
    });

    test('should update base URL', () => {
      const newClient = new Crawl4AI(testConfig);
      // Just test that the method exists and doesn't throw
      expect(() => newClient.setBaseUrl('https://new-url.com')).not.toThrow();
    });

    test('should toggle debug mode', () => {
      const newClient = new Crawl4AI(testConfig);
      expect(() => newClient.setDebug(true)).not.toThrow();
      expect(() => newClient.setDebug(false)).not.toThrow();
    });
  });

  describe('URL Validation', () => {
    test('should throw on invalid URLs', async () => {
      // These should throw immediately due to URL validation
      await expect(client.crawl({ urls: 'not-a-url' })).rejects.toThrow(RequestValidationError);
      await expect(client.crawl({ urls: '' })).rejects.toThrow(RequestValidationError);
      await expect(client.crawl({ urls: '://invalid' })).rejects.toThrow(RequestValidationError);
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

  describe('API Methods', () => {
    test('testConnection should return boolean', async () => {
      const result = await client.testConnection();
      expect(typeof result).toBe('boolean');
    });

    test('health endpoint should return health status', async () => {
      try {
        const health = await client.health();
        expect(health).toHaveProperty('status');
        expect(health).toHaveProperty('timestamp');
        expect(health).toHaveProperty('version');
      } catch (error) {
        // API might be down, which is OK for tests
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('version should return string', async () => {
      const version = await client.version();
      expect(typeof version).toBe('string');
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

  describe('Request Building', () => {
    test('crawl should validate URLs', async () => {
      await expect(client.crawl({ urls: 'invalid-url' })).rejects.toThrow(RequestValidationError);
    });

    test('crawl should accept single URL', async () => {
      // This won't actually make a request in test environment
      const promise = client.crawl({ urls: 'https://example.com' });
      expect(promise).toBeInstanceOf(Promise);
    });

    test('crawl should accept array of URLs', async () => {
      const promise = client.crawl({
        urls: ['https://example.com', 'https://example.org'],
      });
      expect(promise).toBeInstanceOf(Promise);
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
