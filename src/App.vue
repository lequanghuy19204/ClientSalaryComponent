<script setup>
import TheHeader from './layouts/TheHeader.vue'
import TheSidebar from './layouts/TheSidebar.vue'
</script>

<template>
  <div class="app">
    <TheHeader />
    <TheSidebar />
    <main class="app__main">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Inter, Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #212121;
  background-color: #f1f2f1 !important;
}

.app {
  min-height: 100vh;
}

.app__main {
  padding-top: 48px; /* Height of header */
  padding-left: 220px; /* Width of sidebar */
  min-height: 100vh;
  transition: padding-left 0.25s ease;
}
</style>
