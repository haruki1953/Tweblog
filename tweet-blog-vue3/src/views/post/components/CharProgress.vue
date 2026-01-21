<script setup lang="ts">
import {
  platformKeyMap,
  postConfig,
  type PlatformKeyEnumValues
} from '@/config'
import type { PostContentPart } from '@/types'
import {
  textToPostContentPart,
  textToPostContentPartCalcCharNumber
} from '@/utils'
import { computed } from 'vue'

const model = defineModel<string>({ required: true })
// const props = defineProps<{
//   text: string
// }>()

const props = withDefaults(
  defineProps<{
    platform: PlatformKeyEnumValues
  }>(),
  {
    platform: platformKeyMap.X.key
  }
)

// 【250209】根据不同平台进行不同的计数方法
const platformCountInfo = computed(() => {
  // Bluesky
  if (props.platform === platformKeyMap.Bluesky.key) {
    return {
      calcCharNumber: (str: string) => {
        const contentPart = textToPostContentPart(str)
        const contentForShow =
          textByPostContentPartAndLinkByContent(contentPart)
        return contentForShow.length
      },
      maxPostCharacters: postConfig.maxPostCharactersOnSendBluesky,
      remainingCharsToWarning: postConfig.remainingCharsToWarningBluesky
    }
  }
  // Discord
  if (props.platform === platformKeyMap.Discord.key) {
    return {
      calcCharNumber: (str: string) => str.length,
      maxPostCharacters: postConfig.maxPostCharactersOnSendDiscord,
      remainingCharsToWarning: postConfig.remainingCharsToWarningDiscord
    }
  }
  // Telegram
  if (props.platform === platformKeyMap.Telegram.key) {
    return {
      calcCharNumber: (str: string) => str.length,
      maxPostCharacters: postConfig.maxPostCharactersOnSendTelegram,
      remainingCharsToWarning: postConfig.remainingCharsToWarningTelegram
    }
  }
  // X
  return {
    calcCharNumber: textToPostContentPartCalcCharNumber,
    maxPostCharacters: postConfig.maxPostCharactersOnSend,
    remainingCharsToWarning: postConfig.remainingCharsToWarning
  }
})

const charNum = computed(() => {
  // console.log(textToPostContentPartCalcCharNumber(model.value))
  // return textToPostContentPartCalcCharNumber(model.value)
  // 【250209】根据不同平台进行不同的计数方法
  return platformCountInfo.value.calcCharNumber(model.value)
})

const percentage = computed(() => {
  // const rawPercentage =
  //   (charNum.value / postConfig.maxPostCharactersOnSend) * 100
  // 【250209】根据不同平台进行不同的计数方法
  const rawPercentage =
    (charNum.value / platformCountInfo.value.maxPostCharacters) * 100
  return Math.min(100, Math.max(0, Math.round(rawPercentage)))
})

const remainingChars = computed(() => {
  // return postConfig.maxPostCharactersOnSend - charNum.value
  // 【250209】根据不同平台进行不同的计数方法
  return platformCountInfo.value.maxPostCharacters - charNum.value
})

const progressStatus = computed(() => {
  if (remainingChars.value <= 0) {
    return 'exception'
    // } else if (remainingChars.value <= postConfig.remainingCharsToWarning) {
    // 【250209】根据不同平台进行不同的计数方法
  } else if (
    remainingChars.value <= platformCountInfo.value.remainingCharsToWarning
  ) {
    return 'warning'
  } else {
    return ''
  }
})

// 【bluesky】将PostContentPart[]拼接为字符串，这个将在解析链接后使用
const textByPostContentPartAndLinkByContent = (
  postContent: PostContentPart[]
): string => {
  let text = ''
  for (const p of postContent) {
    if (p.type === 'link') {
      // text += p.href
      // 【bluesky】应拼接链接显示的内容，因为之后会附加指定连接
      text += p.content
    } else {
      text += p.content
    }
  }
  return text
}
</script>
<template>
  <div class="char-progress">
    <!-- <Transition name="fade-pop"> -->
    <div class="progress-circle">
      <!-- v-show="remainingChars >= -99 || remainingChars < -999" -->
      <el-progress
        type="circle"
        :percentage="percentage"
        :status="progressStatus"
        :class="progressStatus"
        :width="30"
        :stroke-width="3"
        :show-text="false"
      />
    </div>
    <!-- </Transition> -->
    <Transition name="fade-pop">
      <div
        class="progress-lable"
        :class="progressStatus"
        v-if="
          remainingChars <= platformCountInfo.remainingCharsToWarning &&
          remainingChars >= -99
        "
      >
        {{ remainingChars }}
      </div>
      <div class="progress-lable" :class="progressStatus" v-else>
        <el-icon :class="platformKeyMap[platform].fontawesomeClass"></el-icon>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
$progressWidth: 30px;
$progressHeight: 30px;
.char-progress {
  width: $progressWidth;
  height: $progressHeight;
  position: relative;
  user-select: none;
  .progress-circle {
    width: $progressWidth;
    height: $progressHeight;
    position: absolute;
    :deep() {
      .el-progress-circle__track {
        stroke: var(--el-color-primary-light-7);
        transition: all 0.5s;
      }
      .el-progress-circle__path {
        stroke: var(--el-color-primary);
      }
      .warning {
        .el-progress-circle__track {
          stroke: var(--el-color-warning-light-7);
        }
        .el-progress-circle__path {
          stroke: var(--el-color-warning);
        }
      }
      .exception {
        .el-progress-circle__track {
          stroke: var(--el-color-danger-light-7);
        }
        .el-progress-circle__path {
          stroke: var(--el-color-danger);
        }
      }
    }
  }
  .progress-lable {
    width: $progressWidth;
    height: $progressHeight;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 12px;
    font-size: 12px;
    font-weight: bold;
    color: var(--color-text-soft);
    // color: var(--el-color-primary);
    transition: all 0.5s;
  }
  .warning {
    color: var(--el-color-warning);
  }
  .exception {
    color: var(--el-color-danger);
  }
}
</style>
