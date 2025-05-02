import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import api from './api'

const app = createApp(App)

app.use(store)
app.use(router)

router.isReady().then(() => {
    store.dispatch('checkAuth').finally(() => {
        app.mount('#app')
    })
})