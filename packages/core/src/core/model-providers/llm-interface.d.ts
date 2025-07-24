declare module 'llm-interface' {
  export class LLMInterface {
    static setApiKey(keys: Record<string, string>): void;
    static sendMessage(
      provider: string,
      options: {
        messages?: Array<{ role: string; content: string }>;
        model?: string;
        temperature?: number;
        max_tokens?: number;
        top_p?: number;
        frequency_penalty?: number;
        presence_penalty?: number;
        stop?: string[];
        stream?: boolean;
      },
    ): Promise<any>;
  }
}
