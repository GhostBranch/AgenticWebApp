import { TodoistApi } from '@doist/todoist-api-typescript'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

const config = useRuntimeConfig()

// Initialize Todoist client
export const todoistClient = new TodoistApi(config.todoistApiKey)

// Initialize Gemini client
export const genAI = new GoogleGenerativeAI(config.geminiApiKey)
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" })

// Initialize Google OAuth2 client
export const oauth2Client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
)

// Initialize Google Calendar API
export const calendar = google.calendar({ 
  version: 'v3',
  auth: oauth2Client
}) 