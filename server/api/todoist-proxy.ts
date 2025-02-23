export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { method, endpoint, params } = await readBody(event)
  
  const token = config.todoistApiToken
  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuratiefout',
      message: 'Todoist API token is niet geconfigureerd'
    })
  }
  
  console.log('Using endpoint:', endpoint)
  
  console.log('Using token: Bearer', token)
  const response = await fetch(`https://api.todoist.com/rest/v2${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: method !== 'GET' ? JSON.stringify(params) : undefined
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Todoist API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    throw createError({
      statusCode: response.status,
      statusMessage: `Todoist API Error: ${response.statusText}`,
      message: errorText
    })
  }

  return response.json()
}) 