<script setup lang="ts">
const method = ref('POST')
const endpoint = ref('/tasks')
const params = ref('{\n  "content": "Test task"\n}')
const response = ref('')
const error = ref('')

const testApi = async () => {
  try {
    error.value = ''
    response.value = 'Loading...'
    
    const result = await $fetch('/api/todoist-proxy', {
      method: 'POST',
      body: {
        method: method.value,
        endpoint: endpoint.value,
        params: JSON.parse(params.value)
      }
    })

    response.value = JSON.stringify(result, null, 2)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    console.error('API Test Error:', e)
  }
}
</script>

<template>
  <div class="api-tester">
    <h3>API Tester</h3>
    <div class="form">
      <select v-model="method">
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>DELETE</option>
      </select>
      
      <input v-model="endpoint" placeholder="/tasks" />
      
      <textarea 
        v-model="params" 
        placeholder="JSON parameters"
        rows="4"
      ></textarea>
      
      <button @click="testApi">Test Request</button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <pre v-if="response" class="response">{{ response }}</pre>
  </div>
</template>

<style scoped>
.api-tester {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 1rem 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

select, input, textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}

.error {
  color: red;
  margin-top: 1rem;
}

.response {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 