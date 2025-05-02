<script>
export default {
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  computed: {
    isOwnProfile() {
      return this.id === this.$store.state.auth.currentUser?.id
    },
    user() {
      return this.$store.getters['users/getUserById'](this.id) || {}
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        this.loadProfile(newId)
      }
    }
  },
  methods: {
    async loadProfile(userId) {
      try {
        const response = await api.get(`/profile/${userId}`)
        this.$store.commit('users/SET_USER', response.data)
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error)
      }
    }
  }
}
</script>