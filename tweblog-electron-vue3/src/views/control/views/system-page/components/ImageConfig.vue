<script setup lang="ts">
import { useAdminStore } from '@/stores'
import { watch } from 'vue'
import { ref } from 'vue'
import { sakiMessage, useInputNumberStepIntOptimization } from '@/utils'
import { adminUpdateImageConfigApi } from '@/api'

const adminStore = useAdminStore()

const imageLargeMaxLength = ref<number>(adminStore.imageLargeMaxLength || 1)
const imageSmallMaxLength = ref<number>(adminStore.imageSmallMaxLength || 1)
const imageQuality = ref<number>(adminStore.imageQuality || 1)

// 十进制整数动态步进
const {
  optimizationStep: imageLargeMaxLengthStep,
  optimizationOnBlur: imageLargeMaxLengthOnBlur
} = useInputNumberStepIntOptimization({
  refNumber: imageLargeMaxLength
})
const {
  optimizationStep: imageSmallMaxLengthStep,
  optimizationOnBlur: imageSmallMaxLengthOnBlur
} = useInputNumberStepIntOptimization({
  refNumber: imageSmallMaxLength
})

const initData = () => {
  imageLargeMaxLength.value = adminStore.imageLargeMaxLength || 1
  imageSmallMaxLength.value = adminStore.imageSmallMaxLength || 1
  imageQuality.value = adminStore.imageQuality || 1
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
    const res = await adminUpdateImageConfigApi({
      imageLargeMaxLength: imageLargeMaxLength.value,
      imageSmallMaxLength: imageSmallMaxLength.value,
      imageQuality: imageQuality.value
    })
    // await adminStore.loadImageConfig()
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
  <div class="image-config">
    <div class="control-lable">修改图片配置</div>
    <div
      class="loading-box"
      v-loading="adminStore.isLoading"
      element-loading-background="var(--color-background-soft)"
    >
      <div class="form-box">
        <div class="form-row unit-input-box">
          <div class="input-lable">大图的边长最大值</div>
          <el-input-number
            v-model="imageLargeMaxLength"
            :min="imageSmallMaxLength"
            :step="imageLargeMaxLengthStep"
            @blur="imageLargeMaxLengthOnBlur"
            class="control-input"
            size="large"
            title=""
          />
          <div class="unit-mark">px</div>
        </div>
        <div class="form-row unit-input-box">
          <div class="input-lable">小图的边长最大值</div>
          <el-input-number
            v-model="imageSmallMaxLength"
            :min="1"
            :max="imageLargeMaxLength"
            :step="imageSmallMaxLengthStep"
            @blur="imageSmallMaxLengthOnBlur"
            class="control-input"
            size="large"
            title=""
          />
          <div class="unit-mark">px</div>
        </div>
        <div class="form-row unit-input-box">
          <div class="input-lable">图片质量</div>
          <el-input-number
            v-model="imageQuality"
            :min="1"
            :max="100"
            class="control-input"
            size="large"
            title=""
          />
          <div class="unit-mark">1-100</div>
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

.loading-box {
  :deep() {
    .el-loading-mask {
      z-index: 2;
    }
  }
}

.form-box.form-box {
  margin-bottom: 20px;
}
.unit-input-box {
  position: relative;
  .unit-mark {
    position: absolute;
    font-size: 10px;
    color: var(--color-text-soft);
    right: 48px;
    bottom: 2px;
    user-select: none;
  }
}
</style>
