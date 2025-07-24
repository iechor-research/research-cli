# Research CLI: Terms of Service and Privacy Notice

Research CLI is an open-source tool that lets you interact with iEchor's powerful language models directly from your command-line interface. The Terms of Service and Privacy Notices that apply to your usage of the Research CLI depend on the type of account you use to authenticate with iEchor.

This article outlines the specific terms and privacy policies applicable for different account types and authentication methods. Note: See [quotas and pricing](./quota-and-pricing.md) for the quota and pricing details that apply to your usage of the Research CLI.

## How to determine your authentication method

Your authentication method refers to the method you use to log into and access the Research CLI. There are four ways to authenticate:

- Logging in with your iEchor account to Research Code Assist for Individuals
- Logging in with your iEchor account to Research Code Assist for Workspace, Standard, or Enterprise Users
- Using an API key with Research Developer
- Using an API key with Vertex AI GenAI API

For each of these four methods of authentication, different Terms of Service and Privacy Notices may apply.

| Authentication                  | Account             | Terms of Service                                                                                            | Privacy Notice                                                                                                                                                                                       |
| :------------------------------ | :------------------ | :---------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research Code Assist via iEchor | Individual          | [iEchor Terms of Service](https://policies.iechor.com/terms?hl=en-US)                                       | [Research Code Assist Privacy Notice for Individuals](https://developers.iechor.com/research-code-assist/resources/privacy-notice-research-code-assist-individuals)                                  |
| Research Code Assist via iEchor | Standard/Enterprise | [iEchor Cloud Platform Terms of Service](https://cloud.iechor.com/terms)                                    | [Research Code Assist Privacy Notice for Standard and Enterprise](https://cloud.iechor.com/research/docs/codeassist/security-privacy-compliance#standard_and_enterprise_data_protection_and_privacy) |
| Research Developer API          | Unpaid              | [Research API Terms of Service - Unpaid Services](https://ai.iechor.dev/research-api/terms#unpaid-services) | [iEchor Privacy Policy](https://policies.iechor.com/privacy)                                                                                                                                         |
| Research Developer API          | Paid                | [Research API Terms of Service - Paid Services](https://ai.iechor.dev/research-api/terms#paid-services)     | [iEchor Privacy Policy](https://policies.iechor.com/privacy)                                                                                                                                         |
| Vertex AI Gen API               |                     | [iEchor Cloud Platform Service Terms](https://cloud.iechor.com/terms/service-terms/)                        | [iEchor Cloud Privacy Notice](https://cloud.iechor.com/terms/cloud-privacy-notice)                                                                                                                   |

## 1. If you have logged in with your iEchor account to Research Code Assist for Individuals

For users who use their iEchor account to access [Research Code Assist for Individuals](https://developers.iechor.com/research-code-assist/docs/overview#supported-features-gca), these Terms of Service and Privacy Notice documents apply:

- **Terms of Service:** Your use of the Research CLI is governed by the [iEchor Terms of Service](https://policies.iechor.com/terms?hl=en-US).
- **Privacy Notice:** The collection and use of your data is described in the [Research Code Assist Privacy Notice for Individuals](https://developers.iechor.com/research-code-assist/resources/privacy-notice-research-code-assist-individuals).

## 2. If you have logged in with your iEchor account to Research Code Assist for Workspace, Standard, or Enterprise Users

For users who use their iEchor account to access the [Standard or Enterprise edition](https://cloud.iechor.com/research/docs/codeassist/overview#editions-overview) of Research Code Assist, these Terms of Service and Privacy Notice documents apply:

- **Terms of Service:** Your use of the Research CLI is governed by the [iEchor Cloud Platform Terms of Service](https://cloud.iechor.com/terms).
- **Privacy Notice:** The collection and use of your data is described in the [Research Code Assist Privacy Notices for Standard and Enterprise Users](https://cloud.iechor.com/research/docs/codeassist/security-privacy-compliance#standard_and_enterprise_data_protection_and_privacy).

## 3. If you have logged in with a Research API key to the Research Developer API

If you are using a Research API key for authentication with the [Research Developer API](https://ai.iechor.dev/research-api/docs), these Terms of Service and Privacy Notice documents apply:

- **Terms of Service:** Your use of the Research CLI is governed by the [Research API Terms of Service](https://ai.iechor.dev/research-api/terms). These terms may differ depending on whether you are using an unpaid or paid service:
  - For unpaid services, refer to the [Research API Terms of Service - Unpaid Services](https://ai.iechor.dev/research-api/terms#unpaid-services).
  - For paid services, refer to the [Research API Terms of Service - Paid Services](https://ai.iechor.dev/research-api/terms#paid-services).
- **Privacy Notice:** The collection and use of your data is described in the [iEchor Privacy Policy](https://policies.iechor.com/privacy).

## 4. If you have logged in with a Research API key to the Vertex AI GenAI API

If you are using a Research API key for authentication with a [Vertex AI GenAI API](https://cloud.iechor.com/vertex-ai/generative-ai/docs/reference/rest) backend, these Terms of Service and Privacy Notice documents apply:

- **Terms of Service:** Your use of the Research CLI is governed by the [iEchor Cloud Platform Service Terms](https://cloud.iechor.com/terms/service-terms/).
- **Privacy Notice:** The collection and use of your data is described in the [iEchor Cloud Privacy Notice](https://cloud.iechor.com/terms/cloud-privacy-notice).

### Usage Statistics Opt-Out

You may opt-out from sending Usage Statistics to iEchor by following the instructions available here: [Usage Statistics Configuration](./cli/configuration.md#usage-statistics).

## Frequently Asked Questions (FAQ) for the Research CLI

### 1. Is my code, including prompts and answers, used to train iEchor's models?

Whether your code, including prompts and answers, is used to train iEchor's models depends on the type of authentication method you use and your account type.

- **iEchor account with Research Code Assist for Individuals**: Yes. When you use your personal iEchor account, the [Research Code Assist Privacy Notice for Individuals](https://developers.iechor.com/research-code-assist/resources/privacy-notice-research-code-assist-individuals) applies. Under this notice,
  your **prompts, answers, and related code are collected** and may be used to improve iEchor's products, including for model training.
- **iEchor account with Research Code Assist for Workspace, Standard, or Enterprise**: No. For these accounts, your data is governed by the [Research Code Assist Privacy Notices](https://cloud.iechor.com/research/docs/codeassist/security-privacy-compliance#standard_and_enterprise_data_protection_and_privacy) terms, which treat your inputs as confidential. Your **prompts, answers, and related code are not collected** and are not used to train models.
- **Research API key via the Research Developer API**: Whether your code is collected or used depends on whether you are using an unpaid or paid service.
  - **Unpaid services**: Yes. When you use the Research API key via the Research Developer API with an unpaid service, the [Research API Terms of Service - Unpaid Services](https://ai.iechor.dev/research-api/terms#unpaid-services) terms apply. Under this notice, your **prompts, answers, and related code are collected** and may be used to improve iEchor's products, including for model training.
  - **Paid services**: No. When you use the Research API key via the Research Developer API with a paid service, the [Research API Terms of Service - Paid Services](https://ai.iechor.dev/research-api/terms#paid-services) terms apply, which treats your inputs as confidential. Your **prompts, answers, and related code are not collected** and are not used to train models.
- **Research API key via the Vertex AI GenAI API**: No. For these accounts, your data is governed by the [iEchor Cloud Privacy Notice](https://cloud.iechor.com/terms/cloud-privacy-notice) terms, which treat your inputs as confidential. Your **prompts, answers, and related code are not collected** and are not used to train models.

### 2. What are Usage Statistics and what does the opt-out control?

The **Usage Statistics** setting is the single control for all optional data collection in the Research CLI.

The data it collects depends on your account and authentication type:

- **iEchor account with Research Code Assist for Individuals**: When enabled, this setting allows iEchor to collect both anonymous telemetry (for example, commands run and performance metrics) and **your prompts and answers** for model improvement.
- **iEchor account with Research Code Assist for Workspace, Standard, or Enterprise**: This setting only controls the collection of anonymous telemetry. Your prompts and answers are never collected, regardless of this setting.
- **Research API key via the Research Developer API**:
  **Unpaid services**: When enabled, this setting allows iEchor to collect both anonymous telemetry (like commands run and performance metrics) and **your prompts and answers** for model improvement. When disabled we will use your data as described in [How iEchor Uses Your Data](https://ai.iechor.dev/research-api/terms#data-use-unpaid).
  **Paid services**: This setting only controls the collection of anonymous telemetry. iEchor logs prompts and responses for a limited period of time, solely for the purpose of detecting violations of the Prohibited Use Policy and any required legal or regulatory disclosures.
- **Research API key via the Vertex AI GenAI API:** This setting only controls the collection of anonymous telemetry. Your prompts and answers are never collected, regardless of this setting.

You can disable Usage Statistics for any account type by following the instructions in the [Usage Statistics Configuration](./cli/configuration.md#usage-statistics) documentation.
