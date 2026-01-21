<script setup lang="ts">
import { postControlImportApi } from '@/api'
import { appInfo } from '@/config'
import type { ImportPostList } from '@/types'
import { ref } from 'vue'
import { useForwardStore, useTaskStore } from '@/stores'
import ImportSubmitList from './ImportSubmitList.vue'
import { useElementSize } from '@vueuse/core'
import { computed } from 'vue'
import ImportSubmitAdvanced from './ImportSubmitAdvanced.vue'
import type ConfirmContainer from '@/components/layout/ConfirmContainer.vue'

const model = defineModel<ImportPostList>({
  required: true
})

const importCancel = () => {
  model.value = []
}

const taskStore = useTaskStore()

const isSubmiting = ref(false)
const submit = async () => {
  await refConfirmContainer.value?.confirm()
  isSubmiting.value = true
  try {
    const res = await postControlImportApi({
      importPosts: model.value,
      advancedSettings: advancedSettingsCorrect.value
    })
    taskStore.pollLoadByData(res.data.data)
    model.value = []
  } finally {
    isSubmiting.value = false
  }
}

const defaultAdvancedSettings = () => {
  return {
    forwardConfigId: ''
  }
}

// 高级功能开关
const isEditing = ref(false)
const toggleEdit = () => {
  advancedSettings.value = defaultAdvancedSettings()
  isEditing.value = !isEditing.value
}

const advancedSettings = ref(defaultAdvancedSettings())

const forwardStore = useForwardStore()
const forwardSettingList = computed(() => forwardStore.forwardSettingList)
const findForwardSetting = computed(() =>
  forwardSettingList.value.find(
    (i) => i.uuid === advancedSettings.value.forwardConfigId
  )
)

// 处理advancedSettings确保正确
const advancedSettingsCorrect = computed(() => {
  // 高级功能需开启
  if (!isEditing.value) {
    return undefined
  }
  // 转发配置需存在
  if (findForwardSetting.value == null) {
    return undefined
  }
  return advancedSettings.value
})

const boxRef = ref<HTMLElement | null>(null)
const boxSize = useElementSize(boxRef)
const boxStyleHeight = computed(() => {
  return `${boxSize.height.value}px`
})

const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)
// 根据高级设置情况，会有不同的标题
const confirmContainerTitle = computed(() => {
  if (
    advancedSettingsCorrect.value != null &&
    findForwardSetting.value != null
  ) {
    return `确认要导入并关联至 ${findForwardSetting.value.name} 转发记录吗`
  }
  return `确认要导入以下 ${model.value.length} 条推文吗`
})
</script>
<template>
  <div class="import-submit">
    <div class="control-box submit">
      <div class="control-row">
        <ConfirmContainer
          ref="refConfirmContainer"
          backgroundColor="var(--color-background-soft)"
          :title="confirmContainerTitle"
          size="small"
        >
          <div class="control-lable-with-link">
            <div class="lable">已解析 {{ model.length }} 条推文</div>
            <a class="link" href="javascript:;" @click="toggleEdit">
              高级功能
            </a>
          </div>
          <div class="button-box">
            <el-button
              @click="submit"
              :loading="isSubmiting"
              type="primary"
              round
            >
              导入
            </el-button>
            <el-button @click="importCancel" type="info" round>
              取消
            </el-button>
          </div>
        </ConfirmContainer>
      </div>
    </div>
    <div
      class="style-box"
      :style="{
        height: boxStyleHeight
      }"
    >
      <Transition name="fade05">
        <div v-if="isEditing" ref="boxRef">
          <ImportSubmitAdvanced
            v-model="advancedSettings"
            :toggleEdit="toggleEdit"
          ></ImportSubmitAdvanced>
        </div>
      </Transition>
    </div>
    <Transition name="fade10">
      <el-divider
        content-position="right"
        border-style="dotted"
        v-if="isEditing"
      >
        <a href="javascript:;" @click="toggleEdit" class="divider-link">
          取消
        </a>
      </el-divider>
    </Transition>
    <div class="submit-list-box">
      <ImportSubmitList v-model="model"></ImportSubmitList>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.style-box {
  overflow: hidden;
  transition: height 0.8s ease-in-out;
  // transition: height 1s;
}

.el-divider {
  width: 90%;
  height: 0;
  margin: 0 auto;
  transition: all 0.5s;
  --el-border-color: var(--color-border);
  :deep() {
    .el-divider__text {
      background-color: var(--color-background);
      transition: background-color 0.5s;
      border-radius: 10px;
      overflow: hidden;
    }
  }
}
.divider-link {
  font-size: 12px;
  font-weight: bold;
  color: var(--el-color-primary); // 未访问链接的颜色
  text-decoration: none; // 平时不显示下划线

  &:hover {
    color: var(--el-color-success); // 悬停时的颜色
  }
}

.control-box.submit {
  margin-bottom: 0;
}
.submit-list-box {
  margin-top: 20px;
}
</style>
