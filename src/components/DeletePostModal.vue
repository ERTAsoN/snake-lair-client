<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal confirmation-modal">
      <h2>Удалить пост?</h2>
      <p>Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.</p>

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
export default {
  props: {
    isOpen: Boolean,
    post: Object
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
      this.loading = true
      try {
        const postId = this.post.id;
        const isAdmin = this.$store.getters['isAdmin'];
        const isOwnPost = this.post.user.id === this.$store.state.auth.currentUser.id;

        if (isAdmin && !isOwnPost) {
          await this.$store.dispatch('adminDeletePost', postId);
        } else {
          await this.$store.dispatch('deletePost', postId);
        }
        window.location.reload()
      } catch (error) {
        console.error('Ошибка удаления:', error)
      } finally {
        this.loading = false
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.confirmation-modal {
  text-align: center;
  max-width: 400px;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>