<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Редактировать профиль</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Имя</label>
          <input v-model="form.firstName" type="text" required>
        </div>

        <div class="form-group">
          <label>Фамилия</label>
          <input v-model="form.lastName" type="text" required>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">Отмена</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Сохранение...' : 'Сохранить' }}
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
    isOpen: Boolean,
    user: Object
  },
  emits: ['close'],
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: ''
      },
      loading: false,
      error: null
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser) {
          this.form = {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email
          }
        }
      }
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
        const updateData = {
          firstName: this.form.firstName,
          lastName: this.form.lastName
        }

        if (this.form.email !== this.user.email) {
          updateData.email = this.form.email
        }

        const response = await api.put('/profile/editor', updateData)
        this.$store.commit('SET_USER', response.data.user)

        if (this.isOwnProfile) {
          this.$store.commit('SET_VIEWED_USER', response.data.user)
        }
        this.close()
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка сохранения'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>