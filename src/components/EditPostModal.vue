<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="close">×</button>
      <h2>Редактировать пост</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Заголовок</label>
          <input v-model="form.title" type="text" required>
        </div>

        <div class="form-group">
          <label>Текст поста</label>
          <textarea v-model="form.description" required></textarea>
        </div>

        <div class="form-group">
          <label>Изображение</label>
          <input type="file" accept="image/*" @change="handleFileUpload">
          <div v-if="currentImage" class="current-image">
            <span>Текущее изображение:</span>
            <img :src="currentImage" class="preview">
          </div>
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
export default {
  props: {
    isOpen: Boolean,
    post: Object
  },
  emits: ['close', 'updated'],
  data() {
    return {
      form: {
        title: '',
        description: '',
        image: null
      },
      currentImage: null,
      loading: false,
      error: null
    }
  },
  watch: {
    post: {
      immediate: true,
      handler(newPost) {
        if (newPost) {
          this.form.title = newPost.title
          this.form.description = newPost.description
          this.currentImage = newPost.photo
        }
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
      this.resetForm()
    },
    handleFileUpload(e) {
      this.form.image = e.target.files[0]
      this.currentImage = URL.createObjectURL(e.target.files[0])
    },
    async handleSubmit() {
      this.loading = true;
      try {
        const postId = this.post.id;
        const formData = new FormData();
        formData.append('title', this.form.title);
        formData.append('description', this.form.description);
        formData.append('_method', 'PUT');

        if (this.form.image) {
          formData.append('photo', this.form.image);
        }

        // Определяем тип запроса
        const isAdmin = this.$store.getters['isAdmin'];
        const isOwnPost = this.post.user.id === this.$store.state.auth.currentUser.id;

        if (isAdmin && !isOwnPost) {
          await this.$store.dispatch('adminUpdatePost', {
            id: postId,
            data: formData
          });
        } else {
          await this.$store.dispatch('updatePost', {
            id: postId,
            data: formData
          });
        }

        this.close();
        this.$emit('updated');
      } catch (error) {
        this.error = error.message || 'Ошибка при сохранении';
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        title: '',
        description: '',
        image: null
      }
      this.currentImage = null
      this.error = null
    }
  }
}
</script>

<style scoped>
.current-image {
  margin-top: 1rem;
}

.preview {
  max-width: 200px;
  display: block;
  margin-top: 0.5rem;
  border-radius: 4px;
}
</style>