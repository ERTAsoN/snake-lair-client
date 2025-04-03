<template>
  <div class="registration">
    <h2>Регистрация</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="form.firstName" placeholder="Имя" required>
      <input v-model="form.lastName" placeholder="Фамилия" required>
      <input v-model="form.email" type="email" placeholder="Email" required>
      <input v-model="form.password" type="password" placeholder="Пароль" required>
      <input v-model="form.confirmPassword" type="password" placeholder="Подтверждение пароля" required>
      <input type="file" @change="handleAvatarUpload">
      <button type="submit">Зарегистрироваться</button>
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
        avatar: null
      }
    }
  },
  methods: {
    handleAvatarUpload(e) {
      this.form.avatar = e.target.files[0];
    },
    async handleSubmit() {
      if (this.form.password !== this.form.confirmPassword) {
        alert('Пароли не совпадают!');
        return;
      }

      // Заглушка для API
      try {
        await this.$store.dispatch('auth/register', this.form);
        this.$router.push('/login');
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>