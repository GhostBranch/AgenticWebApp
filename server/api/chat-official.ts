import { handleChatRequest } from '../utils/chat'
export default defineEventHandler(async (event) => {
  
  const { message } = await readBody(event)
  return handleChatRequest(message, true)
}) 