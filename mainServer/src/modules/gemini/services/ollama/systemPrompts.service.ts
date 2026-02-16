import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import path from 'node:path';

@Injectable()
export class SystemPromptsService {
  private readonly logger = new Logger(SystemPromptsService.name);

  constructor(private readonly configService: ConfigService) {}

  loadAllSystemPrompts() {
    const agentPersonality = this.loadAgentPersonality();
    const aboutMe = this.loadAboutMe();

    this.logger.log(` ***** Loading system prompts ***** `);

    const contexts = {
      system_context: {
        user_information: aboutMe,
        persona_instructions: agentPersonality,
      },
    };

    this.logger.log(` ***** System prompts loaded ***** `);

    return this.createXML(contexts);
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
      this.logger.log(`AboutMe loaded from file: ${aboutMePromptFilePath}`);
    } catch (error) {
      this.logger.error(
        `Failed to load agent Personality from file: ${aboutMePromptFilePath}`,
        error,
      );
      return '';
    }

    return abountMePrompt;
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
      this.logger.log(
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

  private createXML(tags: Record<string, any>): string {
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
