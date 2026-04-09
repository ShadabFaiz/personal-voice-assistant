import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';

export type ModelWithTools = Runnable<BaseLanguageModelInput, AIMessageChunk>;
