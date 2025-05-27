<template>
  <div class="profile">
    <div class="profile-header">
      <div v-if="isOwnProfile" class="profile-actions">
        <button @click="showEditProfileModal = true" class="profile-action-btn">
          Редактировать профиль
        </button>
        <button @click="showChangePasswordModal = true" class="profile-action-btn">
          Сменить пароль
        </button>
        <button @click="showUploadAvatarModal = true" class="profile-action-btn">
          Изменить аватар
        </button>
      </div>
      <button
          v-else
          @click="showNewMessageModal = true"
          class="write-message-btn"
      >
        Написать сообщение
      </button>
    </div>

    <div class="profile-info" v-if="viewedUser">
      <div class="avatar-container">
        <img :src="viewedUser.avatar || require('@/assets/default-avatar.png')" class="profile-avatar">
      </div>
      <div class="user-info">
        <h2>{{ viewedUser.firstName }} {{ viewedUser.lastName }}</h2>
        <p v-if="isOwnProfile">{{ viewedUser.email }}</p>
      </div>
    </div>

    <PostsList
        :userId="viewedUser.id"
        :show-create-button="isOwnProfile"
        header-title="Посты"
    />

    <EditProfileModal
        :isOpen="showEditProfileModal"
        :user="user"
        @close="showEditProfileModal = false"
    />

    <ChangePasswordModal
        :isOpen="showChangePasswordModal"
        @close="showChangePasswordModal = false"
    />

    <UploadAvatarModal
        :isOpen="showUploadAvatarModal"
        @close="showUploadAvatarModal = false"
    />

    <NewMessageModal
        :isOpen="showNewMessageModal"
        :receiverId="viewedUser.id"
        @close="showNewMessageModal = false"
        @message-sent="handleMessageSent"
    />
  </div>
</template>

<script>
import PostsList from '@/components/PostsList.vue'
import EditProfileModal from '@/components/EditProfileModal.vue'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import UploadAvatarModal from '@/components/UploadAvatarModal.vue'
import NewMessageModal from '@/components/NewMessageModal.vue'

export default {
  components: {
    PostsList,
    EditProfileModal,
    ChangePasswordModal,
    UploadAvatarModal,
    NewMessageModal
  },
  data() {
    return {
      showEditProfileModal: false,
      showChangePasswordModal: false,
      showUploadAvatarModal: false,
      showNewMessageModal: false
    }
  },
  computed: {
    isOwnProfile() {
      return Number(this.id) === Number(this.$store.state.auth.currentUser?.id)
    },
    viewedUser() {
      return this.$store.state.auth.viewedUser || {}
    },
    user() {
      return this.$store.state.auth.currentUser || {}
    }
  },
  methods: {
    async loadProfile(userId) {
      try {
        await this.$store.dispatch('loadProfile', userId)
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error)
      }
    },
    handleMessageSent() {
      this.$router.push('/messages')
    }
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        this.loadProfile(newId)
      }
    }
  }
}
</script>

<style scoped>
.profile-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.profile-action-btn {
  padding: 0.5rem 1rem;
  background: #33984b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.profile-action-btn:hover {
  background: #2b8140;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h2 {
  margin: 0;
  color: #2c3e50;
}

.user-info p {
  color: #666;
  margin: 0.5rem 0 0;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.write-message-btn {
  padding: 0.75rem 1.5rem;
  background: #33984b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.write-message-btn:hover {
  background: #2b8140;
}
</style>