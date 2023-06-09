import { ChatOpenAI } from "langchain/chat_models/openai";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from 'langchain/prompts'

import * as dotenv from 'dotenv'
dotenv.config()

type CB = (token: string) => void

export async function sum(content: string, streaming?: boolean, cb?: CB): Promise<string> {
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 3500, chunkOverlap: 0 });
  const docs = await textSplitter.createDocuments([content]);

  const model = new ChatOpenAI({ temperature: 0, streaming });

  const combinePrompt = new PromptTemplate({
      template: `你是一个软件开发专家，根据三联引号中的项目说明写一个总结。
      项目说明：
      """
      {text}
      """
      
      必须用以下的格式用中文输出：
      """
      1. 项目简介：<一句话描述项目，50字>
      2. 项目目标：<描述项目目标，100字>
      3. 使用方法：<项目如何使用，100字>
      """

      输出：
      `,
      inputVariables: ["text"],
  });
  const combineMapPrompt = new PromptTemplate({
      template: `你是一个软件开发专家，根据三联引号中的内容写一个200字中文总结。
      """
      {text}
      """
      200字总结：
      `,
      inputVariables: ["text"],
  });
  const chain = loadSummarizationChain(model, { type: "map_reduce", combineMapPrompt, combinePrompt, });

  if (cb) {
    await chain.call({
      input_documents: docs,
    }, [{
        handleLLMNewToken(token) {
          process.stdout.write(token)
          cb(token)
        }
      }
    ]);
    return ''
  }

  const { text } = await chain.call({
    input_documents: docs,
  });
  return text
  
};
