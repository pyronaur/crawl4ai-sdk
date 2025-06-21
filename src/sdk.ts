/**
 * Crawl4AI TypeScript SDK
 * A comprehensive SDK for interacting with Crawl4AI REST API
 */

import {
	Crawl4AIError,
	createHttpError,
	NetworkError,
	RateLimitError,
	RequestValidationError,
	TimeoutError,
} from './errors';
import type {
	AskRequest,
	AskResponse,
	ContextType,
	Crawl4AIConfig,
	CrawlRequest,
	CrawlResult,
	ExecuteJsRequest,
	HealthResponse,
	HtmlRequest,
	MarkdownRequest,
	RequestConfig,
} from './types';

// Constants
const DEFAULT_TIMEOUT = 300000; // 5 minutes
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const RETRY_BACKOFF_MULTIPLIER = 2;
const HEALTH_CHECK_TIMEOUT = 5000;
const CLIENT_ERROR_MIN = 400;
const CLIENT_ERROR_MAX = 500;
const RATE_LIMIT_STATUS = 429;

// Type Guards
interface ApiArrayResponse<T> {
	results?: T;
	result?: T;
}

function isApiArrayResponse<T>(value: unknown): value is ApiArrayResponse<T> {
	return typeof value === 'object' && value !== null && ('results' in value || 'result' in value);
}

/**
 * Crawl4AI SDK Client - Main class for interacting with Crawl4AI REST API
 *
 * Provides methods for web crawling, content extraction, and various
 * web automation tasks through the Crawl4AI service.
 *
 * @example Basic usage
 * ```typescript
 * const client = new Crawl4AI({
 *   baseUrl: 'https://example.com',
 *   apiToken: 'your_token_here'
 * });
 *
 * const result = await client.crawl({
 *   urls: 'https://example.com',
 *   browser_config: { headless: true }
 * });
 * ```
 *
 * @example With custom configuration
 * ```typescript
 * const client = new Crawl4AI({
 *   baseUrl: 'http://localhost:11235',
 *   timeout: 60000,
 *   retries: 5,
 *   debug: true
 * });
 * ```
 */
export class Crawl4AI {
	private config: Required<Crawl4AIConfig>;

	/**
	 * Create a new Crawl4AI client instance
	 *
	 * @param config - Client configuration options
	 * @param config.baseUrl - Base URL of Crawl4AI server
	 * @param config.apiToken - Optional API token for authentication
	 * @param config.timeout - Request timeout in milliseconds (default: 300000)
	 * @param config.retries - Number of retry attempts (default: 3)
	 * @param config.retryDelay - Delay between retries in milliseconds (default: 1000)
	 * @param config.debug - Enable debug logging (default: false)
	 * @param config.throwOnError - Throw on HTTP errors (default: true)
	 */
	constructor(config: Crawl4AIConfig) {
		// Validate required config
		if (!config.baseUrl) {
			throw new RequestValidationError('baseUrl is required in configuration', 'baseUrl');
		}

		// Validate baseUrl format
		try {
			new URL(config.baseUrl);
		} catch {
			throw new RequestValidationError(
				`Invalid baseUrl: ${config.baseUrl}`,
				'baseUrl',
				config.baseUrl,
			);
		}

		// Define defaults
		const defaults = {
			apiToken: '',
			timeout: DEFAULT_TIMEOUT,
			retries: DEFAULT_RETRIES,
			retryDelay: DEFAULT_RETRY_DELAY,
			defaultHeaders: { 'Content-Type': 'application/json' },
			throwOnError: true,
			validateStatus: (status: number) => status < CLIENT_ERROR_MIN,
			debug: false,
		};

		// Validate numeric config values
		if (
			config.timeout !== undefined &&
			(config.timeout <= 0 || !Number.isFinite(config.timeout))
		) {
			throw new RequestValidationError(
				'timeout must be a positive number',
				'timeout',
				config.timeout,
			);
		}

		if (
			config.retries !== undefined &&
			(config.retries < 0 || !Number.isInteger(config.retries))
		) {
			throw new RequestValidationError(
				'retries must be a non-negative integer',
				'retries',
				config.retries,
			);
		}

		if (
			config.retryDelay !== undefined &&
			(config.retryDelay < 0 || !Number.isFinite(config.retryDelay))
		) {
			throw new RequestValidationError(
				'retryDelay must be a non-negative number',
				'retryDelay',
				config.retryDelay,
			);
		}

		// Merge config with defaults
		this.config = {
			...defaults,
			...config,
			baseUrl: config.baseUrl.replace(/\/$/, ''), // Remove trailing slash
			defaultHeaders: {
				...defaults.defaultHeaders,
				...config.defaultHeaders,
			},
			throwOnError: config.throwOnError ?? defaults.throwOnError,
			validateStatus: config.validateStatus || defaults.validateStatus,
		};

		// Add authorization header if token provided
		if (this.config.apiToken) {
			this.config.defaultHeaders.Authorization = `Bearer ${this.config.apiToken}`;
		}
	}

	// ===== Utility Methods =====

	/**
	 * Validate URL format
	 */
	private validateUrl(url: string): void {
		try {
			new URL(url);
		} catch {
			throw new RequestValidationError(`Invalid URL: ${url}`, 'url', url);
		}
	}

	/**
	 * Log debug information
	 */
	private log(message: string, data?: unknown): void {
		if (this.config.debug) {
			console.log(`[Crawl4AI] ${message}`, data || '');
		}
	}

	/**
	 * Normalize different API response formats to a consistent array
	 */
	private normalizeArrayResponse<T>(response: T | ApiArrayResponse<T>): T {
		if (Array.isArray(response)) {
			return response;
		}

		if (isApiArrayResponse<T>(response)) {
			if (response.results && Array.isArray(response.results)) {
				return response.results;
			}
			if (response.result && Array.isArray(response.result)) {
				return response.result;
			}
		}

		return [response] as unknown as T;
	}

	/**
	 * Build query parameters from an object, filtering out undefined values
	 */
	private buildQueryParams(params: Record<string, unknown>): string {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				searchParams.append(key, String(value));
			}
		}
		return searchParams.toString();
	}

	// ===== Core HTTP Methods =====

	private async request<T>(
		endpoint: string,
		options: RequestInit & RequestConfig = {},
	): Promise<T> {
		const url = `${this.config.baseUrl}${endpoint}`;
		const { timeout = this.config.timeout, signal, headers, ...fetchOptions } = options;

		this.log(`Request: ${fetchOptions.method || 'GET'} ${url}`, fetchOptions.body);

		const requestHeaders = {
			...this.config.defaultHeaders,
			...headers,
		};

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		// Use provided signal or create our own
		const requestSignal = signal || controller.signal;

		try {
			const response = await fetch(url, {
				...fetchOptions,
				headers: requestHeaders,
				signal: requestSignal,
			});

			clearTimeout(timeoutId);

			const contentType = response.headers.get('content-type') || '';
			let responseData: unknown;

			if (contentType.includes('application/json')) {
				responseData = await response.json();
			} else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
				responseData = await response.text();
			} else if (contentType.includes('text/event-stream')) {
				// For SSE endpoints, return the response object
				return response as unknown as T;
			} else {
				responseData = await response.text();
			}

			this.log(`Response: ${response.status}`, responseData);

			if (!this.config.validateStatus(response.status)) {
				// Convert headers to plain object
				const headers: Record<string, string> = {};
				response.headers.forEach((value, key) => {
					headers[key] = value;
				});

				const error = createHttpError(
					response.status,
					response.statusText,
					undefined,
					responseData,
					headers,
				);

				// Add request details to error
				error.request = {
					url,
					method: fetchOptions.method || 'GET',
					headers: requestHeaders,
					body: fetchOptions.body,
				};

				if (this.config.throwOnError) {
					throw error;
				}
			}

			return responseData as T;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof Error && error.name === 'AbortError') {
				throw new TimeoutError(timeout, url);
			}

			// Network errors
			if (error instanceof TypeError && error.message.includes('fetch')) {
				throw new NetworkError(`Network request failed: ${error.message}`, error);
			}

			throw error;
		}
	}

	private async requestWithRetry<T>(
		endpoint: string,
		options: RequestInit & RequestConfig = {},
	): Promise<T> {
		let lastError: Error = new Error('No attempts made');

		for (let attempt = 0; attempt <= this.config.retries; attempt++) {
			try {
				return await this.request<T>(endpoint, options);
			} catch (error) {
				lastError = error as Error;

				// Don't retry on client errors (4xx) except 429
				if (
					error instanceof Crawl4AIError &&
					error.status &&
					error.status >= CLIENT_ERROR_MIN &&
					error.status < CLIENT_ERROR_MAX &&
					error.status !== RATE_LIMIT_STATUS
				) {
					throw error;
				}

				if (attempt < this.config.retries) {
					let delay = this.config.retryDelay * RETRY_BACKOFF_MULTIPLIER ** attempt;

					// Special handling for rate limit errors
					if (error instanceof RateLimitError && error.retryAfter) {
						delay = error.retryAfter * 1000; // Convert seconds to milliseconds
						this.log(
							`Rate limited. Waiting ${error.retryAfter}s before retry (attempt ${attempt + 1}/${this.config.retries})`,
						);
					} else {
						this.log(
							`Retry attempt ${attempt + 1}/${this.config.retries} after ${delay}ms`,
						);
					}

					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
		}

		throw lastError;
	}

	// ===== API Methods =====

	/**
	 * Main crawl endpoint - Extract content from one or more URLs
	 *
	 * @param request - Crawl configuration including URLs and options
	 * @param config - Optional request configuration (timeout, headers, etc.)
	 * @returns Promise resolving to array of crawl results
	 *
	 * @example
	 * ```typescript
	 * const results = await client.crawl({
	 *   urls: ['https://example.com'],
	 *   browser_config: { headless: true },
	 *   crawler_config: { cache_mode: 'bypass' }
	 * });
	 * ```
	 *
	 * @throws {RequestValidationError} If URLs are invalid
	 * @throws {NetworkError} If network request fails
	 * @throws {TimeoutError} If request times out
	 */
	public async crawl(request: CrawlRequest, config?: RequestConfig): Promise<CrawlResult[]> {
		// Validate URLs
		const urls = Array.isArray(request.urls) ? request.urls : [request.urls];
		for (const url of urls) {
			this.validateUrl(url);
		}

		// Ensure urls is always an array in the request
		const normalizedRequest = {
			...request,
			urls: urls,
		};

		interface CrawlApiResponse {
			results?: CrawlResult[];
			result?: CrawlResult[];
		}

		const response = await this.requestWithRetry<CrawlResult[] | CrawlApiResponse>('/crawl', {
			method: 'POST',
			body: JSON.stringify(normalizedRequest),
			...config,
		});

		// Handle different response formats using utility
		return this.normalizeArrayResponse<CrawlResult[]>(response);
	}

	/**
	 * Get markdown content from URL with optional filtering
	 *
	 * @param request - Markdown extraction configuration
	 * @param request.url - URL to extract markdown from
	 * @param request.f - Content filter: 'raw' | 'fit' | 'bm25' | 'llm'
	 * @param request.q - Query for BM25/LLM filtering
	 * @param config - Optional request configuration
	 * @returns Promise resolving to markdown string
	 *
	 * @example
	 * ```typescript
	 * const markdown = await client.markdown({
	 *   url: 'https://example.com',
	 *   f: 'fit'
	 * });
	 * ```
	 */
	public async markdown(request: MarkdownRequest, config?: RequestConfig): Promise<string> {
		this.validateUrl(request.url);
		interface MarkdownApiResponse {
			markdown: string;
		}

		const response = await this.requestWithRetry<string | MarkdownApiResponse>('/md', {
			method: 'POST',
			body: JSON.stringify(request),
			...config,
		});
		// API returns object with markdown property
		return typeof response === 'string' ? response : response.markdown;
	}

	/**
	 * Get HTML content from URL
	 * @param request HTML extraction options
	 */
	public async html(request: HtmlRequest, config?: RequestConfig): Promise<string> {
		this.validateUrl(request.url);
		interface HtmlApiResponse {
			html: string;
		}

		const response = await this.requestWithRetry<string | HtmlApiResponse>('/html', {
			method: 'POST',
			body: JSON.stringify(request),
			...config,
		});
		// API returns object with html property
		return typeof response === 'string' ? response : response.html;
	}

	/**
	 * Execute JavaScript on webpage and return results
	 *
	 * @param request - JavaScript execution configuration
	 * @param request.url - URL to execute scripts on
	 * @param request.scripts - Array of JavaScript code to execute
	 * @param config - Optional request configuration
	 * @returns Promise resolving to CrawlResult with js_execution_result
	 *
	 * @example
	 * ```typescript
	 * const result = await client.executeJs({
	 *   url: 'https://example.com',
	 *   scripts: [
	 *     'return document.title;',
	 *     'return document.querySelectorAll("a").length;'
	 *   ]
	 * });
	 * console.log(result.js_execution_result);
	 * ```
	 */
	public async executeJs(
		request: ExecuteJsRequest,
		config?: RequestConfig,
	): Promise<CrawlResult> {
		this.validateUrl(request.url);
		return this.requestWithRetry<CrawlResult>('/execute_js', {
			method: 'POST',
			body: JSON.stringify(request),
			...config,
		});
	}

	/**
	 * Get Crawl4AI library context for AI assistants
	 * @param params Query parameters
	 */
	public async ask(params?: AskRequest, config?: RequestConfig): Promise<AskResponse> {
		const queryString = this.buildQueryParams({
			context_type: params?.context_type,
			query: params?.query,
			score_ratio: params?.score_ratio,
			max_results: params?.max_results,
		});

		const endpoint = `/ask${queryString ? `?${queryString}` : ''}`;

		interface AskApiResult {
			text: string;
			score: number;
		}

		interface AskApiResponse {
			doc_results?: AskApiResult[];
			code_results?: AskApiResult[];
			all_results?: AskApiResult[];
		}

		const response = await this.requestWithRetry<AskApiResponse>(endpoint, {
			method: 'GET',
			...config,
		});

		// Get results array based on what the API returns
		const results = response.doc_results || response.code_results || response.all_results || [];

		const result: AskResponse = {
			context: results.map((r) => r.text).join('\n\n'),
			type: (params?.context_type || 'doc') as ContextType,
			results_count: results.length,
		};

		if (params?.query !== undefined) {
			result.query = params.query;
		}

		return result;
	}

	/**
	 * LLM endpoint - Process a webpage with an LLM query
	 *
	 * @param url URL to process
	 * @param query Query string
	 * @returns Promise resolving to the LLM's answer
	 *
	 * @example
	 * ```typescript
	 * const answer = await client.llm(
	 *   'https://example.com',
	 *   'What is the main heading on this page?'
	 * );
	 * console.log(answer); // "The main heading on this page is..."
	 * ```
	 */
	public async llm(url: string, query: string, config?: RequestConfig): Promise<string> {
		this.validateUrl(url);
		const encodedUrl = encodeURIComponent(url);
		const queryParams = new URLSearchParams({ q: query });

		interface LlmApiResponse {
			answer: string;
		}

		const response = await this.requestWithRetry<string | LlmApiResponse>(
			`/llm/${encodedUrl}?${queryParams.toString()}`,
			{
				method: 'GET',
				...config,
			},
		);

		// API returns object with answer property
		return typeof response === 'string' ? response : response.answer || '';
	}

	/**
	 * Get API health status
	 */
	public async health(config?: RequestConfig): Promise<HealthResponse> {
		return this.request<HealthResponse>('/health', {
			method: 'GET',
			...config,
		});
	}

	/**
	 * Get Prometheus metrics
	 */
	public async metrics(config?: RequestConfig): Promise<string> {
		return this.request<string>('/metrics', {
			method: 'GET',
			...config,
		});
	}

	/**
	 * Get API schema
	 */
	public async schema(config?: RequestConfig): Promise<unknown> {
		return this.request<unknown>('/schema', {
			method: 'GET',
			...config,
		});
	}

	/**
	 * Get root endpoint information
	 */
	public async getRoot(config?: RequestConfig): Promise<string> {
		return this.request<string>('/', {
			method: 'GET',
			...config,
		});
	}

	/**
	 * Test connection to the Crawl4AI API server
	 *
	 * @param options - Optional configuration
	 * @param options.throwOnError - Throw error instead of returning false (default: false)
	 * @returns Promise resolving to true if connected, false otherwise
	 *
	 * @example
	 * ```typescript
	 * if (await client.testConnection()) {
	 *   console.log('Connected to Crawl4AI');
	 * }
	 * ```
	 *
	 * @example With error details
	 * ```typescript
	 * try {
	 *   await client.testConnection({ throwOnError: true });
	 * } catch (error) {
	 *   console.error('Connection failed:', error);
	 * }
	 * ```
	 */
	public async testConnection(options?: { throwOnError?: boolean }): Promise<boolean> {
		try {
			await this.health({ timeout: HEALTH_CHECK_TIMEOUT });
			return true;
		} catch (error) {
			if (options?.throwOnError) {
				throw error;
			}
			return false;
		}
	}

	/**
	 * Get API version
	 *
	 * @param options - Optional configuration
	 * @param options.throwOnError - Throw error instead of returning 'unknown' (default: false)
	 * @returns Promise resolving to version string or 'unknown' if unavailable
	 *
	 * @example
	 * ```typescript
	 * const version = await client.version();
	 * console.log('API version:', version);
	 * ```
	 */
	public async version(options?: { throwOnError?: boolean }): Promise<string> {
		try {
			const health = await this.health();
			return health.version || 'unknown';
		} catch (error) {
			if (options?.throwOnError) {
				throw error;
			}
			return 'unknown';
		}
	}

	/**
	 * Update API token for authentication
	 *
	 * @param token - New API token (empty string to remove)
	 *
	 * @example
	 * ```typescript
	 * client.setApiToken('new-api-token');
	 * ```
	 */
	public setApiToken(token: string): void {
		this.config.apiToken = token;
		if (token) {
			this.config.defaultHeaders.Authorization = `Bearer ${token}`;
		} else {
			delete this.config.defaultHeaders.Authorization;
		}
	}

	/**
	 * Update base URL
	 */
	public setBaseUrl(baseUrl: string): void {
		this.config.baseUrl = baseUrl.replace(/\/$/, '');
	}

	/**
	 * Enable/disable debug mode
	 */
	public setDebug(debug: boolean): void {
		this.config.debug = debug;
	}
}

/**
 * Factory function to create a new Crawl4AI client instance
 *
 * @param config - Client configuration options
 * @returns New Crawl4AI client instance
 *
 * @example
 * ```typescript
 * const client = createCrawl4AI({
 *   baseUrl: 'https://example.com',
 *   apiToken: 'your_token'
 * });
 * ```
 */
export function createCrawl4AI(config: Crawl4AIConfig): Crawl4AI {
	return new Crawl4AI(config);
}

/**
 * Default export - Crawl4AI client class
 */
export default Crawl4AI;
