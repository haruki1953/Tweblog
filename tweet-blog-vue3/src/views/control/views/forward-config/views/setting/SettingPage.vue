<script setup lang="ts">
import SettingAllImageForwardDelete from './components/SettingAllImageForwardDelete.vue'
import SettingAllPostForwardDelete from './components/SettingAllPostForwardDelete.vue'
import SettingNotForwardDelete from './components/SettingNotForwardDelete.vue'
</script>
<template>
  <div class="forward-manage-page">
    <div class="control-box">
      <div class="control-row">
        <SettingNotForwardDelete></SettingNotForwardDelete>
      </div>
      <div class="control-divider"></div>
      <div class="control-row">
        <SettingAllPostForwardDelete></SettingAllPostForwardDelete>
      </div>
      <div class="control-divider"></div>
      <div class="control-row">
        <SettingAllImageForwardDelete></SettingAllImageForwardDelete>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
