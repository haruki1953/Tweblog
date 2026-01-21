export const discordConfig = {
  // 发推时的最大字数（length即可）
  maxPostCharactersOnSend: 2000,
  maxAltCharactersOnSend: 1000,
  // 最大图片数（其实discord并没有限制数量，但是限制了总大小10M，姑且算作10个）
  maxImageNumberOnSend: 10
} as const
