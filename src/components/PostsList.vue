<template>
  <div class="posts-list">
    <div v-if="showHeader" class="page-header">
      <h1>{{ headerTitle }}</h1>
      <button
          v-if="showCreateButton"
          class="create-post-btn"
          @click="showCreateModal = true"
      >
        + Создать пост
      </button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <template v-else>
      <div v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-header">
          <router-link :to="post.user.profileLink" class="user-info">
            <img
                :src="post.user.avatar
            ? `${serverUrl}/${post.user.avatar}`
            : require('@/assets/default-avatar.png')"
                class="avatar"
            >
            <span class="user-name">{{ post.user.firstName }} {{ post.user.lastName }}</span>
          </router-link>
          <div>
            <div v-if="isPostOwner(post)" class="post-actions">
              <button @click="openEditModal(post)" class="edit-btn">
                <img class="post-action-img" src="@/assets/edit-icon.png" alt="Редактировать" />
              </button>
              <button @click="openDeleteModal(post.id)" class="delete-btn">
                <img class="post-action-img" src="@/assets/delete-icon.png" alt="Удалить" />
              </button>
            </div>
            <time class="post-date">{{ post.createdFormatted }}</time>
          </div>
        </div>

        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <pre class="post-description">{{ post.description }}</pre>
          <div class="post-photo-wrapper">
            <img v-if="post.photo" :src="post.photo" class="post-photo">
          </div>
        </div>

        <div class="post-footer">
          <button
              class="like-button"
              :class="{ liked: post.userLiked }"
              @click="toggleLike(post.id)"
          >
            <img :src="post.userLiked ? require('@/assets/like-red.png') : require('@/assets/like-gray.png')"
                 class="like-image" alt="Лайк"> {{ post.likesCount }}
          </button>
          <button class="comments-button" @click="openCommentModal(post.id)">
            <img src="@/assets/comment.png" class="comment-image" alt="Комментировать"> {{ post.comments.length }}
          </button>
        </div>

        <div class="comments-section">
          <button
              v-if="post.comments.length > 1"
              @click="toggleComments(post.id)"
              class="toggle-comments-btn">
            {{ isCommentsExpanded(post.id) ? 'Свернуть' : `Ещё ${post.comments.length - 1} комментариев` }}
          </button>
          <div class="comments-list">
            <div v-for="comment in getVisibleComments(post)" :key="comment.id" class="comment">
              <div class="comment-content">
                <div class="comment-header">
                  <div>
                    <img
                        :src="comment.user.avatar ?? require('@/assets/default-avatar.png')"
                        class="comment-avatar"
                    >
                    <div class="comment-author">{{ comment.user.firstName }} {{ comment.user.lastName }}</div>
                  </div>
                  <div v-if="isCommentOwner(comment)" class="comment-actions">
                    <button @click="openEditCommentModal(comment)" class="edit-btn">
                      <img class="comment-action-img" src="@/assets/edit-icon.png" alt="Редактировать" />
                    </button>
                    <button @click="openDeleteCommentModal(post.id, comment.id)" class="delete-btn">
                      <img class="comment-action-img" src="@/assets/delete-icon.png" alt="Удалить" />
                    </button>
                  </div>
                </div>
                <div class="comment-text">{{ comment.comment }}</div>
                <div class="comment-date">{{ comment.createdFormatted }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <AddCommentModal
        :isOpen="showCommentModal"
        :postId="selectedPostId"
        @close="showCommentModal = false"
        @comment-added="handleCommentAdded"
    />

    <EditCommentModal
        :isOpen="showEditCommentModal"
        :comment="selectedComment"
        @close="showEditCommentModal = false"
        @comment-updated="handleCommentUpdated"
    />

    <DeleteCommentModal
        :isOpen="showDeleteCommentModal"
        :commentId="selectedCommentId"
        :postId="selectedPostId"
        @close="showDeleteCommentModal = false"
    />

    <CreatePostModal
        :isOpen="showCreateModal"
        @close="showCreateModal = false"
    />

    <EditPostModal
        :isOpen="showEditModal"
        :post="selectedPost"
        @close="showEditModal = false"
    />

    <DeletePostModal
        :isOpen="showDeleteModal"
        :postId="selectedPostId"
        @close="showDeleteModal = false"
    />
  </div>
</template>

<script>
import AddCommentModal from '@/components/AddCommentModal.vue'
import EditCommentModal from '@/components/EditCommentModal.vue'
import DeleteCommentModal from '@/components/DeleteCommentModal.vue'
import CreatePostModal from '@/components/CreatePostModal.vue'
import EditPostModal from '@/components/EditPostModal.vue'
import DeletePostModal from '@/components/DeletePostModal.vue'
import { SERVER_URL } from '@/config'


export default {
  components: {
    AddCommentModal,
    EditCommentModal,
    DeleteCommentModal,
    CreatePostModal,
    EditPostModal,
    DeletePostModal
  },
  props: {
    userId: {
      type: Number,
      default: null
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showCreateButton: {
      type: Boolean,
      default: true
    },
    headerTitle: {
      type: String,
      default: 'Лента'
    }
  },
  data() {
    return {
      showCommentModal: false,
      showEditCommentModal: false,
      showDeleteCommentModal: false,
      selectedComment: null,
      selectedCommentId: null,
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedPost: null,
      selectedPostId: null,
      expandedComments: {},
      serverUrl: SERVER_URL
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
    },
    filteredPosts() {
      if (!this.userId) return this.formattedPosts
      return this.formattedPosts.filter(post => post.user.id === this.userId)
    },
    isPostOwner() {
      return (post) => {
        return this.$store.state.auth.currentUser?.id === post.user.id
      }
    }
  },
  methods: {
    async toggleLike(postId) {
      try {
        await this.$store.dispatch('toggleLike', postId)
      } catch (error) {
        console.error('Ошибка при обновлении лайка:', error)
      }
    },
    openEditModal(post) {
      this.selectedPost = post
      this.showEditModal = true
    },
    openDeleteModal(postId) {
      this.selectedPostId = postId
      this.showDeleteModal = true
    },
    openCommentModal(postId) {
      this.selectedPostId = postId
      this.showCommentModal = true
    },
    getVisibleComments(post) {
      return this.isCommentsExpanded(post.id)
          ? post.comments
          : post.comments.slice(0, 1)
    },
    isCommentsExpanded(postId) {
      return !!this.expandedComments[postId]
    },
    toggleComments(postId) {
      this.expandedComments = {
        ...this.expandedComments,
        [postId]: !this.expandedComments[postId]
      }
    },
    isCommentOwner(comment) {
      return this.$store.state.auth.currentUser?.id === comment.user.id
    },
    openEditCommentModal(comment) {
      this.selectedComment = comment
      this.showEditCommentModal = true
    },
    openDeleteCommentModal(postId, commentId) {
      this.selectedPostId = postId
      this.selectedCommentId = commentId
      this.showDeleteCommentModal = true
    },
    async handleCommentAdded() {
      await this.$store.dispatch('fetchPostComments', this.post.id)
    },
    handleCommentUpdated() {
      // При необходимости можно обновить данные
    }
  },
  async created() {
    await this.$store.dispatch('fetchPosts')
  },
  watch: {
    userId(newVal) {
      this.$store.dispatch('fetchPosts', newVal)
    }
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
  max-height: 500px;
  margin-top: 15px;
  border-radius: 8px;
}

.post-photo-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
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
  background: #33984b;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.create-post-btn:hover {
  background: #2b8140;
}

.post-actions {
  display: inline;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
}

.edit-btn:hover {
  color: #3498db;
}

.delete-btn {
  color: #e74c3c;
  margin-right: 0.5rem;
}

.delete-btn:hover {
  color: #c0392b;
}

.post-action-img {
  width: 15px;
}

.comments-section {
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.comment {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.comment-author {
  font-weight: 500;
  color: #333;
}

.comment-text {
  margin: 0.25rem 0;
  color: #666;
}

.comment-date {
  font-size: 0.8rem;
  color: #999;
}

.toggle-comments-btn {
  background: none;
  border: none;
  color: #33984b;
  cursor: pointer;
  padding: 0.5rem 0;
}

.comment-avatar {
  width: 20px;
  height: 20px;
  border-radius: 100%;
}

.comment-author {
  display: inline;
  margin-left: 10px;
  vertical-align: text-bottom;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-action-img {
  width: 12px;
  height: 12px;
}

.comment-content {
  flex-grow: 1;
  margin-left: 8px;
}
</style>