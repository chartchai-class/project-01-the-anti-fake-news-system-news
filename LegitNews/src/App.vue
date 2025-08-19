<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div id="app" style="display:flex; flex-direction:column; min-height:100vh;">
    <!-- Header -->
    <header style="background:#007bff; color:white; padding:15px; text-align:center;">
      <h1>📰 Fake News Detector</h1>
      <nav style="margin-top:10px;">
        <RouterLink to="/" style="color:white; margin:0 10px; text-decoration:none;">Home</RouterLink>
        <RouterLink to="/add-news" style="color:white; margin:0 10px; text-decoration:none;">Add News</RouterLink>
      </nav>
    </header>

    <!-- Main page content -->
    <main style="flex:1; padding:20px;">
      <router-view />
    </main>

    <!-- Footer -->
    <footer style="background:#f1f1f1; color:#555; padding:10px; text-align:center;">
      <small>© 2025 Fake News Project | Built with Vue + Pinia</small>
    </footer>
  </div>
</template>
