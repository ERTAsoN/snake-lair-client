<template>
  <div class="app">
    <header class="header">
      <div class="header-content wrapper">
        <router-link to="/" class="logo">
          <img src="./assets/logo-full.png" alt="Лого">
          <span>Snake Lair</span>
        </router-link>
        <nav class="nav">
          <template v-if="!isAuthenticated">
            <router-link to="/login">Войти</router-link>
            <router-link to="/register">Регистрация</router-link>
          </template>
          <template v-else>
            <button @click="logout" class="logout-btn">Выйти</button>
          </template>
        </nav>
      </div>
    </header>

    <div class="layout">
      <aside v-if="isAuthenticated" class="sidebar">
        <nav class="sidebar-nav">
          <router-link to="/feed" class="nav-item">
            <img src="./assets/feed.png" alt="Лента" class="nav-icon">
            <span>Лента</span>
          </router-link>
          <router-link to="/messages" class="nav-item">
            <img src="./assets/messages.png" alt="Сообщения" class="nav-icon">
            <span>Сообщения</span>
          </router-link>
          <router-link to="/friends" class="nav-item">
            <img src="./assets/users.png" alt="Пользователи" class="nav-icon">
            <span>Друзья</span>
          </router-link>
          <router-link :to="`/profile/${currentUser.id}`" class="nav-item">
            <img src="./assets/profile.png" alt="Профиль" class="nav-icon">
            <span>Профиль</span>
          </router-link>
        </nav>
      </aside>

      <main class="main-content wrapper">
        <router-view/>
      </main>
    </div>
  </div>
</template>


<script>
export default {
  computed: {
    isAuthenticated() {
      return this.$store.state.auth.token !== null
    },
    currentUser() {
      return this.$store.state.auth.currentUser || {}
    }
  },
  methods: {
    async logout() {
      try {
        await this.$store.dispatch('logout')
        this.$router.push('/login')
      } catch (error) {
        console.error('Ошибка при выходе:', error)
      }
    }
  }
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #33984b;
  font-weight: 700;
  font-size: 1.5rem;
}

.logo img {
  height: 40px;
}

.nav {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav a {
  color: #33984b;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.nav a:hover {
  opacity: 0.8;
}

.nav a.router-link-exact-active {
  font-weight: bolder;
}

.logout-btn {
  color: #33984b;
  text-decoration: none;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  font-weight: bolder;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>

<style>
/* Глобальные стили */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

body {
  background: #efefef;
  line-height: 1.6;
}

/* Стили для форм */
.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.form-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.form-container input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.form-container input:focus {
  outline: none;
  border-color: #42b983;
}

.form-container button {
  width: 100%;
  padding: 0.8rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.form-button:hover {
  background: #3aa876;
}

/* Стили для карточек постов */
.post-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
}

.post-content img {
  width: 100%;
  border-radius: 8px;
  margin-top: 1rem;
}

.layout {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 260px;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  position: fixed;
  top: 70px; /* Высота шапки */
  bottom: 0;
  left: 0;
  z-index: 100;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 15px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  text-decoration: none;
  color: #2c3e50;
  border-radius: 8px;
  transition: background 0.2s;
}

.nav-item:hover {
  background: #f5f5f5;
}

.nav-item.router-link-exact-active {
  background: #42b98320;
  color: #33984b;
  font-weight: 500;
}

.nav-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.main-content {
  flex: 1;
  margin-left: 260px; /* Ширина сайдбара */
  padding: 30px 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: static;
    box-shadow: none;
    padding: 10px;
  }

  .main-content {
    margin-left: 0;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-item {
    padding: 8px 12px;
  }

  .nav-item span {
    display: none;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }
}
</style>