import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import path from 'node:path';

@Injectable()
export class SystemPromptsService {
  private readonly logger = new Logger(SystemPromptsService.name);
  private readonly temporaryEmailPromptFileName = 'temporaryEmail.txt';

  constructor(private readonly configService: ConfigService) {}

  loadAllSystemPrompts() {
    const generalPrompt = this.loadGeneralPrompt();
    const agentPersonality = this.loadAgentPersonality();
    const aboutMe = this.loadAboutMe();
    const temporaryEmail = this.loadTemporaryEmail();

    this.logger.debug(` ***** Loading system prompts ***** `);

    const contexts = {
      system_context: {
        general_instructions: generalPrompt,
        user_information: aboutMe,
        persona_instructions: agentPersonality,
        temporaryEmail,
      },
    };

    this.logger.debug(` ***** System prompts loaded ***** `);

    return this.createXML(contexts);
  }

  loadGeneralPrompt(): string {
    const generalPromptFilePath = path.join(
      process.cwd(),
      this.configService.get<string>('SYSTEM_PROMPTS_DIRECTORY', ''),
      `${this.configService.get<string>('GENERAL_PROMPT_FILE_NAME', 'general.txt')}`,
    );
    try {
      const generalPrompt = fs.readFileSync(generalPromptFilePath, 'utf-8');
      this.logger.debug(
        `General prompt loaded from file: ${generalPromptFilePath}`,
      );
      return generalPrompt;
    } catch (error) {
      this.logger.error(
        `Failed to load general prompt from file: ${generalPromptFilePath}`,
        error,
      );
      return '';
    }
  }

  loadAboutMe() {
    const aboutMePromptFilePath = path.join(
      process.cwd(),
      this.configService.get<string>('SYSTEM_PROMPTS_DIRECTORY', ''),
      `${this.configService.get('ABOUT_ME_FILE_NAME')}`,
    );
    let abountMePrompt: string;
    try {
      abountMePrompt = fs.readFileSync(aboutMePromptFilePath, 'utf-8');
      this.logger.debug(`AboutMe loaded from file: ${aboutMePromptFilePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to load agent Personality from file: ${aboutMePromptFilePath}`,
        error,
      );
      return '';
    }

    return abountMePrompt;
  }

  loadTemporaryEmail() {
    const promptFilePath = path.join(
      process.cwd(),
      this.configService.get<string>('SYSTEM_PROMPTS_DIRECTORY', ''),
      this.temporaryEmailPromptFileName,
    );
    let prompt: string;
    try {
      prompt = fs.readFileSync(promptFilePath, 'utf-8');
      this.logger.debug(`TemporaryEmail loaded from file: ${promptFilePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to load TemporaryEmail from file: ${promptFilePath}`,
        error,
      );
      return '';
    }

    return prompt;
  }

  loadAgentPersonality() {
    const agentPersonalityFilePath = path.join(
      process.cwd(),
      this.configService.get<string>('SYSTEM_PROMPTS_DIRECTORY', ''),
      this.configService.get<string>('AGENT_PERSONALITY_DIRECTORY', ''),
      `${this.configService.get<string>('AGENT_PERSONALITY', '')}`,
    );
    let agentPersonality: string;
    try {
      agentPersonality = fs.readFileSync(agentPersonalityFilePath, 'utf-8');
      this.logger.debug(
        `Agent Personality loaded from file: ${agentPersonalityFilePath}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to load agent Personality from file: ${agentPersonalityFilePath}`,
        error,
      );
      agentPersonality =
        'You are a helpful AI assistant. designed to help humans.';
      this.logger.log(
        `Use default value for agent personality: ${agentPersonality}`,
      );
    }

    return agentPersonality;
  }

  private createXML(tags: Record<string, unknown>): string {
    let xmlString = '';
    function processTags(tags) {
      for (const [tag, content] of Object.entries(tags)) {
        if (typeof content === 'object') {
          xmlString += `<${tag}>`;
          processTags(content);
          xmlString += `</${tag}>`;
        } else {
          xmlString += `<${tag}>${content as string}</${tag}>`;
        }
      }
    }

    processTags(tags);

    return xmlString;
  }
}
