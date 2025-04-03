<template>
  <div class="feed">
    <h2>Лента</h2>
    <div v-for="post in posts" :key="post.id" class="post">
      {{ post.content }}
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    posts() {
      return this.$store.state.posts.feedPosts;
    }
  }
}
</script>