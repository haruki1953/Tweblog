<script setup lang="ts">
import { platformKeyMap } from '@/config'
import type { ForwardSettingItem, PostPoolItem } from '@/types'
import { sakiMessage } from '@/utils'
import { Aim, Link } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { computed } from 'vue'
import {
  postControlForwardManualLinkingApi,
  postControlForwardPostApi
} from '@/api'
import { useLogStore } from '@/stores'

const props = defineProps<{
  item: ForwardSettingItem
  postPoolItem: PostPoolItem
  submitControl: (id: string, callback: () => Promise<any>) => Promise<void>
  isForwarding: boolean
  closeEdit: () => void
}>()

const options = [
  {
    label: '推文转发',
    value: 'tweet-forward'
  },
  {
    label: '手动关联',
    value: 'manual-linking'
  }
] as const
const segmentedOptions = [...options] // el-segmented直接传options会有类型错误
const segmentedValue = ref<(typeof options)[number]['value']>(options[0].value)

const logStore = useLogStore()

const submitForward = async () => {
  await props.submitControl(props.item.uuid, async () => {
    props.closeEdit()
    // await new Promise((resolve) => setTimeout(resolve, 3000))
    try {
      await postControlForwardPostApi({
        postId: props.postPoolItem.mainPost.id,
        forwardConfigId: props.item.uuid
      })
      sakiMessage({
        type: 'success',
        message: '转发成功'
      })
    } finally {
      logStore.setNeedReget()
    }
  })
}

const submitLinking = async () => {
  await props.submitControl(props.item.uuid, async () => {
    props.closeEdit()
    await postControlForwardManualLinkingApi({
      postId: props.postPoolItem.mainPost.id,
      forwardConfigId: props.item.uuid,
      platformPostId: platformPostId.value,
      platformPostLink: platformPostLink.value
    })
    sakiMessage({
      type: 'success',
      message: '关联成功'
    })
  })
}
const platformPostId = ref('')
const platformPostLink = ref('')
const couldNotLinking = computed(
  () => platformPostId.value === '' || platformPostLink.value === ''
)
</script>
<template>
  <div
    class="forward-setting-form use-control-styles"
    v-loading="isForwarding"
    element-loading-background="var(--color-background-soft)"
  >
    <div class="segmented-box">
      <el-segmented
        v-model="segmentedValue"
        :options="segmentedOptions"
        block
      />
    </div>
    <Transition mode="out-in" name="fade">
      <div v-if="segmentedValue === 'manual-linking'">
        <div class="form-box">
          <div class="form-row">
            <div class="input-lable">
              {{ platformKeyMap[item.platform].name }} 中的 id :
            </div>
            <el-input
              v-model="platformPostId"
              :prefix-icon="Aim"
              size="default"
              class="control-input consolas"
            ></el-input>
          </div>
          <div class="form-row">
            <div class="input-lable">
              {{ platformKeyMap[item.platform].name }} 中的链接 :
            </div>
            <el-input
              v-model="platformPostLink"
              :prefix-icon="Link"
              size="default"
              class="control-input consolas"
            ></el-input>
          </div>
        </div>
        <div class="button-box manual-linking not-center">
          <el-button
            @click="submitLinking"
            type="primary"
            round
            :disabled="isForwarding || couldNotLinking"
          >
            关联
          </el-button>
          <el-button @click="closeEdit" type="info" round> 取消 </el-button>
        </div>
      </div>
      <div v-else>
        <div class="control-lable">
          确认要将推文转发至 {{ platformKeyMap[item.platform].name }} 吗？
        </div>
        <div class="button-box tweet-forward not-center">
          <el-button
            @click="submitForward"
            type="primary"
            round
            :disabled="isForwarding"
          >
            转发
          </el-button>
          <el-button @click="closeEdit" type="info" round> 取消 </el-button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.segmented-box {
  max-width: 550px;
  margin: 0 auto;
  margin-bottom: 15px;
  // padding: 0 10px;
  user-select: none;
  --el-border-radius-base: 20px;
  :deep() {
    .el-segmented {
      color: var(--color-text);
      background-color: var(--color-background);
      transition: background-color 0.5s;
    }
    .el-segmented__item {
      transition: background-color 0.2s;
    }
    .el-segmented__item-label {
      font-weight: bold;
    }
  }
}
.control-lable {
  margin-bottom: 5px;
}

.el-button {
  // display: flex;
  // min-width: 30%;
  :deep() {
    span,
    .el-icon {
      // color: var(--color-background);
      font-weight: bold;
    }
  }
}
</style>
