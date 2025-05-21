import { createStore } from 'vuex'
import api from '../api'

export default createStore({
  modules: {
    auth: {
      state: {
        currentUser: null,
        token: localStorage.getItem('snake_lair_token') || null
      },
      mutations: {
        SET_USER(state, user) {
          state.currentUser = user
          if (user?.id) {
            localStorage.setItem('snake_lair_user_id', user.id)
          } else {
            console.error('User object is missing id property:', user)
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

        async checkAuth({ commit, state }) {
          if (!state.token) return

          try {
            const userId = localStorage.getItem('snake_lair_user_id')
            if (!userId) throw new Error('User ID not found in storage')

            // Исправлен путь к данным в ответе
            const response = await api.get(`/profile/${userId}`)
            const userData = response.data.user

            commit('SET_USER', {
              id: userData.id,
              firstName: userData.firstName,
              avatar: userData.avatar,
              email: userData.email,
            })
          } catch (error) {
            commit('LOGOUT')
            throw error
          }
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
      },
      actions: {
        async fetchPosts({ commit }) {
          commit('SET_LOADING', true)
          try {
            const response = await api.get('/posts')
            if (response.data.status === 'success') {
              const sortedPosts = response.data.posts
                  .map(post => ({
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    photo: post.photo,
                    created: new Date(post.created),  // Конвертируем в Date
                    user: {
                      id: post.user.id,
                      name: `${post.user.firstName} ${post.user.lastName}`,
                      avatar: post.user.avatar,
                      profileLink: post.profileLink
                    },
                    likesCount: post.likes_count,
                    userLiked: post.user_liked,
                    comments: post.comments
                  }))
                  .sort((a, b) => b.created - a.created) // Сортировка по убыванию даты

              commit('SET_POSTS', sortedPosts)
            }
          } catch (error) {
            commit('SET_ERROR', error.response?.data?.message || 'Ошибка загрузки ленты')
          } finally {
            commit('SET_LOADING', false)
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
        }
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
    }
  }
})