import { TodoistApi } from '@doist/todoist-api-typescript'
import { GoogleGenerativeAI } from '@google/generative-ai'

const config = useRuntimeConfig()

// Initialize Todoist client
export const todoistClient = new TodoistApi(config.todoistApiKey)

// Initialize Gemini client
export const genAI = new GoogleGenerativeAI(config.geminiApiKey)
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" })
