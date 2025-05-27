<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Смена пароля</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Новый пароль</label>
          <input v-model="form.password" type="password" required>
        </div>

        <div class="form-group">
          <label>Подтверждение пароля</label>
          <input v-model="form.password_confirmation" type="password" required>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">Отмена</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Сохранение...' : 'Изменить пароль' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "@/api";

export default {
  props: {
    isOpen: Boolean
  },
  emits: ['close'],
  data() {
    return {
      form: {
        password: '',
        password_confirmation: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async handleSubmit() {
      this.loading = true
      this.error = null

      try {
        const formData = new FormData()
        formData.append('password', this.form.password)
        formData.append('confPassword', this.form.password_confirmation)

        await api.put('/profile/password', formData)
        this.close()
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка смены пароля'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>