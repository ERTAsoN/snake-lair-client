<template>
  <div class="profile">
    <div class="user-info">
      <img :src="user.avatar" alt="Аватар" v-if="user.avatar">
      <h3>{{ user.fullName }}</h3>
      <p>{{ user.email }}</p>

      <button v-if="isOwnProfile" @click="editProfile">Редактировать профиль</button>
    </div>

    <div class="posts">
      <div v-for="post in posts" :key="post.id" class="post">
        <p>{{ post.content }}</p>
        <button v-if="isOwnProfile" @click="editPost(post)">✏️</button>
        <button v-if="isOwnProfile" @click="deletePost(post)">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['id'],
  computed: {
    isOwnProfile() {
      return this.id === this.$store.state.auth.currentUser?.id;
    },
    user() {
      return this.$store.getters['users/getUserById'](this.id) || {};
    },
    posts() {
      return this.$store.state.posts.userPosts[this.id] || [];
    }
  },
  methods: {
    editProfile() {
      // Заглушка для редактирования профиля
    },
    editPost(post) {
      // Заглушка для редактирования поста
    },
    deletePost(post) {
      // Заглушка для удаления поста
    }
  }
}
</script>