<script setup lang="ts">
import {
  appInfo,
  platformKeyEnum,
  platformKeyMap,
  type PlatformKeyEnumValues
} from '@/config'
import type { ImportPostList } from '@/types'
import { ref, nextTick } from 'vue'
import {
  processHarToJsonList,
  processJsonToImportPostsByPlatform
} from './dependencies'
import { sakiMessage } from '@/utils'

const model = defineModel<ImportPostList>({
  required: true
})

const platform = ref<PlatformKeyEnumValues>(platformKeyMap.X.key)

const jsonData = ref('')
const jsonOption = ref('')

const jsonCancel = () => {
  jsonData.value = ''
  // jsonOption.value = ''
}

const isJsonProcessing = ref(false)
const jsonProcess = async () => {
  isJsonProcessing.value = true
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 100))
  try {
    // 首先尝试作为 har 解析（批量解析）
    let jsonList = processHarToJsonList({
      harData: jsonData.value
    })
    if (jsonList == null || jsonList.length === 0) {
      // 解析失败则单个解析
      jsonList = [jsonData.value]
    }

    let haveSuccess = false
    for (const jsonItem of jsonList) {
      try {
        const importPosts = processJsonToImportPostsByPlatform({
          platform: platform.value,
          jsonData: jsonItem,
          jsonOption: jsonOption.value
        })
        if (importPosts == null) {
          continue
        }
        haveSuccess = true
        importPostsAdd(importPosts)
      } catch (error) {
        //
      }
    }

    if (!haveSuccess) {
      throw new Error()
    }
    sakiMessage({
      type: 'success',
      message: '解析成功'
    })
    // 清空
    jsonCancel()
  } catch (error) {
    sakiMessage({
      type: 'error',
      message: '解析失败'
    })
  } finally {
    isJsonProcessing.value = false
  }
}

// 添加帖子数据至 model，并且不与其重复
const importPostsAdd = (importPosts: ImportPostList) => {
  const uniquePosts = []
  for (const newPost of importPosts) {
    const find = model.value.find(
      (existingPost) =>
        existingPost.platform === newPost.platform &&
        existingPost.platformId === newPost.platformId
    )
    if (find) {
      continue
    }
    uniquePosts.push(newPost)
  }

  model.value.unshift(...uniquePosts)
}
</script>
<template>
  <div class="import-process">
    <div class="control-box">
      <div class="control-row">
        <div class="control-lable-with-link">
          <div class="lable">推文导入</div>
          <a
            class="link"
            :href="appInfo.importDocs.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ appInfo.importDocs.text }}
          </a>
        </div>
        <div class="form-box">
          <div class="form-row">
            <div class="control-radio">
              <el-radio-group v-model="platform">
                <template v-for="key in platformKeyEnum" :key="key">
                  <el-radio :value="key" v-if="platformKeyMap[key].couldImport">
                    {{ platformKeyMap[key].name }}
                  </el-radio>
                </template>
              </el-radio-group>
            </div>
          </div>
          <div class="form-row">
            <div class="input-lable">json数据</div>
            <el-input
              v-model="jsonData"
              placeholder=""
              type="textarea"
              :rows="10"
              resize="none"
              class="control-textarea consolas"
            ></el-input>
          </div>
          <div class="form-row">
            <div class="input-lable">json选项</div>
            <el-input
              v-model="jsonOption"
              placeholder="选填，某些平台的导入会用到"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 10 }"
              resize="none"
              class="control-textarea consolas"
            ></el-input>
          </div>
        </div>
        <div class="button-box">
          <el-button
            @click="jsonProcess"
            :loading="isJsonProcessing"
            type="primary"
            round
          >
            解析
          </el-button>
          <el-button @click="jsonCancel" type="info" round> 清空 </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.form-box {
  max-width: 700px;
}
</style>
