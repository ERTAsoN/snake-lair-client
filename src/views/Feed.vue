<template>
  <div class="feed">
    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="posts-list">
      <div class="page-header">
        <h1>Лента</h1>
        <button class="create-post-btn" @click="showModal = true">+ Создать пост</button>
      </div>

      <div v-for="post in formattedPosts" :key="post.id" class="post-card">
        <div class="post-header">
          <router-link :to="post.user.profileLink" class="user-info">
            <img :src="post.user.avatar || require('@/assets/default-avatar.png')" class="avatar">
            <span class="user-name">{{ post.user.name }}</span>
          </router-link>
          <time class="post-date">{{ post.createdFormatted }}</time>
        </div>

        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <pre class="post-description">{{ post.description }}</pre>
          <img v-if="post.photo" :src="post.photo" class="post-photo">
        </div>

        <div class="post-footer">
          <button
              class="like-button"
              :class="{ liked: post.userLiked }"
              @click="toggleLike(post.id)"
          >
            <img :src="post.userLiked ? require('@/assets/like-red.png') : require('@/assets/like-gray.png')" class="like-image"> {{ post.likesCount }}
          </button>
          <button class="comments-button">
            <img src="@/assets/comment.png" class="comment-image"> {{ post.comments.length }}
          </button>
        </div>
      </div>
    </div>

    <CreatePostModal
        :isOpen="showModal"
        @close="showModal = false"
    />
  </div>
</template>

<script>
import CreatePostModal from '@/components/CreatePostModal.vue'

export default {
  components: {
    CreatePostModal
  },
  data() {
    return {
      showModal: false
    }
  },
  methods: {
    async toggleLike(postId) {
      try {
        await this.$store.dispatch('toggleLike', postId)
      } catch (error) {
        console.error('Ошибка при обновлении лайка:', error)
      }
    }
  },
  computed: {
    loading() {
      return this.$store.state.posts.loading
    },
    error() {
      return this.$store.state.posts.error
    },
    formattedPosts() {
      return this.$store.getters['formattedPosts']
    }
  },
  async created() {
    await this.$store.dispatch('fetchPosts')
  },
  mounted() {
    this.showModal = false
  }
}
</script>

<style scoped>
.loading, .error {
  padding: 20px;
  text-align: center;
}

.liked {
 color: #ff4444;
}

.error {
  color: #ff4444;
}

.posts-list {
  max-width: 800px;
  margin: 0 auto;
}

.post-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  font-weight: 500;
}

.post-date {
  color: #666;
  font-size: 0.9em;
}

.post-content {
  margin-bottom: 15px;
}

.post-title {
  margin: 0 0 10px 0;
  color: #333;
}

.post-description {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.post-photo {
  max-width: 100%;
  margin-top: 15px;
  border-radius: 8px;
}

.post-footer {
  display: flex;
  gap: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.like-button:hover, .comments-button:hover {
  background: #f5f5f5;
}

.like-image, .comment-image {
  height: 12px;
}

.feed {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-title {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.post-description {
  color: #666;
  line-height: 1.6;
}

.post-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
}

.like-button, .comments-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  color: #666666;
}

.like-button.liked {
  background: #ffeaea;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.create-post-btn {
  background: #27ae60;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.create-post-btn:hover {
  background: #219a52;
}
</style>