# Token Caching and Cost Optimization

Research CLI automatically optimizes API costs through token caching when using API key authentication (Research API key or Vertex AI). This feature reuses previous system instructions and context to reduce the number of tokens processed in subsequent requests.

**Token caching is available for:**

- API key users (Research API key)
- Vertex AI users (with project and location setup)

**Token caching is not available for:**

- OAuth users (iEchor Personal/Enterprise accounts) - the Code Assist API does not support cached content creation at this time

You can view your token usage and cached token savings using the `/stats` command. When cached tokens are available, they will be displayed in the stats output.
