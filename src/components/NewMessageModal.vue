<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Новое сообщение</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <textarea
              v-model="messageText"
              placeholder="Введите ваше сообщение..."
              required
              rows="4"
          ></textarea>
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
import api from '@/api'

export default {
  props: {
    isOpen: Boolean,
    receiverId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close', 'message-sent'],
  data() {
    return {
      messageText: '',
      loading: false,
      error: null
    }
  },
  methods: {
    close() {
      this.$emit('close')
      this.messageText = ''
      this.error = null
    },
    async handleSubmit() {
      try {
        this.loading = true
        await api.post(`/chat/send/${this.receiverId}`, {
          message: this.messageText
        })

        this.$emit('message-sent')
        this.close()
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка отправки сообщения'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 500px;
  max-width: 95%;
}

.close-btn {
  float: right;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.form-group {
  margin: 1.5rem 0;
}

textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.error-message {
  color: #e74c3c;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit {
  padding: 0.5rem 1rem;
  background: #33984b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>