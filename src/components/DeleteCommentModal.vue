<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal confirmation-modal">
      <h2>Удалить комментарий?</h2>
      <p>Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.</p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="close">Отмена</button>
        <button class="btn-danger" @click="confirmDelete" :disabled="loading">
          {{ loading ? 'Удаление...' : 'Удалить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  props: {
    isOpen: Boolean,
    commentId: Number,
    postId: Number
  },
  emits: ['close'],
  data() {
    return {
      loading: false
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    async confirmDelete() {
      try {
        this.loading = true
        await api.delete(`/posts/comments/del/${this.commentId}`)

        this.$store.commit('DELETE_COMMENT', {
          postId: this.postId,
          commentId: this.commentId
        })

        this.close()
      } catch (error) {
        console.error('Ошибка удаления:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>