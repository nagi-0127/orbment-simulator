import { createRouter, createWebHistory } from 'vue-router'
import NavigationBar from '@/components/NavigationBar.vue'
import TopView from '@/views/TopView.vue'

import KaiView from '@/views/KaiView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'top',
      props: {
        default: false,
        navbar: {
          title: 'Top Page'
        }
      },
      components: {
        default: TopView,
        navbar: NavigationBar
      },
    },
    {
      path: '/kai',
      name: 'kai',
      props: {
        default: false,
        navbar: {
          title: '界の軌跡 -Farewell, O Zemuiria'
        }
      },
      components: {
        default: () => import('@/views/KaiView.vue'),
        navbar: NavigationBar
      },
    },
  ],
})

export default router
