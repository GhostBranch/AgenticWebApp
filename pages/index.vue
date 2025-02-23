<template>
  <div class="app-container">
    <header>
      <h1>Personal Assistant</h1>
    </header>
    <main>
      <div class="content">
        <ChatInterface />
        <ApiTester />
      </div>
    </main>
  </div>
</template> 

<style>
.app-container {
  min-height: 100vh;
  background-color: #f9f9f9;
}

header {
  background-color: #2196f3;
  color: white;
  padding: 1rem;
  text-align: center;
}

main {
  padding: 2rem;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
  grid-template-columns: 2fr 1fr;
}

@media (max-width: 768px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
