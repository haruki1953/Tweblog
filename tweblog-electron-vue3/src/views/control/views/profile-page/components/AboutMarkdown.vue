<script setup lang="ts">
import { profileUpdateAboutMdApi } from '@/api'
import { useProfileStore } from '@/stores'
import { sakiMessage } from '@/utils'
import { ref, watch } from 'vue'

const profileStore = useProfileStore()

const aboutMarkdown = ref(profileStore.aboutMarkdown)

const initData = () => {
  aboutMarkdown.value = profileStore.aboutMarkdown
}

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

const isSubmiting = ref(false)
const submit = async () => {
  isSubmiting.value = true
  try {
    const res = await profileUpdateAboutMdApi({
      aboutMarkdown: aboutMarkdown.value
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
</script>
<template>
  <div class="about-markdown">
    <div class="control-lable">修改关于页 Markdown 文档</div>
    <div class="form-box">
      <div class="form-row">
        <div class="input-lable">Markdown</div>
        <el-input
          v-model="aboutMarkdown"
          placeholder="# Markdown"
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
          resize="none"
          class="control-textarea"
        ></el-input>
      </div>
    </div>
    <div class="button-box">
      <!-- <el-button type="primary" round>
        关于页
      </el-button> -->
      <el-button @click="submit" :loading="isSubmiting" type="success" round>
        保存
      </el-button>
      <el-button @click="initData" type="info" round> 取消 </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.form-box {
  max-width: 700px;
}
</style>
