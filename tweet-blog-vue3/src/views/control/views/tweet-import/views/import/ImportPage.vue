<script setup lang="ts">
import { ref } from 'vue'
import ImportProcess from './components/ImportProcess.vue'
import ImportSubmit from './components/ImportSubmit.vue'
import ImportTask from './components/ImportTask.vue'
import type { ImportPostList } from '@/types'

const importPosts = ref<ImportPostList>([])
</script>
<template>
  <div class="import-page">
    <ImportProcess v-model="importPosts"></ImportProcess>
    <ImportTask></ImportTask>
    <Transition name="fade">
      <ImportSubmit
        v-model="importPosts"
        v-if="importPosts.length !== 0"
      ></ImportSubmit>
    </Transition>
  </div>
</template>

<style lang="scss" scoped></style>
