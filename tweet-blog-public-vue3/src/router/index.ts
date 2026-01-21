import { createRouter, createWebHashHistory } from 'vue-router'
import { webName } from '@/config'
import { nextTick, ref } from 'vue'
// 下边这些可能是因为vue的vscode插件导致报错，先不管了
import LayoutContainer from '@/views/layout/LayoutContainer.vue'
import HomePage from '@/views/home/HomePage.vue'
import PostPage from '@/views/post/PostPage.vue'
import PostForward from '@/views/post/PostForward.vue'
import AlbumPage from '@/views/image/AlbumPage.vue'
import AboutPage from '@/views/about/AboutPage.vue'

import { useImageStore, usePostStore, useProfileStore } from '@/stores'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: LayoutContainer,
      children: [
        {
          name: 'home',
          path: '',
          component: HomePage,
          meta: { title: `` }
        },
        {
          name: 'post',
          path: '/post/:id',
          component: PostPage,
          meta: { title: `` }
        },
        {
          name: 'post-forward',
          path: '/post-forward/:id',
          component: PostForward,
          meta: { title: `` }
        },
        {
          name: 'album',
          path: '/album',
          component: AlbumPage,
          meta: { title: `相册` }
        },
        {
          name: 'about',
          path: '/about',
          component: AboutPage,
          meta: { title: `关于` }
        }
      ]
    }
  ],
  // 路由滚动行为定制
  scrollBehavior: async (to, from, savedPosition) => {
    // console.log(to, from)
    // console.log(to.path, from.path)
    // console.log(to.matched, from.matched)

    // 点中当前路径时，不滚动
    if (to.path === from.path) {
      return
    }
    // 【250108】发现原先的无限滚动重置有缺陷，（滚动加载的项目很多的情况下）跳转至首页时还会卡顿
    // 可能是因为渲染页面抢先了，抢先在了原先的重置无限滚动之前
    // 应该在从首页跳出时，判断到达的页面是否会返回至首页，如果不是可能返回首页的页面，则立刻重置
    if (from.path === '/') {
      // 不是可能返回至首页的页面
      if (
        typeof to.name !== 'string' ||
        !['send', 'post', 'post-forward'].includes(to.name)
      ) {
        // 重置无限滚动限制
        const postStore = usePostStore()
        postStore.resetLimited()
      }
    }
    // 图片选择器中也包含无限滚动，在相册和发送页面都有，也要做处理
    if (from.path === '/album') {
      if (typeof to.name !== 'string' || !['post'].includes(to.name)) {
        const imageStore = useImageStore()
        imageStore.resetLimited()
      }
    }
    if (from.path === '/send') {
      // 没有页面会可能返回至发送页面，所以不用判断了
      const imageStore = useImageStore()
      imageStore.resetLimited()
      // 还残留有一个小问题，在发送页面跳转至相册时会卡顿，暂时没办法，以后再说吧
    }
    // 保留有位置信息时滚动到原先位置
    if (savedPosition) {
      // 延迟一点会使滚动更准确
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 10))
      return savedPosition
    }
    // 【250108 原先的无限滚动重置】
    // 跳转至首页或其他包含无限滚动的页面时，重置显示限制
    // 放在 if savedPosition 之后就是为了不让 resetLimited 打乱滚动位置
    if (to.path === '/') {
      const postStore = usePostStore()
      postStore.resetLimited()
      // 当在别的地方 setNeedReget 设置需要重新获取时，则在此时重新获取
      // 如在 导入任务完成时 将会 setNeedReget
      // 至于为什么不在首页 onMounted 时处理，是为了不打乱首页的滚动位置
      // （如在帖子页和首页切换时，重新获取就会打乱滚动位置）
      if (postStore.isNeedReget) {
        postStore.reGetPosts()
        postStore.setNeedReget(false)
      }
      return { top: 0 }
    }
    if (['/album', '/send'].includes(to.path)) {
      const imageStore = useImageStore()
      imageStore.resetLimited()
      // 这里和上面 postStore.isNeedReget 同理
      if (imageStore.isNeedReget) {
        imageStore.reGetImages()
        imageStore.setNeedReget(false)
      }
      return { top: 0 }
    }
    // 在控制页 /control 之间切换时，延迟0.3秒回到顶部，以此优化动画
    if (
      from.matched.some((record) => record.path === '/control') &&
      to.matched.some((record) => record.path === '/control')
    ) {
      // console.log('在控制页 /control 之间切换')
      await new Promise((resolve) => setTimeout(resolve, 300))
      return { top: 0 }
    }
    // 默认回到顶部
    return { top: 0 }
  }
})

// 路由加载标识（本项目不是异步导入，应该用处不大）
export const isLoading = ref(false)

// 路由访问拦截
router.beforeEach((to) => {
  // 路由加载标识
  isLoading.value = true

  const profileStore = useProfileStore()
  const title = profileStore.name || webName

  // 根据路由设置页面标题
  if (to.meta.title) {
    document.title = (to.meta.title as string) + ' | ' + title
  } else {
    document.title = title
  }

  // 路由不存在，拦截到首页
  if (router.resolve(to.path).matched.length === 0) {
    return '/'
  }
})

router.afterEach(() => {
  isLoading.value = false
})

export default router
