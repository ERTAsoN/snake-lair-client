import { createStore } from 'vuex'
import api from '../api'
import { SERVER_URL } from "@/config";

export default createStore({
  modules: {
    auth: {
      state: {
        currentUser: null,
        viewedUser: null,
        token: localStorage.getItem('snake_lair_token') || null
      },
      mutations: {
        SET_USER(state, user) {
          state.currentUser = {
            ...user,
            avatar: user.avatar ? `${SERVER_URL}/storage/${user.avatar}` : null
          }
          if (user?.id) {
            localStorage.setItem('snake_lair_user_id', user.id)
          }
        },
        SET_VIEWED_USER(state, user) {
          state.viewedUser = {
            ...user,
            avatar: user.avatar ? `${SERVER_URL}/${user.avatar}` : null
          }
        },
        SET_TOKEN(state, token) {
          state.token = token
          localStorage.setItem('snake_lair_token', token)
        },
        LOGOUT(state) {
          state.currentUser = null
          state.token = null
          localStorage.removeItem('snake_lair_token')
          localStorage.removeItem('snake_lair_user_id')
        },
        UPDATE_USER(state, payload) {
          state.currentUser = {
            ...state.currentUser,
            ...payload
          }
        },
        UPDATE_FRIEND_STATUS(state, { userId, status }) {
          const user = state.viewedUser
          if (user && user.id === userId) {
            user.friendStatus = status
          }
        }
      },
      actions: {
        async register({ commit }, formData) {
          try {
            const form = new FormData()
            form.append('firstName', formData.firstName)
            form.append('lastName', formData.lastName)
            form.append('email', formData.email)
            form.append('password', formData.password)

            const response = await api.post('/register', form)
            console.log("Response: ", response.data)
            commit('SET_USER', response.data.user)
            commit('SET_TOKEN', response.data.data.token)
            return true
          } catch (error) {
            throw error.response?.data?.message || 'Ошибка регистрации'
          }
        },

        async login({ commit }, credentials) {
          try {
            const response = await api.post('/login', credentials)
            console.log("Response: ", response.data)
            commit('SET_USER', response.data.data.user)
            commit('SET_TOKEN', response.data.data.token)
            return true
          } catch (error) {
            throw error.response?.message || 'Ошибка авторизации'
          }
        },

        async logout({ commit }) {
          await api.post('/logout')
          commit('LOGOUT')
        },

        async updateProfile({ commit }, data) {
          const response = await api.put('/profile/editor', data)
          commit('SET_USER', response.data.user)
        },

        async loadProfile({ commit }, userId) {
          try {
            const response = await api.get(`/profile/${userId}`)
            commit('SET_VIEWED_USER', response.data.user)
          } catch (error) {
            console.error('Ошибка загрузки профиля:', error)
            throw error
          }
        },

        async checkAuth({ commit, state }) {
          if (!state.token) return

          try {
            const userId = localStorage.getItem('snake_lair_user_id')
            if (!userId) throw new Error('User ID not found in storage')

            const response = await api.get(`/profile/${userId}`)
            const userData = response.data.user

            commit('SET_USER', {
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              avatar: userData.avatar,
              email: userData.email,
              role: userData.role
            })
          } catch (error) {
            commit('LOGOUT')
            throw error
          }
        },

        async updateFriendStatus({ commit }, { userId, status }) {
          commit('UPDATE_FRIEND_STATUS', { userId, status })
        }
      }
    },
    posts: {
      state: {
        feedPosts: [],
        loading: false,
        error: null
      },
      mutations: {
        SET_POSTS(state, posts) {
          state.feedPosts = posts
        },
        SET_LOADING(state, value) {
          state.loading = value
        },
        SET_ERROR(state, error) {
          state.error = error
        },
        UPDATE_LIKE(state, { postId, likesCount, userLiked }) {
          state.feedPosts = state.feedPosts.map(post =>
              post.id === postId
                  ? { ...post, likesCount, userLiked }
                  : post
          )
        },
        ADD_NEW_COMMENT(state, { postId, comment }) {
          state.feedPosts = state.feedPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [{
                  ...comment,
                  createdFormatted: new Date(comment.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }, ...post.comments]
              }
            }
            return post;
          });
        },
        UPDATE_COMMENT(state, { postId, commentId, newText, updatedAt }) {
          state.feedPosts = state.feedPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments.map(comment =>
                    comment.id === commentId
                        ? {
                          ...comment,
                          comment: newText,
                          created_at: updatedAt,
                          createdFormatted: new Date(updatedAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        }
                        : comment
                )
              }
            }
            return post
          })
        },

        DELETE_COMMENT(state, { postId, commentId }) {
          state.feedPosts = state.feedPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments.filter(comment => comment.id !== commentId)
              }
            }
            return post
          })
        }
      },
      actions: {
        async fetchPosts({ commit }) {
          commit('SET_LOADING', true);
          try {
            const response = await api.get('/posts');
            if (response.data.status === 'success') {
              const sortedPosts = response.data.posts.map(post => ({
                ...post,
                photo: post.photo ? `${SERVER_URL}/${post.photo}` : null,
                userLiked: post.user_liked,
                likesCount: post.likes_count,
                created: new Date(post.created),
                comments: post.comments.map(comment => ({
                  ...comment,
                  createdFormatted: new Date(comment.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  user: {
                    ...comment.user,
                    avatar: comment.user.avatar
                        ? `${SERVER_URL}/${comment.user.avatar}`
                        : null
                  }
                }))
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
                user: {
                  ...post.user,
                  avatar: post.user.avatar
                      ? `${post.user.avatar}`
                      : null,
                  profileLink: `/profile/${post.user.id}`
                }
              })).sort((a, b) => b.created - a.created);

              commit('SET_POSTS', sortedPosts);
            }
          } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки ленты');
          } finally {
            commit('SET_LOADING', false);
          }
        },
        async toggleLike({ commit, state }, postId) {
          const post = state.feedPosts.find(p => p.id === postId)
          if (!post) return

          // Оптимистичное обновление
          const originalLikes = post.likesCount
          const originalUserLiked = post.userLiked

          commit('UPDATE_LIKE', {
            postId,
            likesCount: post.userLiked ? post.likesCount - 1 : post.likesCount + 1,
            userLiked: !post.userLiked
          })

          try {
            await api.post(`/posts/like-toggle/${postId}`)
          } catch (error) {
            // Откат изменений при ошибке
            commit('UPDATE_LIKE', {
              postId,
              likesCount: originalLikes,
              userLiked: originalUserLiked
            })
            throw error
          }
        },
        async createPost({ commit }, formData) {
          try {
            commit('SET_LOADING', true)
            const response = await api.post('/posts/create', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })

            return response.data
          } catch (error) {
            throw error.response?.data?.message || 'Ошибка при создании поста'
          } finally {
            commit('SET_LOADING', false)
          }
        },
        async updatePost({ commit }, { id, data }) {
          try {
            commit('SET_LOADING', true)
            const response = await api.post(`/posts/${id}`, data, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            return response.data
          } catch (error) {
            throw error.response?.data?.message || 'Ошибка при обновлении поста'
          } finally {
            commit('SET_LOADING', false)
          }
        },
        async deletePost({ commit }, id) {
          try {
            commit('SET_LOADING', true)
            await api.delete(`/posts/${id}`)
          } catch (error) {
            throw error.response?.data?.message || 'Ошибка при удалении поста'
          } finally {
            commit('SET_LOADING', false)
          }
        },
      },
      getters: {
        formattedPosts: (state) => state.feedPosts.map(post => ({
          ...post,
          createdFormatted: post.created.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }))
      }
    },
    chat: {
      state: {
        chats: [],
        currentChat: null,
        messages: [],
        loading: false
      },
      mutations: {
        SET_CHATS(state, chats) {
          state.chats = chats
        },
        SET_MESSAGES(state, messages) {
          state.messages = messages
        },
        ADD_MESSAGE(state, message) {
          state.messages.push(message)
        },
        SET_LOADING(state, value) {
          state.loading = value
        }
      },
      actions: {
        async fetchChats({ commit }) {
          try {
            const response = await api.get('/chat')
            commit('SET_CHATS', response.data.chats)
          } catch (error) {
            console.error('Error fetching chats:', error)
          }
        },
        async fetchMessages({ commit }, userId) {
          commit('SET_LOADING', true)
          try {
            const response = await api.get(`/chat/messages/${userId}`)
            commit('SET_MESSAGES', response.data.messages)
          } catch (error) {
            console.error('Error fetching messages:', error)
          } finally {
            commit('SET_LOADING', false)
          }
        },
        async sendMessage({ commit }, { receiverId, message }) {
          try {
            const response = await api.post(`/chat/send/${receiverId}`, { message })
            commit('ADD_MESSAGE', response.data.chat)
            return response.data
          } catch (error) {
            console.error('Error sending message:', error)
            throw error
          }
        }
      }
    }
  }
})