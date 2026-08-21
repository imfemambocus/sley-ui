import { createApp } from 'vue'
import App from './App.vue'
import './styles/lab.css'

const container = document.getElementById('root')
if (!container) throw new Error('missing #root')

createApp(App).mount(container)
