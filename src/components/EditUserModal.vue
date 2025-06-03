<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Редактировать пользователя</h2>

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

        <div class="form-group">
          <label>Роль</label>
          <select v-model="form.role">
            <option value="0">Пользователь</option>
            <option value="1">Администратор</option>
          </select>
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
import {mapActions} from "vuex";

export default {
  props: {
    isOpen: Boolean,
    user: Object
  },
  emits: ['close', 'updated'],
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        role: '0'
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
          this.form = { ...newUser }
        }
      }
    }
  },
  methods: {
    ...mapActions('admin', ['updateUser']),
    close() {
      this.$emit('close')
    },
    async handleSubmit() {
      this.loading = true;
      try {
        await this.updateUser({
          userId: this.user.id,
          data: this.form
        });
        this.$emit('updated');
        this.close();
      } catch (error) {
        this.error = error || 'Ошибка сохранения';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>