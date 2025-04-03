<template>
  <div class="friends">
    <h2>Друзья</h2>
    <div v-for="friend in friends" :key="friend.id" class="friend">
      <router-link :to="`/profile/${friend.id}`">{{ friend.fullName }}</router-link>
      <button @click="removeFriend(friend)">Удалить</button>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    friends() {
      return this.$store.state.friends.list;
    }
  },
  methods: {
    removeFriend(friend) {
      // Заглушка для удаления друга
    }
  }
}
</script>