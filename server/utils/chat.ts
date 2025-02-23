import { geminiModel, todoistClient } from './auth'

export async function handleChatRequest(message: string, useOfficialDocs: boolean) {
  try {
    // Haal huidige taken op
    const tasks = await todoistClient.getTasks()
    console.log('tasks', tasks)
    
    // Tijdcontext maken
    const now = new Date()
    const timeContext = {
      readable: now.toLocaleTimeString('nl-NL'),
      dayOfWeek: now.toLocaleDateString('nl-NL', { weekday: 'long' })
    }

    // Kies de juiste context gebaseerd op useOfficialDocs
    const context = useOfficialDocs 
      ? `
        Current time: ${timeContext.readable}
        Current day: ${timeContext.dayOfWeek}
        
        Current tasks from Todoist (access task by id):
        ${tasks.map(task => `- ${task.id} ${task.content}`).join('\n')}

        You can find the complete Todoist API documentation here: https://developer.todoist.com/rest/v2/
        Please use this documentation to help the user with their Todoist tasks.
        
        Response format for API calls:
        [{"method": "POST", "endpoint": "/tasks", "params": {"content": "example"}}]
        `
      : `
        Current time: ${timeContext.readable}
        Current day: ${timeContext.dayOfWeek}
        
        Current tasks from Todoist (access tasks by id in the endpoint url):
        ${tasks.map(task => `- ${task.id} ${task.content}`).join('\n')}

        Todoist API Documentation (v2):
        When creating API calls, always use the exact endpoint format starting with /tasks, /projects, etc.
        You need to use the id's of the resources in the url. example: /tasks/1234567890
        IMPORTANT: Never include Params except for the id's of the resources in the endpoint URL - put them in the params object ONLY.

        Available endpoints:
        1. Tasks
        - GET /tasks/:id
          Params: { project_id?, section_id?, label? }
        - POST /tasks/:id
          Params: { content: "task name", due_date?, priority?: 1-4, project_id? }

        2. Projects
        - GET /projects/:id
        - POST /projects/:id
          Params: { name: "project name", parent_id?, is_favorite?: boolean }

        3. Sections
        - GET /sections/:id
        - POST /sections/:id
          Params: { name: "section name", project_id: number }

        Response format example always in the format of an array of objects:
        [
          {
            "method": "POST",
            "endpoint": "/tasks",
            "params": {
              "content": "Buy groceries",
              "due_date": "2024-03-20"
            }
          }
        ]
        `

    // Stuur het verzoek naar het AI model
    const result = await geminiModel.generateContent(
      `${context}\n\nUser request: ${message}`
    )
    
    const response = await result.response
    const responseText = response.text()
    if (!responseText) {
      throw new Error('Geen antwoord van AI model')
    }

    // Probeer API acties te extraheren uit het antwoord
    const apiActionsMatch = responseText.match(/\[.*?\]/s)
    console.log('apiActionsMatch', apiActionsMatch)
    if (apiActionsMatch) {
      try {
        const apiActions = JSON.parse(apiActionsMatch[0])
        // Voer elke API actie uit
        for (const action of apiActions) {
          console.log('Sending request to Todoist:', action)
          const response = await fetch(`https://api.todoist.com/rest/v2${action.endpoint}`, {
            method: action.method,
            headers: {
              'Authorization': `Bearer ${process.env.TODOIST_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(action.params)
          })
          
          if (!response.ok) {
            console.log('Response not ok:', response)
            const errorData = await response.json()
            console.error('Todoist API error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            })
            throw new Error(`Todoist API error: ${response.status} ${response.statusText}`)
          }
        }
      } catch (error) {
        console.error('Error executing API actions:', error)
        return {
          message: responseText + '\n\nLet op: Er ging iets mis bij het uitvoeren van de gevraagde acties.',
          needsAuth: false
        }
      }
    }

    return {
      message: responseText + '\n\nDe gevraagde acties zijn uitgevoerd.',
      needsAuth: false
    }

  } catch (error) {
    console.error('Error in handleChatRequest:', error)
    return {
      success: false,
      error: 'Er is een fout opgetreden bij het verwerken van je verzoek.'
    }
  }
} 