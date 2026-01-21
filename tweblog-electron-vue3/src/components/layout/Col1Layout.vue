<script setup lang="ts"></script>
<template>
  <div class="col1-page">
    <div class="col1-box">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.col1-page {
  max-width: 550px;
  // margin: 20px auto;
  margin: 0 auto;
  padding: var(--layout-top) 0 var(--layout-bottom) 0;
}
// .col1-box {
// }
</style>
