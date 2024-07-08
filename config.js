
import * as dotenv from 'dotenv';
import { getArgs } from './helpers.js';
import "./configFile.js"

dotenv.config();

export const args = getArgs();

/**
 * possible values: 'openai' or 'ollama'
 */
export const AI_PROVIDER = args.PROVIDER || process.env.PROVIDER || 'openai'


/** 
 * name of the model to use.
 * can use this to switch between different local models.
 */
export const MODEL = args.MODEL || process.env.MODEL || process.env.OLLAMA_MODEL;

/**
 * the OpenAI API URL to use
 * can use this to use different OpenAI-compatible APIs (like Groq)
 */
export const OPENAI_API_URL = args.OPENAI_API_URL || process.env.OPENAI_URL || process.env.OPENAI_API_URL || "https://api.openai.com/v1";

/**
 * The OpenAI Model to use
 * can use different models by just changing it
 */
export const OPENAI_MODEL = args.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4-1106-preview";
