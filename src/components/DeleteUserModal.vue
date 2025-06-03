<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal confirmation-modal">
      <h2>Удалить пользователя?</h2>
      <p>Вы уверены, что хотите удалить этого пользователя? Все связанные данные будут удалены.</p>

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
    userId: Number
  },
  emits: ['close', 'deleted'],
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
        await this.$store.dispatch('deleteUser', this.userId)
        this.$emit('deleted')
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