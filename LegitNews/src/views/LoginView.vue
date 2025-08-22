<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const name = ref('')
const showRegister = ref(false)  // toggle between login/register
const router = useRouter()

// 🔑 Handle Login
async function handleLogin() {
  try {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    if (!res.ok) {
      const errorData = await res.json()
      alert(errorData.error || 'Login failed')
      return
    }

    const data = await res.json()
    alert(data.message)
    router.push('/')   // go to homepage
  } catch (err) {
    console.error(err)
    alert('Something went wrong. Please try again.')
  }
}

// 📝 Handle Register
async function handleRegister() {
  try {
    const res = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        name: name.value
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      alert(errorData.error || 'Register failed')
      return
    }

    const data = await res.json()
    alert(data.message)
    showRegister.value = false // back to login after success
  } catch (err) {
    console.error(err)
    alert('Something went wrong. Please try again.')
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-header">
      Have a story to share? Upload your news and let us verify it!
    </div>

    <div class="login-body">
      <h2 v-if="!showRegister">Login</h2>
      <h2 v-else>Sign Up</h2>

      <!-- Login Form -->
      <form v-if="!showRegister" @submit.prevent="handleLogin">
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

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister">
        <div class="input-group">
          <label>Name</label>
          <input type="text" v-model="name" placeholder="Enter Name" required />
        </div>

        <div class="input-group">
          <label>Email</label>
          <input type="email" v-model="email" placeholder="Enter Email" required />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input type="password" v-model="password" placeholder="********" required />
        </div>

        <button type="submit" class="login-btn">Register</button>
      </form>

      <div class="signin-link">
        <a href="#" @click.prevent="showRegister = !showRegister">
          {{ showRegister ? "Already have an account? Login" : "Sign Up" }}
        </a>
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
