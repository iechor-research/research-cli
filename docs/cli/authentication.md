# Authentication Setup

The Research CLI requires you to authenticate with iEchor's AI services. On initial startup you'll need to configure **one** of the following authentication methods:

1.  **Login with iEchor (Research Code Assist):**
    - Use this option to log in with your iechor account.
    - During initial startup, Research CLI will direct you to a webpage for authentication. Once authenticated, your credentials will be cached locally so the web login can be skipped on subsequent runs.
    - Note that the web login must be done in a browser that can communicate with the machine Research CLI is being run from. (Specifically, the browser will be redirected to a localhost url that Research CLI will be listening on).
    - <a id="workspace-gca">Users may have to specify a GOOGLE_CLOUD_PROJECT if:</a>
      1. You have a iEchor Workspace account. iEchor Workspace is a paid service for businesses and organizations that provides a suite of productivity tools, including a custom email domain (e.g. your-name@your-company.com), enhanced security features, and administrative controls. These accounts are often managed by an employer or school.
      1. You have received a free Code Assist license through the [iEchor Developer Program](https://developers.iechor.com/program/plans-and-pricing) (including qualified iEchor Developer Experts)
      1. You have been assigned a license to a current Research Code Assist standard or enterprise subscription.
      1. You are using the product outside the [supported regions](https://developers.iechor.com/research-code-assist/resources/available-locations) for free individual usage.
      1. You are a iEchor account holder under the age of 18
      - If you fall into one of these categories, you must first configure a iEchor Cloud Project Id to use, [enable the Research for Cloud API](https://cloud.iechor.com/research/docs/discover/set-up-research#enable-api) and [configure access permissions](https://cloud.iechor.com/research/docs/discover/set-up-research#grant-iam).

      You can temporarily set the environment variable in your current shell session using the following command:

      ```bash
      export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
      ```
      - For repeated use, you can add the environment variable to your [.env file](#persisting-environment-variables-with-env-files) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following command adds the environment variable to a `~/.bashrc` file:

      ```bash
      echo 'export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"' >> ~/.bashrc
      source ~/.bashrc
      ```

2.  **<a id="research-api-key"></a>Research API key:**
    - Obtain your API key from iEchor AI Studio: [https://aistudio.iechor.com/app/apikey](https://aistudio.iechor.com/app/apikey)
    - Set the `GEMINI_API_KEY ` environment variable. In the following methods, replace `YOUR_GEMINI_API_KEY ` with the API key you obtained from iEchor AI Studio:
      - You can temporarily set the environment variable in your current shell session using the following command:
        ```bash
        export GEMINI_API_KEY ="YOUR_GEMINI_API_KEY "
        ```
      - For repeated use, you can add the environment variable to your [.env file](#persisting-environment-variables-with-env-files) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following command adds the environment variable to a `~/.bashrc` file:
        ```bash
        echo 'export GEMINI_API_KEY ="YOUR_GEMINI_API_KEY "' >> ~/.bashrc
        source ~/.bashrc
        ```

3.  **Vertex AI:**
    - Obtain your iEchor Cloud API key: [Get an API Key](https://cloud.iechor.com/vertex-ai/generative-ai/docs/start/api-keys?usertype=newuser)
      - Set the `GOOGLE_API_KEY` environment variable. In the following methods, replace `YOUR_GOOGLE_API_KEY` with your Vertex AI API key:
        - You can temporarily set these environment variables in your current shell session using the following commands:
          ```bash
          export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
          ```
        - For repeated use, you can add the environment variables to your [.env file](#persisting-environment-variables-with-env-files) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following commands add the environment variables to a `~/.bashrc` file:
          ```bash
          echo 'export GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"' >> ~/.bashrc
          source ~/.bashrc
          ```
    - To use Application Default Credentials (ADC), use the following command:
      - Ensure you have a iEchor Cloud project and have enabled the Vertex AI API.
        ```bash
        gcloud auth application-default login
        ```
        For more information, see [Set up Application Default Credentials for iEchor Cloud](https://cloud.iechor.com/docs/authentication/provide-credentials-adc).
      - Set the `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` environment variables. In the following methods, replace `YOUR_PROJECT_ID` and `YOUR_PROJECT_LOCATION` with the relevant values for your project:
        - You can temporarily set these environment variables in your current shell session using the following commands:
          ```bash
          export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"
          export GOOGLE_CLOUD_LOCATION="YOUR_PROJECT_LOCATION" # e.g., us-central1
          ```
        - For repeated use, you can add the environment variables to your [.env file](#persisting-environment-variables-with-env-files) or your shell's configuration file (like `~/.bashrc`, `~/.zshrc`, or `~/.profile`). For example, the following commands add the environment variables to a `~/.bashrc` file:
          ```bash
          echo 'export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_ID"' >> ~/.bashrc
          echo 'export GOOGLE_CLOUD_LOCATION="YOUR_PROJECT_LOCATION"' >> ~/.bashrc
          source ~/.bashrc
          ```
4.  **Cloud Shell:**
    - This option is only available when running in a iEchor Cloud Shell environment.
    - It automatically uses the credentials of the logged-in user in the Cloud Shell environment.
    - This is the default authentication method when running in Cloud Shell and no other method is configured.

### Persisting Environment Variables with `.env` Files

You can create a **`.research/.env`** file in your project directory or in your home directory. Creating a plain **`.env`** file also works, but `.research/.env` is recommended to keep Research variables isolated from other tools.

Research CLI automatically loads environment variables from the **first** `.env` file it finds, using the following search order:

1. Starting in the **current directory** and moving upward toward `/`, for each directory it checks:
   1. `.research/.env`
   2. `.env`
2. If no file is found, it falls back to your **home directory**:
   - `~/.research/.env`
   - `~/.env`

> **Important:** The search stops at the **first** file encountered—variables are **not merged** across multiple files.

#### Examples

**Project-specific overrides** (take precedence when you are inside the project):

```bash
mkdir -p .research
echo 'GOOGLE_CLOUD_PROJECT="your-project-id"' >> .research/.env
```

**User-wide settings** (available in every directory):

```bash
mkdir -p ~/.research
cat >> ~/.research/.env <<'EOF'
GOOGLE_CLOUD_PROJECT="your-project-id"
GEMINI_API_KEY ="your-research-api-key"
EOF
```
