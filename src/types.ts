/**
 * Crawl4AI TypeScript SDK - Type Definitions
 * Based on actual API endpoints and Swagger documentation
 */

// ===== Basic Types =====
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type CacheMode = 'enabled' | 'disabled' | 'bypass' | 'read_only' | 'write_only';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export type ContentFilter = 'raw' | 'fit' | 'bm25' | 'llm';

export type ContextType = 'code' | 'doc' | 'all';

// ===== Configuration Types =====
export interface Viewport {
  width: number;
  height: number;
}

export interface BrowserConfig {
  headless?: boolean;
  browser_type?: BrowserType;
  user_agent?: string;
  proxy?: string;
  page_timeout?: number;
  verbose?: boolean;
  simulate_user?: boolean;
  magic?: boolean;
  override_navigator?: boolean;
  user_data_dir?: string;
  use_managed_browser?: boolean;
  viewport?: Viewport;
  headers?: Record<string, string>;
  cookies?: Cookie[];
  extra_args?: string[];
  ignore_https_errors?: boolean;
  java_script_enabled?: boolean;
  accept_downloads?: boolean;
  downloads_path?: string;
}

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

// ===== Extraction Strategy Types =====
export interface JsonCssExtractionParams {
  schema: CssExtractionSchema;
}

export interface CssExtractionSchema {
  name?: string;
  baseSelector: string;
  fields: CssExtractionField[];
}

export interface CssExtractionField {
  name: string;
  selector: string;
  type: 'text' | 'html' | 'attribute' | 'href' | 'src';
  attribute?: string;
  multiple?: boolean;
  transform?: string;
}

export interface LlmExtractionParams {
  provider: string;
  api_token?: string;
  api_key?: string;
  schema?: Record<string, unknown>;
  extraction_type?: 'schema' | 'block' | 'markdown';
  instruction?: string;
  model?: string;
  base_url?: string;
  extra_headers?: Record<string, string>;
  extra_body?: Record<string, unknown>;
}

export interface CosineExtractionParams {
  semantic_filter?: string;
  word_count_threshold?: number;
  max_dist?: number;
  top_k?: number;
  model_name?: string;
}

export type ExtractionStrategy =
  | { type: 'json_css'; params: JsonCssExtractionParams }
  | { type: 'llm'; params: LlmExtractionParams }
  | { type: 'cosine'; params: CosineExtractionParams };

// ===== Crawl Configuration =====
export interface CrawlerRunConfig {
  word_count_threshold?: number;
  extraction_strategy?: ExtractionStrategy;
  chunking_strategy?: ChunkingStrategy;
  css_selector?: string;
  screenshot?: boolean;
  pdf?: boolean;
  cache_mode?: CacheMode;
  bypass_cache?: boolean;
  disable_cache?: boolean;
  no_cache_read?: boolean;
  no_cache_write?: boolean;
  log_console?: boolean;
  stream?: boolean;
  warmup?: boolean;
  js_code?: string[];
  js_only?: boolean;
  wait_for?: string;
  page_timeout?: number;
  delay_before_return_html?: number;
  remove_overlay_elements?: boolean;
  mean_delay?: number;
  max_range?: number;
  semaphore_count?: number;
  base_delay?: number;
  random_delay?: number;
  ignore_robots_txt?: boolean;
  anti_bot?: boolean;
  light_mode?: boolean;
  extra?: Record<string, unknown>;
}

export interface ChunkingStrategy {
  type: 'regex' | 'nltk' | 'recursive_url_based_chunking';
  params?: Record<string, unknown>;
}

// ===== Request Types =====
export interface CrawlRequest {
  urls: string | string[];
  browser_config?: BrowserConfig;
  crawler_config?: CrawlerRunConfig;
  session_id?: string;
  priority?: number;
  ttl?: number;
  extra?: Record<string, unknown>;
}

export interface MarkdownRequest {
  url: string;
  f?: ContentFilter;
  q?: string;
  c?: string;
}

export interface HtmlRequest {
  url: string;
}

export interface ScreenshotRequest {
  url: string;
  screenshot_wait_for?: number;
  output_path?: string;
}

export interface PdfRequest {
  url: string;
  output_path?: string;
}

export interface ExecuteJsRequest {
  url: string;
  scripts: string[];
}

export interface TokenRequest {
  email: string;
}

export interface ConfigDumpRequest {
  code: string;
}

export interface AskRequest {
  context_type?: ContextType;
  query?: string;
  score_ratio?: number;
  max_results?: number;
}

// ===== Response Types =====
export interface CrawlResult {
  url: string;
  html: string;
  success: boolean;
  cleaned_html?: string;
  media?: MediaInfo;
  links?: LinksInfo;
  downloaded_files?: string[];
  js_execution_result?: Record<string, unknown>;
  screenshot?: string;
  pdf?: string;
  mhtml?: string;
  markdown?: string;
  fit_markdown?: string;
  raw_markdown?: string;
  markdown_with_citations?: string;
  references_markdown?: string;
  fit_html?: string;
  extracted_content?: string;
  metadata?: PageMetadata;
  error_message?: string;
  session_id?: string;
  response_headers?: Record<string, string>;
  status_code?: number;
  ssl_certificate?: SSLCertificate;
  dispatch_result?: DispatchResult;
  redirected_url?: string;
  network_requests?: Array<Record<string, unknown>>;
  console_messages?: Array<Record<string, unknown>>;
  crawl_depth?: number;
  text?: string;
  cookies?: Cookie[];
}

export interface MediaInfo {
  images: MediaItem[];
  videos: MediaItem[];
  audios: MediaItem[];
}

export interface MediaItem {
  src: string;
  alt?: string;
  desc?: string;
  score?: number;
  type?: string;
}

export interface LinksInfo {
  internal: LinkItem[];
  external: LinkItem[];
}

export interface LinkItem {
  href: string;
  text?: string;
  title?: string;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  language?: string;
  canonical_url?: string;
  open_graph?: Record<string, string>;
  twitter_card?: Record<string, string>;
}

export interface SSLCertificate {
  issuer?: string;
  subject?: string;
  valid_from?: string;
  valid_to?: string;
  fingerprint?: string;
}

export interface DispatchResult {
  status?: string;
  message?: string;
  data?: unknown;
}

export interface HealthResponse {
  status: string;
  timestamp: number;
  version: string;
}

export interface TokenResponse {
  token: string;
}

export interface AskResponse {
  context: string;
  type: ContextType;
  query?: string;
  results_count: number;
}

// ===== Error Types =====
export interface ValidationError {
  detail: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
  }>;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: ValidationError | Record<string, unknown>;
}

// ===== SDK Configuration =====
export interface Crawl4AIConfig {
  baseUrl: string;
  apiToken?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  defaultHeaders?: Record<string, string>;
  throwOnError?: boolean;
  validateStatus?: (status: number) => boolean;
  debug?: boolean;
}

// ===== Utility Types =====
export type RequestConfig = {
  timeout?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};
