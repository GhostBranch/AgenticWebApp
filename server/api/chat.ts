import { geminiModel, todoistClient, calendar, oauth2Client } from '../utils/auth'
import { isAuthenticated } from '../utils/authHelper'

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event)

  try {
    // Get context from Todoist
    const tasks = await todoistClient.getTasks()
    
    let calendarEvents = { data: { items: [] } }
    
    // Only try to get calendar events if authenticated
    if (isAuthenticated()) {
      calendarEvents = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      })
    } else {
      // Return a response indicating authentication is needed
      return {
        message: "Please authenticate with Google Calendar first. Click here to authenticate: /api/auth/google",
        needsAuth: true
      }
    }

    // Get current date and time information
    const now = new Date()
    const timeContext = {
      current: now.toISOString(),
      readable: now.toLocaleString(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
    }

    // Create context for the AI
    const context = `
      Current time: ${timeContext.readable}
      Current day: ${timeContext.dayOfWeek}
      
      Current tasks from Todoist:
      ${tasks.map(task => `- ${task.content}`).join('\n')}
      
      Upcoming calendar events:
      ${calendarEvents.data.items?.map(event => 
        `- ${event.summary} (${event.start?.dateTime || event.start?.date})`
      ).join('\n')}
    `

    // Generate response using Gemini
    const result = await geminiModel.generateContent(`
      Context: ${context}
      
      User message: ${message}
      
      Please help the user with their tasks and schedule. You can:
      1. Create new tasks in Todoist
      2. Search existing tasks
      3. Create calendar events (if authenticated)
      4. Provide schedule information
      
      When creating calendar events:
      - Current time is: ${timeContext.readable}
      - Use this exact format for dates: YYYY-MM-DDTHH:mm:ss
      - Times should be in 24-hour format
      - If user mentions "tomorrow", use the next day's date
      - If user mentions a day of the week, find the next occurrence of that day
      - Default duration is 1 hour if not specified
      - If no time is specified for "tomorrow", default to 09:00
      - If no date is specified, assume today if the time is in the future, tomorrow if it's in the past
      
      If the user wants to create a calendar event, respond with a JSON object in this format:
      {
        "action": "createEvent",
        "event": {
          "summary": "Event title",
          "description": "Event description",
          "start": "YYYY-MM-DDTHH:mm:ss",
          "end": "YYYY-MM-DDTHH:mm:ss"
        }
      }

      If the user wants to create a Todoist task, respond with a JSON object in this format:
      {
        "action": "createTask",
        "task": {
          "content": "Task description",
          "dueString": "tomorrow", // Optional, can be "today", "tomorrow", or a specific date
          "priority": 1 // Optional, 1-4 where 4 is highest priority
        }
      }
      
      Make sure to wrap the JSON in triple backticks like this: \`\`\`json {...} \`\`\`
      
      For all other responses, just respond in a helpful and natural way.
    `)
    
    const response = await result.response
    const text = response.text()

    // Check if the response contains a JSON object
    const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/)
    if (jsonMatch) {
      try {
        const actionData = JSON.parse(jsonMatch[1])
        
        if (actionData.action === 'createEvent') {
          // Create the calendar event
          const event = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary: actionData.event.summary,
              description: actionData.event.description,
              start: {
                dateTime: actionData.event.start,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
              end: {
                dateTime: actionData.event.end,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            }
          })
          
          return {
            message: `I've created the event "${actionData.event.summary}" in your calendar.`
          }
        }
        
        if (actionData.action === 'createTask') {
          // Create the Todoist task
          const task = await todoistClient.addTask({
            content: actionData.task.content,
            dueString: actionData.task.dueString,
            priority: actionData.task.priority
          })
          
          return {
            message: `I've created the task "${actionData.task.content}" in Todoist.`
          }
        }
      } catch (error) {
        console.error('Error creating item:', error)
        return {
          message: "I understood your request, but I encountered an error. Please try again with a different format."
        }
      }
    }

    return {
      message: text
    }
  } catch (error) {
    console.error('Error processing message:', error)
    throw createError({
      statusCode: 500,
      message: 'Error processing your request'
    })
  }
}) 