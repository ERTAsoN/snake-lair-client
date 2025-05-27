<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Изменение аватара</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Выберите изображение</label>
          <input type="file" accept="image/*" @change="handleFileUpload">
          <div v-if="previewImage" class="preview-container">
            <img :src="previewImage" class="preview-image">
          </div>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">Отмена</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Загрузка...' : 'Обновить аватар' }}
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
        avatar: null
      },
      previewImage: null,
      loading: false,
      error: null
    }
  },
  methods: {
    close() {
      this.$emit('close')
      this.resetForm()
    },
    handleFileUpload(e) {
      const file = e.target.files[0]
      this.form.avatar = file
      this.previewImage = URL.createObjectURL(file)
    },
    async handleSubmit() {
      this.loading = true
      this.error = null

      try {
        const formData = new FormData()
        formData.append('avatar', this.form.avatar)

        const response = await api.post('/profile/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.close()
        window.location.reload()
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка загрузки аватара'
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.form.avatar = null
      this.previewImage = null
    }
  }
}
</script>

<style scoped>
.preview-container {
  margin-top: 1rem;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 50%;
}
</style>