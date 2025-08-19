<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

function handleLogin() {
  // For now, just redirect to home page
  router.push('/home')
}
</script>

<template>
  <div class="login-container">
    <div class="login-header">
      Have a story to share? Upload your news and let us verify it!
    </div>

    <div class="login-body">
      <h2>Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label>Email</label>
          <input type="email" v-model="email" placeholder="Enter Email" required />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input type="password" v-model="password" placeholder="********" required />
        </div>

        <button type="submit" class="login-btn">Login</button>
      </form>

      <div class="signin-link">
        <a href="#">Sign In</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

.login-container {
  width: 850px;
  height: 500px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.login-header {
  background: #000;
  color: #fff;
  text-align: center;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
}

.login-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-body h2 {
  margin-bottom: 20px;
  font-size: 28px;
}

.input-group {
  margin-bottom: 15px;
  width: 750px;
}

.input-group label {
  display: block;
  text-align: left;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-group input {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: #eee;
  font-size: 16px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-btn {
  width: 260px;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #000;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}

.login-btn:hover {
  background: #333;
}

.signin-link {
  margin-top: 15px;
}

.signin-link a {
  text-decoration: none;
  color: #000;
  font-weight: bold;
}

.signin-link a:hover {
  text-decoration: underline;
}
</style>
