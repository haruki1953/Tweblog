<script setup lang="ts">
import { platformKeyMap } from '@/config'
import type { ForwardSettingItem, PostPoolItem } from '@/types'
import { Connection, Loading, Notification } from '@element-plus/icons-vue'
import { useElementSize } from '@vueuse/core'
import { ref } from 'vue'
import { computed } from 'vue'
import ForwardSubmitForm from './ForwardSubmitForm.vue'

const props = defineProps<{
  item: ForwardSettingItem
  postPoolItem: PostPoolItem
  submitControl: (id: string, callback: () => Promise<any>) => Promise<void>
  isSubmitting: (id: string) => boolean
}>()

const isEditing = ref(false)

const toggleEdit = () => {
  if (isForwarding.value) {
    isEditing.value = false
    return
  }
  isEditing.value = !isEditing.value
}
const closeEdit = () => {
  isEditing.value = false
}

const itemState = computed(() => {
  const find = props.postPoolItem.mainPost.postForwards.find(
    (i) => i.forwardConfigId === props.item.uuid
  )
  if (find == null) {
    return {
      key: 'not-forwarded',
      text: '未转发',
      color: 'var(--el-color-primary)',
      icon: Notification
    }
  }
  return {
    key: 'forwarded',
    text: '已转发',
    color: 'var(--el-color-success)',
    icon: Connection
  }
})

const isForwarding = computed(() => props.isSubmitting(props.item.uuid))

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})
</script>
<template>
  <div class="forward-submit-item">
    <div class="info-box">
      <div
        @click="toggleEdit"
        class="top-line"
        :class="{
          'is-forwarding': isForwarding
        }"
      >
        <div class="info-row">
          <div class="info-col left">
            <div class="icon-text">
              <el-icon
                :class="platformKeyMap[item.platform].fontawesomeClass"
                size="25"
              ></el-icon>
              <div class="text">
                {{ item.name }}
              </div>
            </div>
          </div>
          <div class="info-col right">
            <div></div>
            <div class="content-flag">
              <Transition name="fade" mode="out-in">
                <div class="flag" v-if="isForwarding">
                  <el-icon
                    :color="itemState.color"
                    size="20"
                    class="is-loading"
                  >
                    <Loading></Loading>
                  </el-icon>
                </div>
                <div
                  class="content"
                  :key="itemState.key + 'isEditing'"
                  :style="{
                    color: itemState.color
                  }"
                  v-else-if="isEditing"
                >
                  {{ itemState.text }}
                </div>
                <div class="flag" :key="itemState.key" v-else>
                  <el-icon :color="itemState.color" size="20">
                    <component :is="itemState.icon"></component>
                  </el-icon>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
      <div
        class="style-box"
        :style="{
          height: boxStyleHeight
        }"
      >
        <div class="info-divider"></div>
        <Transition name="fade05">
          <div v-if="isEditing" ref="boxRef">
            <div class="info-row form">
              <ForwardSubmitForm
                :item="item"
                :postPoolItem="postPoolItem"
                :submitControl="submitControl"
                :isForwarding="isForwarding"
                :closeEdit="closeEdit"
              ></ForwardSubmitForm>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.style-box {
  overflow: hidden;
  transition: height 0.8s ease-in-out;
  // transition: height 1s;
}

.info-box {
  margin-bottom: 10px;
  background-color: var(--color-background-soft);
  transition: background-color 0.5s;
  border-radius: 20px;
  transition:
    background-color 0.5s,
    box-shadow 0.5s;
  &:hover {
    box-shadow: var(--el-box-shadow-lighter);
  }
}

.info-divider {
  // height: 2px;
  // background-color: var(--color-background);
  // transition: background-color 0.5s;
  border-top: 2.4px solid var(--color-background); // divider
  transition: border 0.5s;
}

.top-line {
  height: 45px;
  cursor: pointer;
  user-select: none;
  &.is-forwarding {
    cursor: progress;
  }
}
.info-row {
  margin: 0 16px 0 20px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &.form {
    margin: 0 20px;
    display: block;
    padding: 15px 0;
  }
}
.info-col {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.left {
  max-width: calc(100% - 140px);
}
.right {
}

.icon-text {
  width: 100%;
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 10px;
  }

  .text {
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.content-flag {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .content {
    user-select: none;
    font-size: 14px;
    font-weight: bold;
  }

  .flag {
    display: flex;
    align-items: center;
    margin-left: 10px;
  }
}
</style>
