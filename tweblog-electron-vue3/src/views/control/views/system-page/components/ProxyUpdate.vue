<script setup lang="ts">
import { useAdminStore } from '@/stores'
import { watch } from 'vue'
import { ref } from 'vue'
import { sakiMessage } from '@/utils'
import { adminUpdateProxyApi } from '@/api'
import { Compass } from '@element-plus/icons-vue'
import { appInfo } from '@/config'

const adminStore = useAdminStore()

const proxyAddressHttp = ref<string>(adminStore.proxyAddressHttp)

const initData = () => {
  proxyAddressHttp.value = adminStore.proxyAddressHttp
}

// adminStore 在加载中时，应禁用表单
// adminStore 加载后，应初始化数据
watch(
  () => adminStore.isLoading,
  () => {
    if (adminStore.isLoading) {
      return
    }
    initData()
  }
)

const isSubmiting = ref(false)
const submit = async () => {
  isSubmiting.value = true
  try {
    const res = await adminUpdateProxyApi({
      proxyAddressHttp: proxyAddressHttp.value
    })
    // await adminStore.loadInfo()
    adminStore.loadInfoByResData(res.data.data)
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
  <div class="admin-info">
    <div class="control-lable-with-link">
      <div class="lable">配置代理</div>
      <a
        class="link"
        type="primary"
        :href="appInfo.proxyDocs.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ appInfo.proxyDocs.text }}
      </a>
    </div>
    <div class="loading-box">
      <div class="form-box">
        <div class="form-row">
          <div class="input-lable">代理地址</div>
          <el-input
            v-model="proxyAddressHttp"
            :prefix-icon="Compass"
            placeholder="http://127.0.0.1: ..."
            size="large"
            class="control-input"
            clearable
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
  </div>
</template>

<style lang="scss" scoped>
// @use '../../../styles/control.scss';

.el-input {
  :deep() {
    .el-input__inner {
      font-family: 'Consolas', 'Courier New', monospace;
    }
  }
}
</style>
