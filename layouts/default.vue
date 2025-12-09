<template>
  <div class="bg-background min-h-screen flex flex-col min-h-screen">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
// ...existing code...
</script>
