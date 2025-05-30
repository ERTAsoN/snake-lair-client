import axios from 'axios'

const API_URL = process.env.VUE_APP_API_URL

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
})

// Интерцептор для добавления токена
api.interceptors.request.use(config => {
    const token = localStorage.getItem('snake_lair_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api