<script setup>
import { RouterLink } from 'vue-router'
import 'bootstrap-icons/font/bootstrap-icons.css'

</script>

<template>
  <div id="app" style="display:flex; flex-direction:column; min-height:100vh;">
    
    <!-- Header -->
    <header class="header">
      <div class="menu">☰</div>
      <div class="logo">
        <img src="./assets/Legit News Logo.png" alt="Legit News Logo" style="height:60px; width:auto;">
      </div>
      <RouterLink to="/login">
        <button type="button" class="login-btn">Login</button>
      </RouterLink>
    </header>

    <!-- Navigation -->
    <div class="navbar-container">
      <nav>
        <RouterLink to="/">All News</RouterLink>
        <RouterLink to="/local">Local</RouterLink>
        <RouterLink to="/global">Global</RouterLink>
        <RouterLink to="/business">Business</RouterLink>
        <RouterLink to="/sport">Sport</RouterLink>
        <RouterLink to="/entertainment">Entertainment</RouterLink>
      </nav>
      <div class="search-bar">
        <input type="text" placeholder="Search News">
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <RouterLink to="/add-news">
        <button class="add-news">Add News</button>
      </RouterLink>

      <div class="filters">
        <div>
          <label for="select">Select</label>
          <input type="text" id="select" placeholder="-">
        </div>

        <select class="sort">
          <option>Sort By</option>
          <option>All News</option>
          <option>Verified News</option>
          <option>Fake News</option>
        </select>
      </div>
    </div>

    <!-- Main page content -->
    <main style="flex:1; padding:20px;">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <!-- Left section: Social icons -->
      <div class="footer-section">
        <p>Follow us on:</p>
        <div class="social-icons">
          <a href="#"><i class="bi bi-facebook"></i></a>
          <a href="#"><i class="bi bi-instagram"></i></a>
          <a href="#"><i class="bi bi-youtube"></i></a>
          <a href="#"><i class="bi bi-tiktok"></i></a>
        </div>
      </div>

      <!-- Center section: Email + Links -->
      <div class="footer-section center">
        <p>Contact us: legitnews25@gmail.com</p>
        <RouterLink to="/terms">Term of use</RouterLink> | 
        <RouterLink to="/about">About us</RouterLink>
      </div>

      <!-- Right section: Logo -->
      <div class="footer-section right">
        <img src="./assets/Legit News Logo.png" alt="Legit news" style="height:60px; width:auto;" class="footer-logo">
      </div>
    </footer>
  </div>
</template>

<style>
/* keep your styles inside here instead of inline */

header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 50px;
  border-bottom: 1px solid #ddd;
}

.navbar-container {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 10px 50px;
}

nav {
  display: flex;
  gap: 50px;
}

nav a {
  text-decoration: none;
  color: black;
  font-weight: 500;
}

.search-bar input {
  padding: 5px;
  width: 380px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 50px;
  border-bottom: 1px solid #ddd;
  background: white;
}

.add-news {
  background: black;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
}

.filters {
  display: flex;
  align-items: center;
  gap: 50px;
}

.filters input {
  border: 1px solid #aaa;
  border-radius: 3px;
  text-align: center;
}

#select{
  width: 50px;
  height: 30px;
}

.sort{
  width: 120px;
  height: 30px;
}

.login-btn {
  width: 120px;
  height: 40px;
  font-size: 16px;
  background: black;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 5px;
}

/* Footer styles */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 50px;
  background: #fff;
  border-top: 1px solid #ddd;
  flex-wrap: wrap;
}

.footer-section {
  flex: 1;
}

.footer-section p {
  margin: 0;
}

.social-icons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  margin-right: 10px;
}

.social-icons a i {
  font-size: 30px;
  color: #555;
}

.social-icons a i:hover {
  color: #2196F3;
} 

.footer-section.center {
  text-align: center;
}

.footer-section.right {
  text-align: right;
}

.footer a {
  margin: 0 8px;
  text-decoration: none;
  color: #000;
  font-size: 14px;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
