<script setup lang="ts">
import {
  ChatSquare,
  ChatLineSquare,
  Connection,
  Delete,
  EditPen,
  Star,
  RefreshLeft,
  Remove,
  CollectionTag
} from '@element-plus/icons-vue'
import type { PostData, PostsGetMode } from '@/types'
import { formatTimeAgoChs } from '@/utils'
import { usePostStore } from '@/stores'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostFavoriteService, usePostReadService } from '@/services'

const props = withDefaults(
  defineProps<{
    data: PostData
    mini?: boolean
    notPreview?: boolean
    notAlt?: boolean
    postMode?: PostsGetMode
    // post-control 页面
    forward?: boolean
  }>(),
  {
    mini: false,
    notPreview: false,
    notAlt: false,
    postMode: 'normal',
    forward: false
  }
)

const postStore = usePostStore()
const router = useRouter()

const lookPost = () => {
  router.push({ name: 'post', params: { id: props.data.id } })
}

const forwardPost = () => {
  router.push({ name: 'post-forward', params: { id: props.data.id } })
}

const propsdata = computed(() => props.data)
const propsmini = computed(() => props.mini)

const { isRead, setRead } = usePostReadService({
  propsdata,
  propsmini
})

const { setFavorite, topFavorite, removeFavorite, isFavorite } =
  usePostFavoriteService({ propsdata })
</script>
<template>
  <div
    class="post-card"
    @mouseleave="setRead"
    @mouseup="setRead"
    @touchend="setRead"
  >
    <div class="badge-box">
      <Transition name="fade-pop">
        <div class="new-badge" v-show="!isRead">
          <el-badge value="new" type="primary"></el-badge>
        </div>
      </Transition>
    </div>
    <div class="info-bar">
      <div class="info">
        <div class="repost" v-if="data.parentPostId != null">
          <el-icon :size="15">
            <ChatLineSquare />
          </el-icon>
          <div class="repost-text">
            {{ data.parentPost?.content || '' }}
          </div>
        </div>
      </div>
      <div class="time">{{ formatTimeAgoChs(data.createdAt) }}</div>
    </div>

    <div class="content-box">
      <div class="content">
        <TextWithLink :data="data.content"></TextWithLink>
      </div>
    </div>
    <div class="image-box" v-if="data.images.length > 0">
      <ImageGroupUnlimited
        :data="data.images"
        :mini="mini"
        :notPreview="notPreview"
        :notAlt="notAlt"
      ></ImageGroupUnlimited>
    </div>
    <template v-if="mini"></template>
    <template v-else-if="forward">
      <div class="trans-button-container">
        <div class="button-box">
          <div class="button-center">
            <el-button
              type="primary"
              :icon="ChatSquare"
              round
              size="small"
              @click="lookPost"
            >
              查看推文
            </el-button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="trans-button-container">
        <Transition name="fade-down">
          <div class="trans-button-box" v-if="postMode === 'favorite'">
            <div class="button-box">
              <div class="button-center">
                <el-button
                  type="primary"
                  :icon="ChatSquare"
                  round
                  size="small"
                  @click="lookPost"
                >
                  查看
                </el-button>
                <el-button
                  type="warning"
                  :icon="CollectionTag"
                  round
                  size="small"
                  @click="topFavorite"
                >
                  置顶
                </el-button>
                <el-button
                  type="danger"
                  :icon="Remove"
                  round
                  size="small"
                  @click="removeFavorite"
                >
                  移除
                </el-button>
              </div>
            </div>
          </div>
          <div class="trans-button-box" v-else>
            <div class="button-box main">
              <div class="replies-lable">
                <div class="count" v-if="data._count.replies > 0">
                  {{ data._count.replies }}
                </div>
              </div>
              <div class="button-layout">
                <el-button
                  type="primary"
                  :icon="ChatSquare"
                  circle
                  size="small"
                  @click="lookPost"
                />
                <!-- <el-button
                  type="info"
                  :icon="EditPen"
                  circle
                  size="small"
                  @click="editPost"
                /> -->
                <el-button
                  v-if="isFavorite"
                  type="warning"
                  :icon="CollectionTag"
                  circle
                  size="small"
                  @click="removeFavorite"
                />
                <el-button
                  v-else
                  type="warning"
                  :icon="Star"
                  circle
                  size="small"
                  @click="setFavorite"
                />
                <!-- <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  :loading="isDeleting"
                  @click="deletePost"
                /> -->
                <el-button
                  type="success"
                  :icon="Connection"
                  circle
                  size="small"
                  @click="forwardPost"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.post-card {
  .badge-box {
    position: relative;
    .new-badge {
      position: absolute;
      top: -24px;
      right: 0;
      .el-badge {
        :deep() {
          .el-badge__content {
            display: flex;
            padding-bottom: 1px;
            font-weight: bold;
            color: var(--color-background);
            border: none;
            transition: color 0.2s;
            user-select: none;
          }
        }
      }
    }
  }
  .info-bar {
    height: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    .info {
      width: 50%;
      .repost {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: var(--color-text-soft);
        .el-icon {
          margin-right: 5px;
        }
        .repost-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .time {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: var(--color-text-soft);
    }
  }
  .content-box {
    display: flex;
    justify-content: center;
    padding: 4px 0 8px 0;
    .content {
      max-width: 100%;
      color: var(--color-text);
      white-space: pre-wrap;
      // 解决在全英文无空格时，文字无法换行的问题
      word-wrap: break-word;
      transition: all 0.2s;
    }
  }
  .image-box {
    margin: 0;
  }
  .trans-button-container {
    margin-top: 12px;
    position: relative;
    height: 24px;
  }
  .trans-button-box {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  .button-box {
    max-width: 300px;
    margin: 0 auto;
    position: relative;
    &.main {
      max-width: 200px;
    }
    .replies-lable {
      width: 30px;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: end;
      padding-right: 4px;
      .count {
        font-size: 12px;
        color: var(--color-text-soft);
      }
    }
    .button-layout {
      margin: 0 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .el-button {
        margin: 0;
      }
    }
    .button-center {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
