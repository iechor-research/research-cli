# Web Search Tool (`iechor_web_search`)

This document describes the `iechor_web_search` tool.

## Description

Use `iechor_web_search` to perform a web search using Google Search via the Research API. The `iechor_web_search` tool returns a summary of web results with sources.

### Arguments

`iechor_web_search` takes one argument:

- `query` (string, required): The search query.

## How to use `iechor_web_search` with the Research CLI

The `iechor_web_search` tool sends a query to the Research API, which then performs a web search. `iechor_web_search` will return a generated response based on the search results, including citations and sources.

Usage:

```
iechor_web_search(query="Your query goes here.")
```

## `iechor_web_search` examples

Get information on a topic:

```
iechor_web_search(query="latest advancements in AI-powered code generation")
```

## Important notes

- **Response returned:** The `iechor_web_search` tool returns a processed summary, not a raw list of search results.
- **Citations:** The response includes citations to the sources used to generate the summary.
