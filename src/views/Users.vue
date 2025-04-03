<template>
  <div class="users">
    <h2>Все пользователи</h2>
    <div v-for="user in allUsers" :key="user.id" class="user">
      <router-link :to="`/profile/${user.id}`">{{ user.fullName }}</router-link>
      <button @click="addFriend(user)">Добавить в друзья</button>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    allUsers() {
      return this.$store.state.users.all;
    }
  },
  methods: {
    addFriend(user) {
      // Заглушка для добавления в друзья
    }
  }
}
</script>