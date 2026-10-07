import { createRouter, createWebHistory } from 'vue-router'
import NavigationBar from '@/components/NavigationBar.vue'
import TopView from '@/views/TopView.vue'

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
    {
      path: '/sora1st',
      name: 'sora1st',
      props: {
        default: false,
        navbar: {
          title: '空の軌跡 the 1st'
        }
      },
      components: {
        default: () => import('@/views/SoraView.vue'),
        navbar: NavigationBar
      },
    },
    {
      path: '/sora2nd',
      name: 'sora2nd',
      props: {
        default: false,
        navbar: {
          title: '空の軌跡 the 2nd'
        }
      },
      components: {
        default: () => import('@/views/SoraView.vue'),
        navbar: NavigationBar
      },
    },
  ],
})

export default router
