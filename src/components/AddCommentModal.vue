<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Добавить комментарий</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <textarea v-model="commentText" placeholder="Ваш комментарий..." required></textarea>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="close">Отмена</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Отправка...' : 'Отправить' }}
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
    postId: Number
  },
  emits: ['close', 'comment-added'],
  data() {
    return {
      commentText: '',
      loading: false,
      error: null
    }
  },
  methods: {
    close() {
      this.$emit('close')
      this.commentText = ''
    },
    async handleSubmit() {
      try {
        const response = await api.post(`/posts/comments/${this.postId}`, {
          comment: this.commentText
        });

        this.$store.commit('ADD_NEW_COMMENT', {
          postId: this.postId,
          comment: {
            ...response.data.comment,
            user: this.$store.state.auth.currentUser,
            created_at: new Date().toISOString() // Сервер должен возвращать created_at
          }
        });

        this.close();
      } catch (error) {
        // Обработка ошибки
      }
    }
  }
}
</script>