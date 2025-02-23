<template>
  <div class="chat-container">
    <div class="toggle-docs">
      <input type="checkbox" v-model="useOfficialDocs" id="docs-toggle">
      <label for="docs-toggle">Gebruik officiële documentatie</label>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div v-if="message.role === 'assistant'" v-html="renderMarkdown(message.content)" class="markdown-content" />
        <div v-else>
          {{ message.content }}
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="userInput" @keyup.enter="sendMessage" placeholder="Ask me anything about your tasks" type="text">
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const userInput = ref('')
const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const useOfficialDocs = ref(false)

const renderMarkdown = (content: string) => {
  return marked(content, { breaks: true })
}

const sendMessage = async () => {
  if (!userInput.value.trim()) return

  const currentInput = userInput.value
  messages.value.push({
    role: 'user',
    content: currentInput
  })
  userInput.value = ''

  try {
    const endpoint = useOfficialDocs.value ? '/api/chat-official' : '/api/chat'
    const response = await $fetch(endpoint, {
      method: 'POST',
      body: {
        message: currentInput
      }
    })


    messages.value.push({
      role: 'assistant',
      content: response.message
    })

  } catch (error) {
    console.error('Error sending message:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error processing your request.'
    })
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
}

.message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
}

.user {
  background-color: #e3f2fd;
  margin-left: 20%;
}

.assistant {
  background-color: #f5f5f5;
  margin-right: 20%;
}

/* Add styles for markdown content */
.markdown-content {
  line-height: 1.5;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
}

.markdown-content :deep(code) {
  background-color: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-content :deep(pre) {
  background-color: #f0f0f0;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-content :deep(a) {
  color: #2196f3;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.chat-input {
  display: flex;
  gap: 10px;
}

input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #1976d2;
}

.toggle-docs {
  margin-bottom: 10px;
}
</style>