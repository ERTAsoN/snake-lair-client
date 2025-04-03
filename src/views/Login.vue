<template>
  <div class="login">
    <h2>Авторизация</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="password" type="password" placeholder="Пароль" required>
      <button type="submit">Войти</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    async handleLogin() {
      // Заглушка для API
      try {
        await this.$store.dispatch('auth/login', {
          email: this.email,
          password: this.password
        });
        this.$router.push('/feed');
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>