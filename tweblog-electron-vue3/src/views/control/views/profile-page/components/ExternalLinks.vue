<script setup lang="ts">
import { useProfileStore } from '@/stores'
import type { BackendProfileStore } from '@/types'
import { profileIconUrl, sakiMessage } from '@/utils'
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
import { profileUpdateExternalLinksApi } from '@/api'
import { profileConfig } from '@/config'
import type IconSelector from '@/components/profile/IconSelector.vue'
import { nextTick } from 'vue'

const props = defineProps<{
  type: BackendProfileStore['externalLinks'][number]['type']
  title: string
}>()

const profileStore = useProfileStore()

type ExternalLinkItem = BackendProfileStore['externalLinks'][number]
type ExternalIconItem = BackendProfileStore['externalIcons'][number]

const linkType = computed(() => props.type)

/* 联系方式 */
const externalLinksInfo = ref<BackendProfileStore['externalLinks']>([])

const initData = () => {
  externalLinksInfo.value = cloneDeep(profileStore.externalLinks).filter(
    (i) => i.type === linkType.value
  )
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
  const find = externalLinksInfo.value.find(
    (i) => i.uuid === selectedUuid.value
  )
  if (find === undefined) {
    return null
  }
  return find
})

const isSelectedEdit = (info: ExternalLinkItem) => {
  return selectedUuid.value === info.uuid && mode.value === 'edit'
}
const isSelectedAdd = computed(() => mode.value === 'add')

const selectEdit = async (info: ExternalLinkItem) => {
  // console.log(externalLinksInfo.value)
  if (mode.value === 'edit' && selectedUuid.value === info.uuid) {
    mode.value = 'none'
    selectedIconInit.value = undefined
    selectedIconList.value = []
    return
  }
  selectedUuid.value = info.uuid
  mode.value = 'edit'
  if (!selectedInfo.value) {
    return
  }
  name.value = selectedInfo.value.name
  link.value = selectedInfo.value.link
  isCircle.value = selectedInfo.value.isCircle

  // 确保选中对应图标
  selectedIconList.value = []
  selectedIconInit.value = selectedInfo.value.icon
  await nextTick()
  refIconSelector.value?.selectImgById(selectedInfo.value.icon, false)
}
const selectAdd = () => {
  if (mode.value === 'add') {
    mode.value = 'none'
    return
  }
  mode.value = 'add'
  selectedIconInit.value = undefined
  selectedIconList.value = []
  name.value = ''
  link.value = ''
  isCircle.value = false
}

const cancel = () => {
  initData()
  mode.value = 'none'
}

const isSubmiting = ref(false)
const submit = async () => {
  isSubmiting.value = true
  try {
    const externalLinks = [
      ...profileStore.externalLinks.filter((i) => i.type !== linkType.value),
      ...externalLinksInfo.value
    ]

    const res = await profileUpdateExternalLinksApi({
      externalLinks
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
const selectedIconInit = ref<string | undefined>(undefined)
const selectedIconList = ref<ExternalIconItem[]>([])
const selectedIcon = computed(() => {
  if (selectedIconList.value.length === 0) {
    return null
  }
  return selectedIconList.value[0]
})
const name = ref('')
const link = ref('')
const isCircle = ref(false)

const refIconSelector = ref<InstanceType<typeof IconSelector> | null>(null)

const couldLeft = computed(() => {
  if (selectedInfo.value === null) {
    return false
  }
  const info = selectedInfo.value
  const findIndex = externalLinksInfo.value.findIndex(
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
  const findIndex = externalLinksInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return false
  }
  if (findIndex === externalLinksInfo.value.length - 1) {
    return false
  }
  return true
})

const moveLeft = () => {
  if (selectedInfo.value === null) {
    return
  }
  const info = selectedInfo.value
  const findIndex = externalLinksInfo.value.findIndex(
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

  let newList = [...externalLinksInfo.value]
  newList = newList.filter((i) => i.uuid !== info.uuid)
  newList.splice(targetIndex, 0, info)

  externalLinksInfo.value = newList
}

const moveRight = () => {
  if (selectedInfo.value === null) {
    return
  }
  const info = selectedInfo.value
  const findIndex = externalLinksInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return
  }
  const targetIndex = (() => {
    if (findIndex === externalLinksInfo.value.length - 1) {
      return findIndex
    }
    return findIndex + 1
  })()

  let newList = [...externalLinksInfo.value]
  newList = newList.filter((i) => i.uuid !== info.uuid)
  newList.splice(targetIndex, 0, info)

  externalLinksInfo.value = newList
}

const addInfo = async () => {
  // if (!selectedIcon.value) {
  //   return
  // }
  externalLinksInfo.value.push({
    uuid: uuidv4(),
    icon: selectedIcon.value?.uuid || '',
    link: link.value,
    name: name.value,
    description: name.value,
    isCircle: isCircle.value,
    type: linkType.value
  })
  refCompleteMessageContainer.value?.success()
  await new Promise((resolve) => setTimeout(resolve, 300))
  mode.value = 'none'
}

const updateInfo = async () => {
  // if (!selectedIcon.value) {
  //   return
  // }
  if (selectedInfo.value === null) {
    return
  }
  const info = selectedInfo.value
  const findIndex = externalLinksInfo.value.findIndex(
    (i) => i.uuid === info.uuid
  )
  if (findIndex === -1) {
    return
  }
  externalLinksInfo.value[findIndex] = {
    uuid: info.uuid,
    icon: selectedIcon.value?.uuid || '',
    link: link.value,
    name: name.value,
    description: name.value,
    isCircle: isCircle.value,
    type: linkType.value
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
  externalLinksInfo.value = externalLinksInfo.value.filter(
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
  <div class="external-links">
    <!-- 链接信息 -->
    <div class="control-row external-links-row">
      <div class="control-lable">{{ title }}</div>
      <div class="sm-group external-links-group">
        <TransitionGroup name="fade-slide-right-list">
          <div
            class="external-links-item"
            v-for="item in externalLinksInfo"
            :key="item.uuid"
            :class="{
              selected: isSelectedEdit(item)
            }"
            @click="selectEdit(item)"
          >
            <div class="link-box">
              <div class="avatar-name" :href="item.link" target="_blank">
                <Transition name="fade-pop" mode="out-in">
                  <div class="avatar-box" :key="item.icon">
                    <img
                      class="avatar"
                      :class="{ circle: item.isCircle }"
                      :src="profileStore.getIconUrlByLinkItem(item)"
                    />
                  </div>
                </Transition>
                <span class="name" v-if="item.name !== ''">{{
                  item.name
                }}</span>
              </div>
            </div>
          </div>
          <div
            class="sm-add external-links-add"
            key="add"
            :class="{
              selected: isSelectedAdd
            }"
            @click="selectAdd"
          >
            <el-icon class="icon" size="25"><Plus /></el-icon>
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
          class="external-links-edit-box"
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
                    <div class="form-icon">
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
                        <div :key="selectedIcon?.uuid || 'none'">
                          <el-avatar
                            :size="60"
                            :src="
                              selectedIcon
                                ? profileIconUrl(selectedIcon)
                                : profileConfig.iconDefault
                            "
                            :shape="isCircle ? 'circle' : 'square'"
                          />
                        </div>
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
                    <div class="control-radio">
                      <el-radio-group v-model="isCircle">
                        <el-radio :value="false"> 方形 </el-radio>
                        <el-radio :value="true"> 圆形 </el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="input-lable">名称</div>
                    <el-input
                      v-model="name"
                      :prefix-icon="ChatDotSquare"
                      placeholder="名称"
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
          <div class="sm-select-box external-links-select-box">
            <IconSelector
              v-model="selectedIconList"
              ref="refIconSelector"
              :initUuid="selectedIconInit"
              couldCancel
            ></IconSelector>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.el-avatar {
  background-color: transparent;
  border: 2px solid var(--color-background-mute);
  transition:
    border 0.5s,
    border-radius 0.5s;
  user-select: none;
}

.style-box {
  overflow: hidden;
  transition: height 0.8s ease-in-out;
  // transition: height 1s;
}

.form-icon {
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

.external-links-select-box {
  padding: 10px;
}

.external-links-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 18px;
}

.external-links-item {
  max-width: 80%;
  margin: 8px;
  padding: 8px 10px;
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
  .link-box {
    display: block;
    // margin: 10px;
    user-select: none;
    .avatar-name {
      height: 44px;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--color-text);
      .avatar-box {
        display: flex;
        align-items: center;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 4px;
        transition: border-radius 0.5s;
        &.circle {
          border-radius: 50%;
        }
      }
      .name {
        margin: 0 0 0 10px;
        transition: all 0.5s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.external-links-add {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 60px;
  margin: 8px;
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
