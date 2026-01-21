<script setup lang="ts">
import { profileUpdateNameBioApi } from '@/api'
import { useProfileStore } from '@/stores'
import { sakiMessage } from '@/utils'
import { House } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'

const profileStore = useProfileStore()

const name = ref(profileStore.name)
const bio = ref(profileStore.bio)

const initData = () => {
  name.value = profileStore.name
  bio.value = profileStore.bio
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
    const res = await profileUpdateNameBioApi({
      name: name.value,
      bio: bio.value
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
  <div class="name-bio">
    <div class="control-lable">修改名称与简介</div>
    <div class="form-box">
      <div class="form-row">
        <div class="input-lable">名称</div>
        <el-input
          v-model="name"
          :prefix-icon="House"
          placeholder="请输入名称"
          size="large"
          class="control-input"
        ></el-input>
      </div>
      <div class="form-row">
        <div class="input-lable">简介</div>
        <el-input
          v-model="bio"
          placeholder="请输入简介"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 20 }"
          resize="none"
          class="control-textarea"
        ></el-input>
      </div>
    </div>
    <div class="button-box">
      <el-button @click="submit" :loading="isSubmiting" type="success" round>
        保存
      </el-button>
      <el-button @click="initData" type="info" round> 取消 </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';
</style>
