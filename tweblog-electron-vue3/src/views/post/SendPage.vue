<script setup lang="ts">
import { ChatLineSquare, EditPen, Edit, Delete } from '@element-plus/icons-vue'
import { ref } from 'vue'
import type {
  Image,
  ImageStoreData,
  InfoBySendType,
  PostSendJsonType
} from '@/types'
import { useImageStore, useLayoutStore, usePostStore } from '@/stores'
import { postConfig } from '@/config'
import { formatTime, imageToImageStoreData } from '@/utils'
import InfoEditDialog from './components/InfoEditDialog.vue'
import type ImageEditDialog from '@/components/image/image-edit/ImageEditDialog.vue'
import { useElementSize, useNow } from '@vueuse/core'
import { computed } from 'vue'
import CharProgressGroup from './components/CharProgressGroup.vue'
// import CharProgress from './components/CharProgress.vue'
import { usePostSendService } from '@/services'

const formModel = ref<PostSendJsonType>({})

const imagesData = ref<ImageStoreData[]>([])

const imageStore = useImageStore()

const addImage = (image: Image) => {
  // 上传图片的同时添加图片，其实不要也行
  // // push to imagesData, and limit length
  // imagesData.value.push(imageToImageStoreData(image))
  // if (imagesData.value.length > postConfig.postMaxImages) {
  //   imagesData.value = imagesData.value.slice(-postConfig.postMaxImages)
  // }
}

const postStore = usePostStore()

const refInfoEditDialog = ref<InstanceType<typeof InfoEditDialog> | null>(null)
const refImageEditDialog = ref<InstanceType<typeof ImageEditDialog> | null>(
  null
)

const nowRef = useNow({ interval: 1000 }) // 每秒更新一次
const showTime = computed(() => {
  if (formModel.value.createdAt !== undefined) {
    return formatTime(formModel.value.createdAt)
  } else {
    return formatTime(nowRef.value)
  }
})

const couldNotSend = computed(() => {
  if (!formModel.value.content && imagesData.value.length === 0) {
    return true
  } else {
    return false
  }
})

const infoBySendType = computed((): InfoBySendType => {
  // type === 'post'
  const info: InfoBySendType = {
    type: 'post',
    data: null,
    topBarTitle: '推文发送',
    topBarBtnText: '发 送',
    sendFunc: sendPost,
    repostLableText: null,
    textareaPlaceholder: '有什么新鲜事？！'
  }
  if (postStore.infoForSend.type === 'reply' && postStore.infoForSend.data) {
    info.type = 'reply'
    info.data = postStore.infoForSend.data
    info.topBarTitle = '推文回复'
    info.topBarBtnText = '回 复'
    info.sendFunc = sendReply
    info.repostLableText = postStore.infoForSend.data.content
    info.textareaPlaceholder = '发布你的回复'
  }
  if (postStore.infoForSend.type === 'update' && postStore.infoForSend.data) {
    info.type = 'update'
    info.data = postStore.infoForSend.data
    info.topBarTitle = '推文修改'
    info.topBarBtnText = '修 改'
    info.sendFunc = sendUpdate
    info.repostLableText =
      postStore.infoForSend.data.parentPost?.content == null
        ? null
        : postStore.infoForSend.data.parentPost.content
    info.textareaPlaceholder = '有什么新鲜事？！'
  }
  return info
})

const { isSending, sendPost, sendReply, sendUpdate } = usePostSendService({
  imagesData,
  formModel,
  infoBySendType
})

const initFormModelForUpdate = () => {
  if (!(infoBySendType.value.type === 'update' && infoBySendType.value.data)) {
    return
  }
  const {
    content,
    createdAt,
    parentPostId,
    // twitterId,
    // twitterLink,
    isDeleted,
    images
  } = infoBySendType.value.data
  formModel.value = {
    content,
    createdAt: new Date(createdAt),
    parentPostId,
    // twitterId,
    // twitterLink,
    isDeleted
  }
  // deep copy, to prevent it change the post in home page
  imagesData.value = images.map((i) => imageToImageStoreData(i))
  // imagesData.value = [...images]
}
// formModel: {
//     content?: string | undefined;
//     images?: number[] | undefined;
//     createdAt?: Date | undefined;
//     parentPostId?: number | null | undefined;
//     twitterId?: string | null | undefined;
//     twitterLink?: string | null | undefined;
//     isDeleted?: boolean | undefined;
// }
const resetFuncForInfoEditDialog = computed(() => {
  if (!(infoBySendType.value.type === 'update' && infoBySendType.value.data)) {
    return undefined
  }
  return initFormModelForUpdate
})

// 数据初始化不要放在onMounted里就不会有动画了
// onMounted(() => {
//   initFormModelForUpdate()
// })
initFormModelForUpdate()

const layoutStore = useLayoutStore()

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})
</script>
<template>
  <div>
    <InfoEditDialog
      ref="refInfoEditDialog"
      v-model="formModel"
      :info="infoBySendType"
      :resetFunc="resetFuncForInfoEditDialog"
    ></InfoEditDialog>
    <ImageEditDialog
      ref="refImageEditDialog"
      v-model="imagesData"
      notPreview
      imageSelect
    ></ImageEditDialog>
    <DataContainerMountedMask>
      <Col2Layout>
        <template #colLeftSm>
          <TopBar :title="infoBySendType.topBarTitle">
            <el-button
              type="primary"
              round
              size="small"
              @click="infoBySendType.sendFunc"
              :disabled="imageStore.isImageUploading || couldNotSend"
              :loading="isSending"
            >
              {{ infoBySendType.topBarBtnText }}
            </el-button>
          </TopBar>

          <div
            class="post-group-box"
            v-if="
              ['reply'].includes(infoBySendType.type) && infoBySendType.data
            "
          >
            <PostGroup
              :data="[infoBySendType.data]"
              mini
              notPreview
            ></PostGroup>
          </div>
        </template>
        <template #colLeft="{ warpScroll }">
          <TopBar :title="infoBySendType.topBarTitle">
            <el-button
              type="primary"
              round
              size="small"
              @click="infoBySendType.sendFunc"
              :disabled="imageStore.isImageUploading || couldNotSend"
              :loading="isSending"
            >
              {{ infoBySendType.topBarBtnText }}
            </el-button>
          </TopBar>

          <div
            class="post-group-box"
            v-if="
              ['reply'].includes(infoBySendType.type) && infoBySendType.data
            "
          >
            <PostGroup
              :data="[infoBySendType.data]"
              mini
              notPreview
            ></PostGroup>
          </div>
          <ImageUploader :onUploaded="addImage"></ImageUploader>
          <ImageSelector
            v-model="imagesData"
            :max="postConfig.postMaxImages"
            :warpScroll="warpScroll"
          ></ImageSelector>
        </template>
        <template #colRight>
          <div class="info-bar">
            <div class="info">
              <div class="repost" v-if="infoBySendType.repostLableText != null">
                <el-icon :size="15">
                  <ChatLineSquare />
                </el-icon>
                <div class="repost-text">
                  {{ infoBySendType.repostLableText }}
                </div>
              </div>
            </div>
            <div class="time">
              <span>{{ showTime }}</span>
              <el-button
                type="info"
                :icon="EditPen"
                circle
                size="small"
                @click="refInfoEditDialog?.open()"
              />
            </div>
          </div>
          <div class="content-box">
            <el-input
              v-model="formModel.content"
              :placeholder="infoBySendType.textareaPlaceholder"
              :autosize="{ minRows: 8, maxRows: 20 }"
              type="textarea"
              resize="none"
              class="content-textarea"
            />
            <div class="char-progress-box">
              <!-- <Transition name="fade-pop">
                <CharProgress
                  v-if="formModel.content"
                  v-model="formModel.content"
                ></CharProgress>
              </Transition> -->
              <CharProgressGroup
                v-model="formModel.content"
              ></CharProgressGroup>
            </div>
          </div>
          <div class="image-box-container">
            <div
              class="style-box"
              :style="{
                height: boxStyleHeight
              }"
            >
              <Transition name="fade-slide">
                <div
                  class="image-box"
                  v-if="imagesData.length > 0"
                  ref="boxRef"
                >
                  <div class="image-group-transition-container">
                    <Transition name="fade-slide" mode="out-in">
                      <ImageGroupUnlimited
                        :data="imagesData"
                        backgroundColor="soft"
                        :key="imagesData.map((i) => i.id).toString()"
                      ></ImageGroupUnlimited>
                    </Transition>
                  </div>
                  <div class="image-edit-button">
                    <el-button
                      type="danger"
                      :icon="Delete"
                      round
                      size="small"
                      @click="imagesData = []"
                    >
                      全部取消
                    </el-button>
                    <el-button
                      type="primary"
                      :icon="Edit"
                      round
                      size="small"
                      @click="refImageEditDialog?.open()"
                    >
                      修改图片
                    </el-button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
          <div class="image-upload-select" v-if="!layoutStore.col2IsShow2Col">
            <ImageUploader :onUploaded="addImage"></ImageUploader>
            <ImageSelector
              v-model="imagesData"
              :max="postConfig.postMaxImages"
              infiniteScroll
            ></ImageSelector>
          </div>
        </template>
      </Col2Layout>
    </DataContainerMountedMask>
  </div>
</template>

<style lang="scss" scoped>
.style-box {
  // overflow: hidden;
  transition: height 0.5s ease;
  // transition: height 1s;
}

.top-bar {
  margin-bottom: 20px;
}

.info-bar {
  height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
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
    .el-button {
      margin-left: 5px;
    }
  }
}

.content-box {
  margin-bottom: 15px;
  position: relative;
  .char-progress-box {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
  .content-textarea {
    padding: 10px 10px 50px 10px;
    border-radius: 20px;
    background-color: var(--color-background-soft);
    transition: all 0.5s;
    :deep() {
      .el-textarea__inner {
        // color: var(--color-text);
        // font-weight: bold;
        border: none;
        box-shadow: none;
        background-color: var(--color-background-soft);
        transition:
          background-color 0.5s,
          color 0.2s;
      }
      .el-input__count {
        background-color: var(--color-background-soft);
        color: var(--color-text-soft);
        transition: all 0.5s;
        right: 20px;
        bottom: 15px;
        user-select: none;
      }
    }
  }
}

.image-box-container {
  // position: relative;
}
.image-box {
  // position: absolute;
  width: 100%;
  // padding-bottom: 15px;
  &::after {
    content: '';
    display: block;
    height: 15px;
  }
  .image-edit-button {
    margin: 5px 10px 0 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
// .image-group-transition-container {
//   position: relative;
//   aspect-ratio: 16 / 9;
//   .image-group {
//     position: absolute;
//     width: 100%;
//   }
// }
.image-upload-select {
  transition: transform 0.3s;
  &.image-box-show {
    &::after {
      content: '';
      display: block;
      height: 20px;
    }
  }
}
.image-uploader {
  margin-bottom: 15px;
}
</style>
