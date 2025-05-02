<template>
  <div class="form-container">
    <h2 class="form-title">Регистрация</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="form.firstName" placeholder="Имя" required>
      <input v-model="form.lastName" placeholder="Фамилия" required>
      <input v-model="form.email" type="email" placeholder="Email" required>
      <input v-model="form.password" type="password" placeholder="Пароль" required>
      <input v-model="form.confirmPassword" type="password" placeholder="Подтверждение пароля" required>
      <div v-if="error" class="error">{{ error }}</div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Загрузка...' : 'Зарегистрироваться' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async handleSubmit() {
      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Пароли не совпадают!'
        return
      }

      this.loading = true
      this.error = null

      try {
        await this.$store.dispatch('register', this.form)
        this.$router.push('/feed')
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.error {
  color: red;
  margin: 10px 0;
}
</style>