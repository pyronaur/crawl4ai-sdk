/**
 * Custom error classes for Crawl4AI SDK
 */

import type { ValidationError } from './types';

/**
 * Base error class for all Crawl4AI errors
 */
export class Crawl4AIError extends Error {
	status?: number;
	statusText?: string;
	data?: ValidationError | Record<string, unknown>;
	request?: {
		url: string;
		method: string;
		headers?: Record<string, string>;
		body?: unknown;
	};

	constructor(
		message: string,
		status?: number,
		statusText?: string,
		data?: ValidationError | Record<string, unknown>,
	) {
		super(message);
		this.name = 'Crawl4AIError';
		if (status !== undefined) this.status = status;
		if (statusText !== undefined) this.statusText = statusText;
		if (data !== undefined) this.data = data;
	}
}

/**
 * Network-related errors (timeouts, connection failures)
 */
export class NetworkError extends Crawl4AIError {
	constructor(message: string, cause?: Error) {
		super(message);
		this.name = 'NetworkError';
		if (cause) {
			this.cause = cause;
		}
	}
}

/**
 * Request timeout error
 */
export class TimeoutError extends NetworkError {
	timeout: number;

	constructor(timeout: number, url?: string) {
		const message = url
			? `Request to ${url} timed out after ${timeout}ms`
			: `Request timed out after ${timeout}ms`;
		super(message);
		this.name = 'TimeoutError';
		this.timeout = timeout;
	}
}

/**
 * Validation errors for request parameters
 */
export class RequestValidationError extends Crawl4AIError {
	field?: string;
	value?: unknown;

	constructor(message: string, field?: string, value?: unknown) {
		super(message, 400, 'Bad Request');
		this.name = 'RequestValidationError';
		if (field !== undefined) this.field = field;
		if (value !== undefined) this.value = value;
	}
}

/**
 * Rate limiting error
 */
export class RateLimitError extends Crawl4AIError {
	retryAfter?: number;
	limit?: number;
	remaining?: number;
	reset?: Date;

	constructor(message: string, retryAfter?: number, headers?: Record<string, string>) {
		super(message, 429, 'Too Many Requests');
		this.name = 'RateLimitError';

		if (retryAfter !== undefined) {
			this.retryAfter = retryAfter;
		}

		// Parse rate limit headers if available
		if (headers) {
			if (headers['x-ratelimit-limit']) {
				this.limit = parseInt(headers['x-ratelimit-limit'], 10);
			}
			if (headers['x-ratelimit-remaining']) {
				this.remaining = parseInt(headers['x-ratelimit-remaining'], 10);
			}
			if (headers['x-ratelimit-reset']) {
				this.reset = new Date(parseInt(headers['x-ratelimit-reset'], 10) * 1000);
			}
		}
	}
}

/**
 * Authentication/Authorization errors
 */
export class AuthError extends Crawl4AIError {
	constructor(message: string = 'Authentication failed', status: number = 401) {
		super(message, status, status === 401 ? 'Unauthorized' : 'Forbidden');
		this.name = 'AuthError';
	}
}

/**
 * Server errors (5xx)
 */
export class ServerError extends Crawl4AIError {
	constructor(
		message: string = 'Internal server error',
		status: number = 500,
		statusText?: string,
	) {
		super(message, status, statusText || 'Internal Server Error');
		this.name = 'ServerError';
	}
}

/**
 * Resource not found error
 */
export class NotFoundError extends Crawl4AIError {
	resource?: string;

	constructor(resource?: string) {
		const message = resource ? `Resource not found: ${resource}` : 'Resource not found';
		super(message, 404, 'Not Found');
		this.name = 'NotFoundError';
		if (resource) this.resource = resource;
	}
}

/**
 * Response parsing error
 */
export class ParseError extends Crawl4AIError {
	responseText?: string;

	constructor(message: string, responseText?: string) {
		super(message);
		this.name = 'ParseError';
		if (responseText) this.responseText = responseText;
	}
}

/**
 * Type guard to check if an error is a Crawl4AI error
 */
export function isCrawl4AIError(error: unknown): error is Crawl4AIError {
	return error instanceof Crawl4AIError;
}

/**
 * Type guard to check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
	return error instanceof RateLimitError;
}

/**
 * Type guard to check if an error is an auth error
 */
export function isAuthError(error: unknown): error is AuthError {
	return error instanceof AuthError;
}

/**
 * Type guard to check if an error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
	return error instanceof NetworkError;
}

/**
 * Helper to create appropriate error based on status code
 */
export function createHttpError(
	status: number,
	statusText: string,
	message?: string,
	data?: unknown,
	headers?: Record<string, string>,
): Crawl4AIError {
	const errorMessage = message || `HTTP ${status}: ${statusText}`;

	switch (status) {
		case 400:
			return new RequestValidationError(errorMessage);
		case 401:
			return new AuthError(errorMessage, 401);
		case 403:
			return new AuthError(errorMessage, 403);
		case 404:
			return new NotFoundError();
		case 429: {
			const retryAfter = headers?.['retry-after']
				? parseInt(headers['retry-after'], 10)
				: undefined;
			return new RateLimitError(errorMessage, retryAfter, headers);
		}
		case 500:
		case 502:
		case 503:
		case 504:
			return new ServerError(errorMessage, status, statusText);
		default:
			return new Crawl4AIError(
				errorMessage,
				status,
				statusText,
				data as ValidationError | Record<string, unknown>,
			);
	}
}
