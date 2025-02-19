import { oauth2Client } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string

  try {
    if (!code) {
      throw new Error('No authorization code received')
    }

    const { tokens } = await oauth2Client.getToken(code)
    
    if (!tokens) {
      throw new Error('No tokens received')
    }

    oauth2Client.setCredentials(tokens)
    
    // Store tokens in cookie
    setCookie(event, 'google_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    
    return sendRedirect(event, '/')
  } catch (error) {
    console.error('Error during authentication:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return createError({
      statusCode: 400,
      message: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}) 