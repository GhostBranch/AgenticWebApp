export const isAuthenticated = () => {
  const credentials = oauth2Client.credentials
  return credentials && Object.keys(credentials).length > 0
} 