<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Редактировать комментарий</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <textarea v-model="commentText" placeholder="Текст комментария..." required></textarea>
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
import api from '@/api'

export default {
  props: {
    isOpen: Boolean,
    comment: Object
  },
  emits: ['close', 'comment-updated'],
  data() {
    return {
      commentText: this.comment?.comment || '',
      loading: false,
      error: null
    }
  },
  watch: {
    comment(newVal) {
      this.commentText = newVal?.comment || ''
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async handleSubmit() {
      try {
        this.loading = true
        const response = await api.put(`/posts/comments/edit/${this.comment.id}`, {
          comment: this.commentText
        })

        this.$store.commit('UPDATE_COMMENT', {
          postId: this.comment.post_id,
          commentId: this.comment.id,
          newText: this.commentText,
          updatedAt: new Date().toISOString()
        })

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