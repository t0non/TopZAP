// @ts-nocheck
'use server';

import {
  optimizeMessageContent,
  type OptimizeMessageContentInput,
  type OptimizeMessageContentOutput,
} from '@/ai/flows/optimize-message-content';

export async function handleOptimizeMessage(
  input: OptimizeMessageContentInput
): Promise<OptimizeMessageContentOutput> {
  try {
    const result = await optimizeMessageContent(input);
    if (!result) {
      throw new Error('AI optimization failed to produce a result.');
    }
    return result;
  } catch (error) {
    console.error('Error optimizing message with AI:', error);
    throw new Error('Falha ao otimizar a mensagem. Tente novamente.');
  }
}
