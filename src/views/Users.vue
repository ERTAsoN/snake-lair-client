<template>
  <div class="users-page">
    <h1>Все пользователи</h1>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="users-list">
      <div
          v-for="user in users"
          :key="user.id"
          class="user-card"
          @click="goToProfile(user.id)"
      >
        <div class="user-info">
          <img
              :src="user.avatar ? `${serverUrl}/${user.avatar}` : require('@/assets/default-avatar.png')"
              class="user-avatar"
          >
          <div class="user-details">
            <h3>{{ user.firstName }} {{ user.lastName }}</h3>
            <div v-if="isMutualFriend(user)" class="friend-status">
              <span>Ваш друг</span>
              <img src="@/assets/users.png" class="friend-icon">
            </div>
            <div v-else-if="isReceivedRequest(user)" class="friend-status">
              <span>Входящая заявка</span>
            </div>
          </div>
        </div>

        <div class="friend-actions" @click.stop>
          <button
              v-if="$store.getters.isAdmin"
              @click="openEditUserModal(user)"
              class="friend-btn edit-btn"
          >
            Редактировать
          </button>
          <button
              v-if="$store.getters.isAdmin"
              @click="openDeleteUserModal(user.id)"
              class="friend-btn delete-btn"
          >
            Удалить
          </button>

          <button
              v-if="!isFriend(user)"
              @click="addFriend(user.id)"
              class="friend-btn add-btn"
          >
            Добавить в друзья
          </button>

          <button
              v-else
              @click="removeFriend(user.id)"
              class="friend-btn remove-btn"
          >
            Удалить из друзей
          </button>
        </div>
      </div>
    </div>
  </div>

  <EditUserModal
      :isOpen="showEditUserModal"
      :user="selectedUser"
      @close="showEditUserModal = false"
      @updated="loadUsers"
  />
  <DeleteUserModal
      :isOpen="showDeleteUserModal"
      :userId="selectedUserId"
      @close="showDeleteUserModal = false"
      @deleted="loadUsers"
  />
</template>

<script>
import DeleteUserModal from "@/components/DeleteUserModal.vue";
import EditUserModal from "@/components/EditUserModal.vue";
import api from '@/api'
import { SERVER_URL } from "@/config";

export default {
  components:
      {
        EditUserModal,
        DeleteUserModal
      },
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      currentUserId: parseInt(localStorage.getItem('snake_lair_user_id')),
      friends: [],
      sentRequests: [],
      receivedRequests: [],
      showEditUserModal: false,
      showDeleteUserModal: false,
      selectedUser: null,
      selectedUserId: null,
      serverUrl: SERVER_URL
    }
  },
  async created() {
    await this.loadUsers()
    await this.loadFriendData()
  },
  methods: {
    async loadUsers() {
      try {
        this.loading = true
        const response = await api.get('/friends')
        this.users = response.data.users
      } catch (error) {
        this.error = 'Ошибка загрузки пользователей'
      } finally {
        this.loading = false
      }
    },

    async openEditUserModal(user) {
      try {
        // Загружаем полные данные пользователя
        const response = await api.get(`/profile/${user.id}`);
        this.selectedUser = response.data.user;
        this.showEditUserModal = true;
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    },

    openDeleteUserModal(userId) {
      this.selectedUserId = userId
      this.showDeleteUserModal = true
    },

    async loadFriendData() {
      try {
        const response = await api.get(`/profile/${this.currentUserId}`)
        this.sentRequests = response.data.user.sent_friend
        this.receivedRequests = response.data.user.received_friend
      } catch (error) {
        console.error('Ошибка загрузки данных о друзьях:', error)
      }
    },

    isFriend(user) {
      return this.sentRequests.some(req => req.friend_id === user.id);
    },

    isReceivedRequest(user) {
      return this.receivedRequests.some(req => req.user_id === user.id);
    },

    isMutualFriend(user) {
      return this.isFriend(user) && this.isReceivedRequest(user);
    },

    async addFriend(userId) {
      try {
        await api.post(`/friends/add/${userId}`)
        await this.loadFriendData()
      } catch (error) {
        alert(error.response?.data?.message || 'Ошибка добавления друга')
      }
    },

    async removeFriend(userId) {
      try {
        if (this.isFriend({id: userId})) {
          await api.delete(`/friends/del/${userId}`);
          await this.loadFriendData();
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Ошибка удаления друга');
      }
    },

    goToProfile(userId) {
      this.$router.push(`/profile/${userId}`)
    }
  }
}
</script>

<style scoped>
.users-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h3 {
  margin: 0;
  color: #333;
}

.friend-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #33984b;
  font-size: 0.9em;
  margin-top: 5px;
}

.friend-icon {
  width: 16px;
  height: 16px;
}

.friend-actions {
  z-index: 2;
}

.friend-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9em;
  transition: opacity 0.2s;
  margin-left:10px;
}

.add-btn {
  background: #33984b;
  color: white;
}

.remove-btn {
  background: #e74c3c;
  color: white;
}

.friend-btn:hover {
  opacity: 0.9;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #e74c3c;
}
</style>