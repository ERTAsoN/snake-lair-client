<template>
  <div class="messages-page">

    <div v-if="chats.length === 0" class="no-chats-message">
      <p>Напишите кому-нибудь, чтобы здесь появились чаты</p>
      <router-link to="/users" class="users-link">
        Перейти к пользователям
      </router-link>
    </div>

    <template v-else>
      <div class="chats-list">
        <div
            v-for="chat in sortedChats"
            :key="chat.user.id"
            class="chat-item"
            :class="{ active: selectedUser?.id === chat.user.id }"
            @click="selectChat(chat.user.id)"
        >
          <img
              :src="chat.user.avatar ? `${serverUrl}/${chat.user.avatar}` : require('@/assets/default-avatar.png')"
              class="chat-avatar"
          >
          <div class="chat-info">
            <div class="user-name">{{ chat.user.firstName }} {{ chat.user.lastName }}</div>
            <div class="last-message">
              <span v-if="chat.last_message.is_me">Вы: </span>
              {{ chat.last_message.text }}
            </div>
          </div>
          <div class="message-time">
            {{ formatTime(chat.last_message.time) }}
          </div>
        </div>
      </div>

      <div v-if="selectedUser" class="chat-window">
        <div class="chat-header">
          <img
              :src="selectedUser.avatar ? `${serverUrl}/${selectedUser.avatar}` : require('@/assets/default-avatar.png')"
              class="chat-avatar"
          >
          <div class="header-info">
            <h3>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h3>
          </div>
        </div>

        <div class="messages-container">
          <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="{ 'my-message': message.sender_id === currentUserId }"
          >
            <div class="message-content">
              <div class="message-text">{{ message.message }}</div>
              <div class="message-time">{{ formatTime(message.created_at) }}</div>
            </div>
          </div>
        </div>

        <div class="message-input">
          <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="Написать сообщение..."
          >
          <button @click="sendMessage" class="send-button">
            <img src="@/assets/send-icon.png" class="send-icon">
          </button>
        </div>
      </div>

      <div v-else class="empty-chat">
        Выберите чат для начала переписки
      </div>
    </template>
  </div>
</template>

<script>
import api from '@/api'
import { SERVER_URL } from "@/config";

export default {
  data() {
    return {
      chats: [],
      messages: [],
      selectedUser: null,
      newMessage: '',
      loading: false,
      currentUserId: Number(localStorage.getItem('snake_lair_user_id')),
      serverUrl: SERVER_URL
    }
  },
  computed: {
    sortedChats() {
      return [...this.chats].sort((a, b) =>
          new Date(b.last_message.time) - new Date(a.last_message.time)
      )
    }
  },
  async mounted() {
    await this.loadChats()
    if (this.chats.length > 0) {
      this.selectChat(this.chats[0].user.id)
    }
  },
  methods: {
    async loadChats() {
      try {
        const response = await api.get('/chat')
        this.chats = response.data.chats
      } catch (error) {
        console.error('Ошибка загрузки чатов:', error)
      }
    },

    async selectChat(userId) {
      this.selectedUser = this.chats.find(c => c.user.id === userId).user
      await this.loadMessages(userId)
    },

    async loadMessages(userId) {
      try {
        this.loading = true
        const response = await api.get(`/chat/messages/${userId}`)
        this.messages = response.data.messages
      } catch (error) {
        console.error('Ошибка загрузки сообщений:', error)
      } finally {
        this.loading = false
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return

      try {
        const response = await api.post(`/chat/send/${this.selectedUser.id}`, {
          message: this.newMessage
        })

        this.messages.push(response.data.chat)
        await this.loadChats() // Обновляем список чатов
        this.newMessage = ''
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error)
      }
    },

    formatTime(timeString) {
      const date = new Date(timeString)
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.messages-page {
  display: flex;
  height: calc(100vh - 120px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.no-chats-message {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.no-chats-message p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.users-link {
  background: #33984b;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.2s;
}

.users-link:hover {
  background: #2b8140;
}

.chats-list {
  width: 350px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 0;
}

.chat-item:hover {
  background: #f5f5f5;
}

.chat-item.active {
  background: #e3f2fd;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  color: #666;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  color: #999;
  font-size: 0.8em;
  margin-left: 8px;
  flex-shrink: 0;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 20px;
  text-align: center;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  z-index: 1;
}

.messages-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  margin-bottom: 0;
}

.message.my-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 65%;
  min-width: 120px;
  padding: 10px 14px;
  border-radius: 15px;
  position: relative;
  word-break: break-word;
  box-sizing: border-box;
}

.message.my-message .message-content {
  background: #dcf8c6;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message:not(.my-message) .message-content {
  background: #ffffff;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-time {
  font-size: 0.75em;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.message-input {
  display: flex;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.message-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin-right: 8px;
  font-size: 14px;
}

.message-input input:focus {
  outline: none;
  border-color: #33984b;
}

.send-icon {
  width: 24px;
  height: 24px;
}

.send-button {
  background: none;
  border: none;
  cursor: pointer;
}

/* Стили для скроллбара */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #dddddd;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #cccccc;
}

@media (max-width: 768px) {
  .chats-list {
    width: 100%;
  }

  .message-content {
    max-width: 85%;
  }

  .chat-window {
    display: none;
  }

  .chat-item.active + .chat-window {
    display: flex;
    width: 100%;
  }
}
</style>