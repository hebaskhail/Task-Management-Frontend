<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <h2>Welcome Back!</h2>
        <p>Login to manage your account</p>
      </div>

      <form @submit.prevent="login" class="login-form">
        <!-- Email Field -->
        <div class="input-group">
          <label for="email">
            <i class="fas fa-envelope"></i>
            Email Address
          </label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            :class="{ 'input-error': emailError }"
            placeholder="Enter your email address"
          />
          <span v-if="emailError && email.length > 0" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            Invalid email address
          </span>
        </div>

        <!-- Password Field -->
        <div class="input-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Password
          </label>
          <div class="password-input">
            <input
              :type="passwordFieldType"
              id="password"
              v-model="password"
              required
              minlength="6"
              :class="{ 'input-error': passwordError }"
              placeholder="Enter your password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <span
            v-if="passwordError && password.length > 0"
            class="error-message"
          >
            <i class="fas fa-exclamation-circle"></i>
            Password must be 6 characters or more
          </span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isFormInvalid || isLoading"
          class="login-button"
          :class="{ loading: isLoading }"
        >
          <span v-if="!isLoading">
            <i class="fas fa-sign-in-alt"></i>
            Login
          </span>
          <span v-else class="loading-spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </span>
        </button>

        <!-- Register Link -->
        <div class="register-link">
          Don't have an account?
          <router-link to="/register">Create one now</router-link>
        </div>
      </form>
    </div>

    <!-- Login Messages -->
    <transition name="fade">
      <div v-if="loginSuccess" class="notification success">
        <i class="fas fa-check-circle"></i>
        Login successful!
      </div>
    </transition>
    <transition name="fade">
      <div v-if="loginError" class="notification error">
        <i class="fas fa-exclamation-circle"></i>
        {{ loginError }}
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      rememberMe: false,
      showPassword: false,
      isLoading: false,
      loginError: null,
      loginSuccess: false,
    };
  },
  computed: {
    emailError() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return this.email && !emailPattern.test(this.email);
    },
    passwordError() {
      return this.password && this.password.length < 6;
    },
    isFormInvalid() {
      return (
        !this.email || !this.password || this.emailError || this.passwordError
      );
    },
    passwordFieldType() {
      return this.showPassword ? "text" : "password";
    },
  },
  methods: {
    async login() {
      if (!this.isFormInvalid) {
        this.isLoading = true;
        this.loginError = null;

        try {
          const response = await axios.post(
            "https://task-management-system-8ynn.onrender.com/api/auth/login",
            {
              email: this.email,
              password: this.password,
            }
          );
          console.log("response.data", response.data);

          const { accessToken , user } = response.data.data;

          localStorage.setItem("token", accessToken);
          localStorage.setItem("user", JSON.stringify(user));

          if (this.$store) {
            this.$store.commit("setUser", {
              user,
              token: accessToken,
            });
          }

          this.$router.push("/tasks");
        } catch (error) {
          console.log("error From Login", error);
          this.loginError = this.handleApiError(error);
        } finally {
          this.isLoading = false;
        }
      }
    },

    handleApiError(error) {
      if (error.response) {
        return error.response.data.message || "حدث خطأ في الخادم";
      }
      return error.message || "حدث خطأ غير متوقع";
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

:root {
  --primary-color: #4361ee;
  --primary-light: #4cc9f0;
  --secondary-color: #3a0ca3;
  --error-color: #f72585;
  --success-color: #4cc9f0;
  --text-color: #2b2d42;
  --light-gray: #f8f9fa;
  --medium-gray: #e9ecef;
  --dark-gray: #6c757d;
  --white: #ffffff;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Tajawal", sans-serif;
  background-color: var(--light-gray);
}

.login-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    var(--primary-light),
    var(--primary-color)
  );
  position: relative;
  flex-direction: column;
}

.login-container {
  width: 100%;
  max-width: 450px;
  background-color: var(--white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--box-shadow);
  animation: fadeInUp 0.6s ease;
}

.login-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  background: linear-gradient(
    to right,
    var(--primary-color),
    var(--secondary-color)
  );
  color: var(--white);
}

.login-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.login-header p {
  font-size: 0.9rem;
  opacity: 0.9;
}

.login-form {
  padding: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
  flex-direction: column;
  position: relative;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--medium-gray);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
  background-color: var(--light-gray);
}

.input-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  background-color: var(--white);
}

.input-group input::placeholder {
  color: var(--dark-gray);
  opacity: 0.7;
}

.input-error {
  border-color: var(--error-color) !important;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--dark-gray);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: var(--transition);
}

.toggle-password:hover {
  background-color: var(--medium-gray);
  color: var(--text-color);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.checkmark {
  width: 14px;
  height: 14px;
  border: 2px solid var(--text-color);
  border-radius: 3px;
  margin-left: 8px;
}

.forgot-password {
  font-size: 0.9rem;
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition);
}

.forgot-password:hover {
  color: var(--secondary-color);
}

.login-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.login-button:hover {
  background-color: var(--secondary-color);
}

.login-button:disabled {
  background-color: var(--medium-gray);
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.fa-spin {
  animation: fa-spin 2s infinite linear;
}

.social-login {
  margin-top: 2rem;
  text-align: center;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.social-btn {
  background-color: var(--white);
  border: 1px solid var(--medium-gray);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
}

.social-btn:hover {
  background-color: var(--primary-light);
}

.register-link {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
}

.register-link a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
}

.register-link a:hover {
  color: var(--secondary-color);
}

.notification {
  padding: 1rem;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.notification.success {
  border-radius: 8px;
  background-color: var(--success-color);
  color: var(--white);
}

.notification.error {
  border-radius: 8px;
  background-color: var(--error-color);
  color: var(--white);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");
</style>
