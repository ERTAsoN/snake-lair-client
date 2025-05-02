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

            commit('SET_USER', response.data.data.user)
            commit('SET_TOKEN', response.data.data.token)
            return true
          } catch (error) {
            throw error.response?.data?.message || 'Ошибка регистрации'
          }
        },

        async login({ commit }, credentials) {
          try {
            const response = await api.post('/login', credentials)
            commit('SET_USER', response.data.data.user)
            commit('SET_TOKEN', response.data.data.token)
            return true
          } catch (error) {
            throw error.response?.data?.message || 'Ошибка авторизации'
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
            if (!userId) throw new Error('User ID not found')

            const response = await api.get(`/profile/${userId}`)

            commit('SET_USER', {
              id: response.data.id,
              firstName: response.data.firstName,
              avatar: response.data.avatar,
              email: response.data.email,
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
        }
      },
      actions: {
        async fetchPosts({ commit }) {
          commit('SET_LOADING', true)
          try {
            const response = await api.get('/posts')
            if (response.data.status === 'success') {
              commit('SET_POSTS', response.data.posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                photo: post.photo,
                created: new Date(post.created),
                user: {
                  id: post.user.id,
                  name: `${post.user.firstName} ${post.user.lastName}`,
                  avatar: post.user.avatar,
                  profileLink: post.profileLink
                },
                likesCount: post.likes_count,
                userLiked: post.user_liked,
                comments: post.comments
              })))
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