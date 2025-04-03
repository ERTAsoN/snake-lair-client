import { createStore } from 'vuex'

export default createStore({
  modules: {
    auth: {
      state: {
        currentUser: null
      },
      mutations: {
        SET_USER(state, user) {
          state.currentUser = user
        }
      },
      actions: {
        async register({ commit }, formData) {
          // Заглушка регистрации
          const user = { id: Date.now(), ...formData }
          commit('SET_USER', user)
        },
        async login({ commit }, credentials) {
          // Заглушка авторизации
          const user = { id: 1, ...credentials }
          commit('SET_USER', user)
        }
      }
    },
    users: {
      state: {
        all: []
      },
      getters: {
        getUserById: (state) => (id) => state.all.find(user => user.id === id)
      }
    }
    // Аналогично добавить другие модули
  }
})