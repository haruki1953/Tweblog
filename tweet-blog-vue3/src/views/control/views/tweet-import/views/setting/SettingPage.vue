<script setup lang="ts">
import SettingExcessImportDelete from './components/SettingExcessImportDelete.vue'
import SettingAllPostImportDelete from './components/SettingAllPostImportDelete.vue'
import SettingAllImageImportDelete from './components/SettingAllImageImportDelete.vue'
</script>
<template>
  <div class="setting-page">
    <div class="control-box">
      <div class="control-row">
        <SettingExcessImportDelete></SettingExcessImportDelete>
      </div>
      <div class="control-divider"></div>
      <div class="control-row">
        <SettingAllPostImportDelete></SettingAllPostImportDelete>
      </div>
      <div class="control-divider"></div>
      <div class="control-row">
        <SettingAllImageImportDelete></SettingAllImageImportDelete>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
