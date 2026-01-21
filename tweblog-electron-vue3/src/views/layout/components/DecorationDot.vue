<script setup lang="ts">
import { useStatesStore } from '@/stores'
import { onMounted, watch } from 'vue'
import { ref } from 'vue'

const statesStore = useStatesStore()

const loading = ref(false)

const checkLoading = () => {
  if (!statesStore.isLoadingData) {
    return
  }
  if (loading.value) {
    return
  }
  loading.value = true

  // 只有每隔1.5s的时间点时，再判断当 isLoadingData 为 false，切换动画false
  // 因为动画的循环周期是1.5s，这样可以确保动画完整
  const interval = setInterval(() => {
    if (!statesStore.isLoadingData) {
      loading.value = false
      clearInterval(interval)
    }
  }, 1500) // 每隔1.5秒检查一次
}

watch(() => statesStore.isLoadingData, checkLoading)
onMounted(checkLoading)

defineExpose({
  loading
})
</script>

<template>
  <div class="decoration-box" :class="{ loading }">
    <div class="dot-box sakiko"></div>
    <div class="dot-box umiri"></div>
    <div class="dot-box uika"></div>
    <div class="dot-box nyamu"></div>
    <div class="dot-box mutsumi"></div>
  </div>
</template>

<style lang="scss" scoped>
.decoration-box {
  display: flex;
}
$dot-size: 12px;
.dot-box {
  width: $dot-size;
  height: $dot-size;
  border-radius: calc($dot-size / 2);
  margin: 0 5px;
  transition: transform 0.5s;
  transform: scale(1);
  // animation-name: dot;
  // animation-duration: 0.5s;
  // animation-iteration-count: 1;
}
$interval: 0.24s;
.sakiko {
  background-color: var(--el-color-primary);
  animation-delay: 0;
}
.umiri {
  background-color: var(--el-color-info);
  animation-delay: $interval * 1;
}
.uika {
  background-color: var(--el-color-warning);
  animation-delay: $interval * 2;
}
.nyamu {
  background-color: var(--el-color-danger);
  animation-delay: $interval * 3;
}
.mutsumi {
  background-color: var(--el-color-success);
  animation-delay: $interval * 4;
}

.loading .dot-box {
  // animation-name: dotScale;
  animation-name: loading;
  animation-duration: $interval * 5 + 0.3s;
  animation-iteration-count: infinite;
}

@keyframes loading {
  0% {
    transform: scale(1);
  }

  10% {
    transform: scale(1.5);
  }

  33% {
    transform: scale(1);
  }

  100% {
    transform: scale(1);
  }
}
</style>
