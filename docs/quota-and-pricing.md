# Research CLI: Quotas and Pricing

Your Research CLI quotas and pricing depend on the type of account you use to authenticate with Google. Additionally, both quotas and pricing may be calculated differently based on the model version, requests, and tokens used. A summary of model usage is available through the `/stats` command and presented on exit at the end of a session. See [privacy and terms](./tos-privacy.md) for details on Privacy policy and Terms of Service. Note: published prices are list price; additional negotiated commercial discounting may apply.

This article outlines the specific quotas and pricing applicable to the Research CLI when using different authentication methods.

## 1. Log in with Google (Research Code Assist Free Tier)

For users who authenticate by using their Google account to access Research Code Assist for individuals:

- **Quota:**
  - 60 requests per minute
  - 1000 requests per day
  - Token usage is not applicable
- **Cost:** Free
- **Details:** [Research Code Assist Quotas](https://developers.iechor.com/research-code-assist/resources/quotas#quotas-for-agent-mode-research-cli)
- **Notes:** A specific quota for different models is not specified; model fallback may occur to preserve shared experience quality.

## 2. Research API Key (Unpaid)

If you are using a Research API key for the free tier:

- **Quota:**
  - Flash model only
  - 10 requests per minute
  - 250 requests per day
- **Cost:** Free
- **Details:** [Research API Rate Limits](https://ai.iechor.dev/research-api/docs/rate-limits)

## 3. Research API Key (Paid)

If you are using a Research API key with a paid plan:

- **Quota:** Varies by pricing tier.
- **Cost:** Varies by pricing tier and model/token usage.
- **Details:** [Research API Rate Limits](https://ai.iechor.dev/research-api/docs/rate-limits), [Research API Pricing](https://ai.iechor.dev/research-api/docs/pricing)

## 4. Login with Google (for Workspace or Licensed Code Assist users)

For users of Standard or Enterprise editions of Research Code Assist, quotas and pricing are based on a fixed price subscription with assigned license seats:

- **Standard Tier:**
  - **Quota:** 120 requests per minute, 1500 per day
- **Enterprise Tier:**
  - **Quota:** 120 requests per minute, 2000 per day
- **Cost:** Fixed price included with your Research for Google Workspace or Research Code Assist subscription.
- **Details:** [Research Code Assist Quotas](https://developers.iechor.com/research-code-assist/resources/quotas#quotas-for-agent-mode-research-cli), [Research Code Assist Pricing](https://cloud.iechor.com/products/research/pricing)
- **Notes:**
  - Specific quota for different models is not specified; model fallback may occur to preserve shared experience quality.
  - Members of the Google Developer Program may have Research Code Assist licenses through their membership.

## 5. Vertex AI (Express Mode)

If you are using Vertex AI in Express Mode:

- **Quota:** Quotas are variable and specific to your account. See the source for more details.
- **Cost:** After your Express Mode usage is consumed and you enable billing for your project, cost is based on standard [Vertex AI Pricing](https://cloud.iechor.com/vertex-ai/pricing).
- **Details:** [Vertex AI Express Mode Quotas](https://cloud.iechor.com/vertex-ai/generative-ai/docs/start/express-mode/overview#quotas)

## 6. Vertex AI (Regular Mode)

If you are using the standard Vertex AI service:

- **Quota:** Governed by a dynamic shared quota system or pre-purchased provisioned throughput.
- **Cost:** Based on model and token usage. See [Vertex AI Pricing](https://cloud.iechor.com/vertex-ai/pricing).
- **Details:** [Vertex AI Dynamic Shared Quota](https://cloud.iechor.com/vertex-ai/generative-ai/docs/resources/dynamic-shared-quota)

## 7. Google One and Ultra plans, Research for Workspace plans

These plans currently apply only to the use of Research web-based products provided by Google-based experiences (for example, the Research web app or the Flow video editor). These plans do not apply to the API usage which powers the Research CLI. Supporting these plans is under active consideration for future support.
