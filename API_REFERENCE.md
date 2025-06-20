# Crawl4AI API Reference

**Version:** 1.0.0  
**OAS:** 3.1  
**OpenAPI Spec:** `/openapi.json`

## Endpoints

### General Endpoints

#### GET `/`
**Description:** Root endpoint  
**Responses:**
- `200`: Successful Response (returns string)

#### GET `/metrics`
**Description:** Get Prometheus metrics  
**Responses:**
- `200`: Successful Response (returns string)

#### GET `/health`
**Description:** Health check endpoint  
**Responses:**
- `200`: Successful Response (returns string)

#### GET `/schema`
**Description:** Get API schema  
**Responses:**
- `200`: Successful Response (returns string)

---

### Authentication

#### POST `/token`
**Description:** Get authentication token  
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

---

### Configuration

#### POST `/config/dump`
**Description:** Dump configuration  
**Request Body:**
```json
{
  "code": "string"
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

---

### Content Generation

#### POST `/md`
**Description:** Get Markdown content  
**Request Body:**
```json
{
  "url": "string",
  "f": "fit",  // Content filter: "raw", "fit", "bm25", "llm"
  "q": "string",  // Query for BM25/LLM filters
  "c": "0"  // Cache-bust counter
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

#### POST `/html`
**Description:** Generate HTML - Crawls URL, preprocesses raw HTML for schema extraction  
**Request Body:**
```json
{
  "url": "string"
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

#### POST `/screenshot`
**Description:** Capture full-page PNG screenshot with optional delay  
**Request Body:**
```json
{
  "url": "string",
  "screenshot_wait_for": 2,  // Optional delay in seconds
  "output_path": "string"  // Optional: saves screenshot and returns path
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

#### POST `/pdf`
**Description:** Generate PDF document of specified URL  
**Request Body:**
```json
{
  "url": "string",
  "output_path": "string"  // Optional: saves PDF and returns path
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

---

### JavaScript Execution

#### POST `/execute_js`
**Description:** Execute JavaScript snippets on specified URL  
**Note:** Each script should be an expression that returns a value (IIFE or async function)  
**Request Body:**
```json
{
  "url": "string",
  "scripts": ["string"]  // Array of JS snippets to execute in order
}
```
**Returns:** CrawlResult object with structure:
```python
class CrawlResult:
    url: str
    html: str
    success: bool
    cleaned_html: Optional[str]
    media: Dict[str, List[Dict]]
    links: Dict[str, List[Dict]]
    downloaded_files: Optional[List[str]]
    js_execution_result: Optional[Dict[str, Any]]
    screenshot: Optional[str]
    pdf: Optional[bytes]
    mhtml: Optional[str]
    extracted_content: Optional[str]
    metadata: Optional[dict]
    error_message: Optional[str]
    session_id: Optional[str]
    response_headers: Optional[dict]
    status_code: Optional[int]
    ssl_certificate: Optional[SSLCertificate]
    dispatch_result: Optional[DispatchResult]
    redirected_url: Optional[str]
    network_requests: Optional[List[Dict[str, Any]]]
    console_messages: Optional[List[Dict[str, Any]]]
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

---

### Crawling

#### POST `/crawl`
**Description:** Crawl a list of URLs and return results as JSON  
**Request Body:**
```json
{
  "urls": ["string"],
  "browser_config": {
    "additionalProp1": {}
  },
  "crawler_config": {
    "additionalProp1": {}
  }
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

#### POST `/crawl/stream`
**Description:** Stream crawl results  
**Request Body:**
```json
{
  "urls": ["string"],
  "browser_config": {
    "additionalProp1": {}
  },
  "crawler_config": {
    "additionalProp1": {}
  }
}
```
**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

---

### AI/LLM Features

#### GET `/llm/{url}`
**Description:** LLM endpoint  
**Parameters:**
- `url` (path): URL to process
- `q` (query): Query parameter

**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

#### GET `/ask`
**Description:** Get Crawl4AI library context for AI assistants  
**Note:** Use this endpoint for AI assistants to retrieve library context for decision making or code generation tasks. Always provide a query to filter the context.

**Parameters:**
- `context_type` (query): `"code"`, `"doc"`, or `"all"` (default: `"all"`)
  - Pattern: `^(code|doc|all)$`
- `query` (query): Search query to filter chunks (RECOMMENDED)
- `score_ratio` (query): Min score as fraction of max_score (0-1, default: 0.5)
- `max_results` (query): Maximum results to return (minimum: 1, default: 20)

**Returns:**
- JSON response with requested context
- If "code" specified: returns code context
- If "doc" specified: returns documentation context
- If "all" specified: returns both contexts

**Responses:**
- `200`: Successful Response (returns string)
- `422`: Validation Error

---

### MCP (Model Context Protocol)

#### GET `/mcp/sse`
**Description:** MCP Server-Sent Events endpoint  
**Responses:**
- `200`: Successful Response (returns string)

#### GET `/mcp/schema`
**Description:** MCP schema endpoint  
**Responses:**
- `200`: Successful Response (returns string)

---

## Common Response Types

### Validation Error Response
All endpoints may return a `422` Validation Error with structure:

```json
{
  "detail": [
    {
      "loc": ["string", 0],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### CrawlResult Structure
Complete result object returned by crawl endpoints:

```json
{
  "url": "string",
  "html": "string",
  "success": true,
  "cleaned_html": "string",
  "media": {
    "images": [],
    "videos": [],
    "audios": []
  },
  "links": {
    "internal": [],
    "external": []
  },
  "downloaded_files": ["string"],
  "js_execution_result": {},
  "screenshot": "base64_string",
  "pdf": "bytes",
  "mhtml": "string",
  "markdown": "string",
  "fit_markdown": "string",
  "raw_markdown": "string",
  "markdown_with_citations": "string",
  "references_markdown": "string",
  "fit_html": "string",
  "extracted_content": "string",
  "metadata": {
    "title": "string",
    "description": "string",
    "keywords": "string",
    "author": "string",
    "language": "string",
    "canonical_url": "string",
    "open_graph": {},
    "twitter_card": {}
  },
  "error_message": "string",
  "session_id": "string",
  "response_headers": {},
  "status_code": 200,
  "ssl_certificate": {},
  "dispatch_result": {},
  "redirected_url": "string",
  "network_requests": [],
  "console_messages": []
}
```