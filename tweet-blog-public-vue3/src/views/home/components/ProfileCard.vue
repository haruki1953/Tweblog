<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Search,
  Delete,
  Finished,
  ChatLineSquare,
  Star
} from '@element-plus/icons-vue'
import {
  useLayoutStore,
  usePostStore,
  useStatesStore,
  useProfileStore
} from '@/stores'
import type { IconMenuItem, PostsGetMode } from '@/types'
import { sakiMessage } from '@/utils'

const postStore = usePostStore()
const statesStore = useStatesStore()
const layoutStore = useLayoutStore()
const profileStore = useProfileStore()

const searchVal = ref('')

const isLoading = computed(() => {
  return statesStore.isLoadingPost
})

// 处理搜索
const handleSearch = async () => {
  if (isLoading.value) {
    return
  }
  if (searchVal.value === '') {
    if (postStore.postsGetMode !== 'normal') {
      showAll()
    }
    return
  }
  scrollToTop()
  await postStore.searchGetPosts(searchVal.value)
  scrollToTop()
}

// showAll 显示全部
const showAll = async () => {
  if (isLoading.value) {
    return
  }
  scrollToTop()
  await postStore.reGetPosts()
  scrollToTop()
}

const showFavorite = () => {
  if (isLoading.value) {
    return
  }
  scrollToTop()
  postStore.favoriteGetPosts()
}

// 清空收藏夹
const clearFavorite = () => {
  postStore.favoriteDelAllPost()
  sakiMessage({
    type: 'success',
    message: '收藏夹已清空'
  })
}

onMounted(() => {
  // 当切换至首页时，保留模式
  searchVal.value = postStore.nowSearchKey ?? ''
  postsGetModeMark.value = postStore.postsGetMode
})

const shouldDisableSearchButton = computed(() => {
  if (postStore.postsGetMode === 'normal' && searchVal.value === '') {
    return true
  }
  return false
})

const postsGetModeMark = ref<PostsGetMode>('normal')

const scrollToTop = () => {
  if (layoutStore.col2IsShow2Col) {
    window.scrollTo({
      top: 0
    })
  }
}

const setModeToNormal = () => {
  if (isLoading.value) {
    return
  }
  postsGetModeMark.value = 'normal'
  showAll()
}
const setModeToSearch = () => {
  postsGetModeMark.value = 'search'
  if (
    postStore.postsGetMode !== 'normal' &&
    postStore.postsGetMode !== 'search'
  ) {
    showAll()
  }
}
const setModeToFavorite = () => {
  if (isLoading.value) {
    return
  }
  postsGetModeMark.value = 'favorite'
  showFavorite()
}

type ButtonMenuItem = Omit<IconMenuItem, 'index'> & { index: PostsGetMode }

const buttonMenu: ButtonMenuItem[] = [
  {
    index: 'normal',
    title: '全部推文',
    icon: ChatLineSquare,
    actionColor: 'success',
    onClick: setModeToNormal
  },
  {
    index: 'search',
    title: '搜索推文',
    icon: Search,
    actionColor: 'info',
    onClick: setModeToSearch
  },
  {
    index: 'favorite',
    title: '收藏夹',
    icon: Star,
    actionColor: 'warning',
    onClick: setModeToFavorite
  }
]

const newPostText = computed(() => {
  if (postStore.readNewPostCount > 10) {
    return `【新推文 10+】`
  } else if (postStore.readNewPostCount > 0) {
    return `【新推文 ${postStore.readNewPostCount}】`
  } else {
    return ''
  }
})
</script>
<template>
  <div class="profile-card">
    <div class="user">
      <div class="avatar">
        <el-avatar :size="72" :src="profileStore.avatarUrl" />
      </div>
      <div class="name">{{ profileStore.name }}</div>
    </div>
    <div class="bio-box">
      <div class="bio">
        <TextWithLink :data="profileStore.bio"></TextWithLink>
      </div>
    </div>

    <div class="shadow-box">
      <div class="blog-info" :class="{ normal: postsGetModeMark === 'normal' }">
        <div class="info-box">
          <div class="info-val">{{ profileStore.postNumber }}</div>
          <div class="info-text">推文</div>
        </div>
        <el-divider direction="vertical" />
        <div class="info-box">
          <div class="info-val">{{ profileStore.imageNumber }}</div>
          <div class="info-text">图片</div>
        </div>
      </div>
      <div class="shadow-divider"></div>
      <div class="button-menu-box">
        <IconMenuBox
          v-model:model-value="postsGetModeMark"
          :menu="buttonMenu"
          :boxSize="65"
          notBackgroundColor
          dontSetIndex
        ></IconMenuBox>
      </div>
      <div class="shadow-divider"></div>
      <div class="block-part-container">
        <Transition name="fade">
          <div
            class="block-part-box search-input-box"
            v-if="postsGetModeMark === 'search'"
            key="search-input-box"
          >
            <el-input
              v-model="searchVal"
              placeholder="搜索推文"
              clearable
              :prefix-icon="Search"
              size="large"
              @change="handleSearch"
            />
            <el-button
              type="info"
              :icon="Search"
              circle
              @click="handleSearch"
              :loading="isLoading"
              :disabled="shouldDisableSearchButton"
            />
          </div>
          <div
            class="block-part-box favorite-mode-box"
            v-else-if="postsGetModeMark === 'favorite'"
            key="favorite-mode-box"
          >
            <div class="info-lable">收藏夹</div>
            <div class="button-row">
              <el-button
                round
                type="warning"
                :icon="Delete"
                size="small"
                @click="clearFavorite"
              >
                清空收藏夹
              </el-button>
            </div>
          </div>
          <div v-else class="block-part-box normal-mode-box">
            <div class="info-lable">
              全部推文
              <span v-if="newPostText" class="blinking-2s">
                {{ newPostText }}
              </span>
            </div>
            <el-button
              round
              type="success"
              :icon="Finished"
              size="small"
              @click="postStore.readSetAllRead()"
            >
              全部已读
            </el-button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- <div class="send-button-box">
      <el-button class="profile-button" type="primary" round @click="sendPost">
        发 推
      </el-button>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
.profile-card {
  margin-top: 40px;
  .user {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    .avatar {
      margin: 0 12px;
      .el-avatar {
        background-color: transparent;
      }
    }
    .name {
      font-size: 20px;
      font-weight: bold;
    }
  }
  .bio-box {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    padding: 0 20px;
    .bio {
      max-width: 100%;
      color: var(--color-text);
      white-space: pre-wrap;
      // 解决在全英文无空格时，文字无法换行的问题
      word-wrap: break-word;
      transition: all 0.2s;
    }
  }

  .shadow-box {
    background-color: var(--color-background-soft);
    border-radius: 20px;
    transition:
      background-color 0.5s,
      box-shadow 0.5s;
    &:hover {
      box-shadow: var(--el-box-shadow-lighter);
    }
  }
  .shadow-divider {
    // height: 2px;
    // background-color: var(--color-background);
    // transition: background-color 0.5s;
    border-top: 2.4px solid var(--color-background); // divider
    transition: border 0.5s;
  }

  .blog-info {
    height: 80px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    // background-color: var(--color-background-soft);
    // transition: all 0.5s;
    // border-radius: 20px 20px 0 0;

    .info-box {
      min-width: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .info-val {
        font-size: 20px;
        font-weight: bold;
        color: var(--color-text);
        transition: all 0.2s;
      }
      .info-text {
        font-size: 12px;
        color: var(--color-text-soft);
      }
    }
    .el-divider {
      height: 40px;
      transition: all 0.5s;
      --el-border-color: var(--color-border);
    }
  }
  .button-menu-box {
    position: relative;
    // margin-top: 2px;
    padding-bottom: 5px;
    // background-color: var(--color-background-soft);
    // transition: background-color 0.5s;
    z-index: 1;
  }
  .block-part-container {
    position: relative;
    height: 40px;
    // margin-top: 2px;
  }
  .block-part-box {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 0 0 20px 20px;
    background-color: var(--color-background-soft);
    transition: all 0.5s;
  }
  .normal-mode-box,
  .favorite-mode-box,
  .delete-mode-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px 0 15px;
    .info-lable {
      font-size: 12px;
      color: var(--color-text-soft);
      font-weight: bold;
    }
    .button-row {
      .el-button {
        margin-left: 10px;
      }
    }
  }
  .search-input-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-input {
      :deep() {
        .el-input__wrapper {
          border-radius: 20px;
          background-color: var(--color-background-soft);
          transition: all 0.5s;
          box-shadow: none;
          &:hover {
            box-shadow: none;
          }
          .el-input__inner {
            color: var(--color-text);
            transition: all 0.2s;
            font-weight: bold;
            // text-align: center;
          }
        }
      }
    }
    .el-button {
      margin-right: 4px;
    }
  }
  // .small-button-bar {
  //   display: flex;
  //   align-items: center;
  //   // justify-content: center;
  //   margin: 5px 0 20px 0;
  //   .el-button {
  //     margin-left: 10px;
  //   }
  // }

  .solt-box {
    display: flex;
    justify-content: center;
  }
}

.send-button-box {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  .el-button {
    display: block;
    width: 50%;
    :deep() {
      span {
        color: var(--color-background);
        font-weight: bold;
        transition: all 0.2s;
        // letter-spacing: 6px;
      }
    }
  }
}
</style>
