<script setup lang="ts">
import { useProfileStore } from '@/stores'
import type { BackendProfileStore } from '@/types'
import { sakiMessage, sakiNotification } from '@/utils'
import {
  Link,
  Plus,
  ChatDotSquare,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type CompleteMessageContainer from '@/components/layout/CompleteMessageContainer.vue'
import { cloneDeep } from 'lodash'
import { profileUpdateSocialMediasApi } from '@/api'

const profileStore = useProfileStore()

/* 社交媒体 */
const socialMediasInfo = ref<BackendProfileStore['socialMedias']>([])

const initData = () => {
  socialMediasInfo.value = cloneDeep(profileStore.socialMedias)
}
initData()

// profileStore 加载后，应初始化数据
watch(
  () => profileStore.isLoading,
  () => {
    if (profileStore.isLoading) {
      return
    }
    initData()
  }
)

const mode = ref<'edit' | 'add' | 'none'>('none')
const selectedUuid = ref<string>('')

const selectedInfo = computed(() => {
  if (mode.value !== 'edit') {
    return null
  }
  const find = socialMediasInfo.value.find((i) => i.uuid === selectedUuid.value)
  if (find === undefined) {
    return null
  }
  return find
})

const isSelectedEdit = (info: BackendProfileStore['socialMedias'][number]) => {
  return selectedUuid.value === info.uuid && mode.value === 'edit'
}
const isSelectedAdd = computed(() => mode.value === 'add')

const selectEdit = (info: BackendProfileStore['socialMedias'][number]) => {
  // console.log(socialMediasInfo.value)
  if (mode.value === 'edit' && selectedUuid.value === info.uuid) {
    mode.value = 'none'
    return
  }
  selectedUuid.value = info.uuid
  mode.value = 'edit'
  if (!selectedInfo.value) {
    return
  }
  selectedFaClass.value = [selectedInfo.value.fontawesomeClass]
  description.value = selectedInfo.value.description
  link.value = selectedInfo.value.link
}
const selectAdd = () => {
  if (mode.value === 'add') {
    mode.value = 'none'
    return
  }
  mode.value = 'add'
  selectedFaClass.value = []
  description.value = ''
  link.value = ''
}

const cancel = () => {
  initData()
  mode.value = 'none'
}

const isSubmiting = ref(false)
const submit = async () => {
  isSubmiting.value = true
  try {
    const res = await profileUpdateSocialMediasApi({
      socialMedias: socialMediasInfo.value
    })
    // 更新store
    profileStore.loadProfileByRes(res.data.data)
    sakiMessage({
      type: 'success',
      message: '修改成功'
    })
  } finally {
    isSubmiting.value = false
  }
}

/* 信息编辑 */
const selectedFaClass = ref<string[]>([])
const faClass = computed(() => {
  if (selectedFaClass.value.length === 0) {
    return 'fa-brands fa-font-awesome'
  }
  return selectedFaClass.value[0]
})
const description = ref('')
const link = ref('')

const couldLeft = computed(() => {
  if (selectedInfo.value === null) {
    return false
  }
  const info = selectedInfo.value
  const findIndex = socialMediasInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return false
  }
  if (findIndex === 0) {
    return false
  }
  return true
})

const couldRight = computed(() => {
  if (selectedInfo.value === null) {
    return false
  }
  const info = selectedInfo.value
  const findIndex = socialMediasInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return false
  }
  if (findIndex === socialMediasInfo.value.length - 1) {
    return false
  }
  return true
})

const moveLeft = () => {
  if (selectedInfo.value === null) {
    return
  }
  const info = selectedInfo.value
  const findIndex = socialMediasInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return
  }
  const targetIndex = (() => {
    if (findIndex === 0) {
      return findIndex
    }
    return findIndex - 1
  })()

  let newList = [...socialMediasInfo.value]
  newList = newList.filter((i) => i.uuid !== info.uuid)
  newList.splice(targetIndex, 0, info)

  socialMediasInfo.value = newList
}

const moveRight = () => {
  if (selectedInfo.value === null) {
    return
  }
  const info = selectedInfo.value
  const findIndex = socialMediasInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return
  }
  const targetIndex = (() => {
    if (findIndex === socialMediasInfo.value.length - 1) {
      return findIndex
    }
    return findIndex + 1
  })()

  let newList = [...socialMediasInfo.value]
  newList = newList.filter((i) => i.uuid !== info.uuid)
  newList.splice(targetIndex, 0, info)

  socialMediasInfo.value = newList
}

const isShowedMoreThan4Notification = ref(false)
const addInfo = async () => {
  socialMediasInfo.value.push({
    uuid: uuidv4(),
    name: faClass.value,
    fontawesomeClass: faClass.value,
    link: link.value,
    description: description.value
  })
  if (socialMediasInfo.value.length > 4) {
    ;(() => {
      if (isShowedMoreThan4Notification.value) {
        return
      }
      isShowedMoreThan4Notification.value = true
      sakiNotification({
        type: 'info',
        title: '关于社交媒体显示',
        message:
          '为避免显示问题，菜单栏中将只显示前四个社交媒体标志，完整内容将在关于页底部显示。',
        duration: 10000
      })
    })()
  }
  refCompleteMessageContainer.value?.success()
  await new Promise((resolve) => setTimeout(resolve, 300))
  mode.value = 'none'
}

const updateInfo = async () => {
  if (selectedInfo.value === null) {
    return
  }
  const info = selectedInfo.value
  const findIndex = socialMediasInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return
  }
  socialMediasInfo.value[findIndex] = {
    uuid: info.uuid,
    name: info.name,
    fontawesomeClass: faClass.value,
    link: link.value,
    description: description.value
  }
  refCompleteMessageContainer.value?.success()
  await new Promise((resolve) => setTimeout(resolve, 300))
  // mode.value = 'none'
}

const removeInfo = async () => {
  if (selectedInfo.value === null) {
    return
  }
  // refCompleteMessageContainer.value?.success()
  // await new Promise((resolve) => setTimeout(resolve, 300))
  const info = selectedInfo.value
  socialMediasInfo.value = socialMediasInfo.value.filter(
    (i) => i.uuid !== info.uuid
  )
  mode.value = 'none'
}

/* 样式控制 */
const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)

const boxStyleHeight = computed(() => {
  if (boxSize.height.value < 25) {
    return '25px'
  }
  return `${boxSize.height.value}px`
})
const refCompleteMessageContainer = ref<InstanceType<
  typeof CompleteMessageContainer
> | null>(null)
</script>
<template>
  <div class="social-medias">
    <!-- 社交媒体 -->
    <div class="control-row social-medias-row">
      <div class="control-lable">修改社交媒体信息</div>
      <div class="social-medias-group">
        <TransitionGroup name="fade-slide-right-list">
          <div
            class="social-medias-item"
            v-for="item in socialMediasInfo"
            :key="item.uuid"
            :class="{
              selected: isSelectedEdit(item)
            }"
            @click="selectEdit(item)"
          >
            <Transition name="fade-pop" mode="out-in">
              <el-icon
                :class="item.fontawesomeClass"
                size="25"
                :key="item.fontawesomeClass"
              ></el-icon>
            </Transition>
          </div>
          <div
            class="social-medias-add"
            key="social-medias-add"
            :class="{
              selected: isSelectedAdd
            }"
            @click="selectAdd"
          >
            <el-icon class="icon"><Plus /></el-icon>
          </div>
        </TransitionGroup>
      </div>
      <div class="button-box save">
        <el-button @click="submit" :loading="isSubmiting" type="success" round>
          保存
        </el-button>
        <el-button @click="cancel" type="info" round> 取消 </el-button>
      </div>
    </div>
    <div class="control-divider"></div>
    <div
      class="style-box"
      :style="{
        height: boxStyleHeight
      }"
    >
      <Transition name="fade05">
        <div
          class="social-medias-edit-box"
          ref="boxRef"
          v-if="selectedInfo || isSelectedAdd"
        >
          <!-- 信息编辑 -->
          <Transition name="fade" mode="out-in">
            <div
              class="control-row info-edit-row"
              :key="mode + selectedInfo?.uuid"
            >
              <CompleteMessageContainer
                ref="refCompleteMessageContainer"
                backgroundColor="var(--color-background-soft)"
              >
                <div class="form-box">
                  <div class="form-row">
                    <div class="form-fa-brand">
                      <div class="left">
                        <Transition name="fade">
                          <el-icon
                            :size="30"
                            @click="moveLeft"
                            v-show="couldLeft"
                          >
                            <ArrowLeft />
                          </el-icon>
                        </Transition>
                      </div>
                      <Transition name="fade-pop" mode="out-in">
                        <el-icon
                          :class="faClass"
                          size="40"
                          :key="faClass"
                        ></el-icon>
                      </Transition>
                      <div class="right">
                        <Transition name="fade">
                          <el-icon
                            :size="30"
                            @click="moveRight"
                            v-show="couldRight"
                          >
                            <ArrowRight />
                          </el-icon>
                        </Transition>
                      </div>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="input-lable">描述</div>
                    <el-input
                      v-model="description"
                      :prefix-icon="ChatDotSquare"
                      placeholder="将会悬停提示"
                      size="large"
                      class="control-input"
                    ></el-input>
                  </div>
                  <div class="form-row">
                    <div class="input-lable">链接</div>
                    <el-input
                      v-model="link"
                      :prefix-icon="Link"
                      placeholder="链接"
                      size="large"
                      class="control-input"
                    ></el-input>
                  </div>
                </div>
                <div class="button-box edit" v-if="mode === 'edit'">
                  <el-button
                    @click="updateInfo"
                    type="warning"
                    round
                    size="small"
                  >
                    修改
                  </el-button>
                  <el-button
                    @click="removeInfo"
                    type="danger"
                    round
                    size="small"
                  >
                    移除
                  </el-button>
                  <el-button
                    @click="mode = 'none'"
                    type="info"
                    round
                    size="small"
                  >
                    关闭
                  </el-button>
                </div>
                <div class="button-box add" v-else>
                  <el-button @click="addInfo" type="primary" round size="small">
                    添加
                  </el-button>
                  <el-button
                    @click="mode = 'none'"
                    type="info"
                    round
                    size="small"
                  >
                    关闭
                  </el-button>
                </div>
              </CompleteMessageContainer>
            </div>
          </Transition>
          <div class="control-divider"></div>
          <div class="social-medias-select-box">
            <SocialMediasSelector
              v-model="selectedFaClass"
            ></SocialMediasSelector>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.style-box {
  overflow: hidden;
  transition: height 0.8s ease-in-out;
  // transition: height 1s;
}

.form-fa-brand {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  .left,
  .right {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      color 0.2s,
      transform 0.5s;
    .el-icon {
      cursor: pointer;
    }
  }
  .left {
    &:hover {
      transform: scale(1.2, 1.2);
    }
  }
  .right {
    &:hover {
      transform: scale(1.2, 1.2);
    }
  }
}

.button-box {
  margin-bottom: -8px;
  &.add,
  &.edit {
    margin-top: 18px;
  }
}

.info-edit-row {
  padding-top: 24px;
}

.social-medias-select-box {
  padding: 10px;
}

.social-medias-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
}
.social-medias-item {
  margin: 3px;
  padding: 8px;
  border-radius: 10px;
  transition:
    background-color 0.5s,
    color 0.2s,
    transform 0.2s;
  cursor: pointer;
  &:hover {
    background-color: var(--color-background-mute);
    transform: scale(1.1, 1.1);
  }
  &.selected {
    background-color: var(--el-color-primary-light-7);
  }
  .el-icon {
    display: flex;
  }
}
.social-medias-add {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 41px;
  height: 41px;
  margin: 3px;
  border: 2px dashed var(--el-border-color);
  border-radius: 10px;
  cursor: pointer;
  transition:
    border var(--el-transition-duration),
    background-color 0.5s,
    transform 0.2s;
  &:hover {
    background-color: var(--color-background-mute);
    transform: scale(1.05, 1.05);
  }
  &.selected {
    border-color: var(--el-color-primary);
  }
  .el-icon {
    color: var(--my-neutral);
  }
}
</style>
