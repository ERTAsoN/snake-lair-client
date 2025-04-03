<template>
  <div class="messages">
    <h2>Сообщения</h2>
    <div class="chats">
      <div v-for="chat in chats" :key="chat.id" class="chat">
        {{ chat.user.name }}: {{ chat.lastMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    chats() {
      return this.$store.state.messages.chats;
    }
  }
}
</script>