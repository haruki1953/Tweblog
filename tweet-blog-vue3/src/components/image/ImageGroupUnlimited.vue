<script setup lang="ts">
import type { Image } from '@/types'
import { imageListToMax4GroupList } from '@/utils'
import { computed } from 'vue'

const imgIndex = defineModel<number>('index')

const props = withDefaults(
  defineProps<{
    data: Image[]
    backgroundColor?: '' | 'soft'
    notPreview?: boolean
    mini?: boolean
    aspectRatio169?: boolean
    notAlt?: boolean
  }>(),
  {
    backgroundColor: '',
    notPreview: false,
    mini: false,
    aspectRatio169: false,
    notAlt: false
  }
)

const imageGroupDataList = computed(() => {
  return imageListToMax4GroupList(props.data)
})
</script>
<template>
  <div class="image-group-unlimited">
    <ImageGroup
      v-for="(item, index) in imageGroupDataList"
      :key="item.map((i) => i.id).toString()"
      :data="item"
      :dataAll="data"
      :notRadiusTop="index !== 0"
      :notRadiusBottom="index !== imageGroupDataList.length - 1"
      :backgroundColor="backgroundColor"
      :notPreview="notPreview"
      :mini="mini"
      :aspectRatio169="aspectRatio169"
      :notAlt="notAlt"
      v-model:index="imgIndex"
    ></ImageGroup>
  </div>
</template>

<style lang="scss" scoped></style>
