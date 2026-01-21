<script setup lang="ts">
import type CompleteMessageContainer from '@/components/layout/CompleteMessageContainer.vue'
import {
  forwardSettingDataDefaultAll,
  platformKeyEnum,
  platformKeyMap,
  type PlatformKeyEnumValues
} from '@/config'
import { Connection, Key, User } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash'
import { computed } from 'vue'
import { ref } from 'vue'
import type { UseForwardSettingListInFormControl } from './dependencies'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
  useForwardSettingListInFormControl: UseForwardSettingListInFormControl
  toggleEdit: () => void
}>()

const itemDefault = {
  uuid: '',
  name: platformKeyMap.X.name as string,
  platform: platformKeyMap.X.key as PlatformKeyEnumValues,
  data: cloneDeep(forwardSettingDataDefaultAll),
  isDeleted: false
}

// 表单中的数据
const item = ref(cloneDeep(itemDefault))

const uuidGenerate = () => {
  item.value.uuid = uuidv4()
}
uuidGenerate()

// const initData = () => {
//   item.value = cloneDeep(itemDefault)
//   uuidGenerate()
// }
// initData()

const onPlatformChange = () => {
  item.value.name = platformKeyMap[item.value.platform].name
  item.value.data = cloneDeep(itemDefault.data)
  uuidGenerate()
}

const dataDefault = computed(
  () => platformKeyMap[item.value.platform].forwardSettingDataDefault
)

const closeSetting = () => {
  props.toggleEdit()
}

const forwardSettingListInFormControl =
  props.useForwardSettingListInFormControl()

const addSetting = async () => {
  // 检查是否为空
  // 检查是否重复
  if (!couldAdd.value) {
    return
  }
  forwardSettingListInFormControl.addSetting(item.value)
  refCompleteMessageContainer.value?.success()
  await new Promise((resolve) => setTimeout(resolve, 300))
  closeSetting()
}

const couldAdd = computed(() => {
  // 检查是否为空
  if (item.value.uuid === '') {
    return false
  }
  let isDataNone = true
  for (const key in dataDefault.value) {
    if ((item.value.data as any)[key] !== '') {
      isDataNone = false
    }
  }
  if (isDataNone) {
    return false
  }
  // 检查是否重复
  const find = forwardSettingListInFormControl.findSetting(item.value.uuid)
  if (find) {
    return false
  }

  return true
})

const refCompleteMessageContainer = ref<InstanceType<
  typeof CompleteMessageContainer
> | null>(null)
</script>
<template>
  <div class="forward-setting-form">
    <CompleteMessageContainer
      ref="refCompleteMessageContainer"
      backgroundColor="var(--color-background-soft)"
    >
      <div class="form-box">
        <div class="form-row">
          <div class="form-fa-brand">
            <div class="left">
              <!-- <Transition name="fade">
                <el-icon :size="30" @click="moveUp" v-show="couldUp">
                  <ArrowUp />
                </el-icon>
              </Transition> -->
            </div>
            <Transition name="fade-pop" mode="out-in">
              <el-icon
                :class="platformKeyMap[item.platform].fontawesomeClass"
                :key="platformKeyMap[item.platform].fontawesomeClass"
                size="40"
              ></el-icon>
            </Transition>
            <div class="right">
              <!-- <Transition name="fade">
                <el-icon :size="30" @click="moveDown" v-show="couldDown">
                  <ArrowDown />
                </el-icon>
              </Transition> -->
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="control-radio">
            <el-radio-group v-model="item.platform" @change="onPlatformChange">
              <template v-for="key in platformKeyEnum" :key="key">
                <el-radio :value="key" v-if="platformKeyMap[key].couldForward">
                  {{ platformKeyMap[key].name }}
                </el-radio>
              </template>
            </el-radio-group>
          </div>
        </div>
        <div class="form-row">
          <div class="input-lable">
            uuid
            <a class="uuid-link" href="javascript:;" @click="uuidGenerate">
              生成
            </a>
          </div>
          <el-input
            v-model="item.uuid"
            :prefix-icon="Connection"
            size="large"
            class="control-input consolas"
          ></el-input>
        </div>
        <div class="form-row">
          <div class="input-lable">名称</div>
          <el-input
            v-model="item.name"
            :prefix-icon="User"
            size="large"
            class="control-input bold"
          ></el-input>
        </div>
        <Transition mode="out-in" name="fade">
          <div :key="item.platform">
            <template v-for="key in Object.keys(dataDefault)" :key="key">
              <div class="form-row">
                <div class="input-lable">{{ key }}</div>
                <el-input
                  v-model="(item.data as any)[key]"
                  :prefix-icon="Key"
                  size="large"
                  class="control-input consolas"
                ></el-input>
              </div>
            </template>
          </div>
        </Transition>
      </div>
      <Transition mode="out-in" name="fade">
        <div class="button-box edit" :key="item.platform">
          <el-button
            @click="addSetting"
            type="primary"
            round
            size="small"
            :disabled="!couldAdd"
          >
            添加
          </el-button>
          <el-button @click="closeSetting" type="info" round size="small">
            关闭
          </el-button>
        </div>
      </Transition>
    </CompleteMessageContainer>
  </div>
</template>

<style lang="scss" scoped>
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

.uuid-link {
  margin-left: 2px;
  color: var(--el-color-primary);
  text-decoration: none; // 平时不显示下划线

  &:hover {
    color: var(--el-color-success); // 悬停时的颜色
    // text-decoration: underline; // 悬停时显示下划线
  }
}

.el-input.consolas {
  :deep() {
    .el-input__inner {
      font-family: 'Consolas', 'Courier New', monospace;
    }
  }
}
.el-input.bold {
  :deep() {
    .el-input__inner {
      font-weight: bold;
    }
  }
}
</style>
