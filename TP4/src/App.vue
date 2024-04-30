<template>
  <div id="app">
    <RouterLink to="/Home.vue">Home</RouterLink>
    <RouterLink to="/filter">Filter</RouterLink>
    <RouterLink to="/add-job">Add Job</RouterLink>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
body {
  font-family: Arial, sans-serif;
}
</style>
