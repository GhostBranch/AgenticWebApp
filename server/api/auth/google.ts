import { oauth2Client } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Check if credentials are available
  if (!config.googleClientId || !config.googleClientSecret) {
    throw createError({
      statusCode: 500,
      message: 'Google OAuth credentials are not properly configured'
    })
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ]

  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    })

    // Redirect directly to Google OAuth
    return sendRedirect(event, authUrl)
  } catch (error) {
    console.error('Error generating auth URL:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate authentication URL'
    })
  }
}) 