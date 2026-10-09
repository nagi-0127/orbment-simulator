import { createRouter, createWebHistory } from 'vue-router'
import NavigationBar from '@/components/NavigationBar.vue'
import TopView from '@/views/TopView.vue'

// 1st
import Quartz1st from '@/assets/data/sora1st/quartz.json'
import Arts1st from '@/assets/data/sora1st/arts.json'
import Characters1st from '@/assets/data/sora1st/characters.json'
// 2nd
import Quartz2nd from '@/assets/data/sora2nd/quartz.json'
import Arts2nd from '@/assets/data/sora2nd/arts.json'
import Characters2nd from '@/assets/data/sora2nd/characters.json'

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
        default: () => {
          return {
            quartz: Quartz1st,
            arts: Arts1st,
            characters: Characters1st,
          }
        },
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
        default: () => {
          return {
            quartz: Quartz2nd,
            arts: Arts2nd,
            characters: Characters2nd,
          }
        },
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
