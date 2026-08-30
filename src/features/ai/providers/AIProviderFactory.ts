import { env } from '../../../config/env';
import { AIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { LocalAIProvider } from './LocalAIProvider';

export class AIProviderFactory {
  private static instance: AIProvider;

  public static getProvider(): AIProvider {
    if (!this.instance) {
      if (env.ai.enabled && env.ai.provider === 'gemini') {
        this.instance = new GeminiProvider();
      } else {
        this.instance = new LocalAIProvider();
      }
    }
    return this.instance;
  }

  public static isAIEnabled(): boolean {
    return env.ai.enabled;
  }
}
