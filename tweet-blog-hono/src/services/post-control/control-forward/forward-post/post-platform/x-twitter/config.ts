export const xtwitterConfig = {
  // 链接在显示时的长度限制
  linkContentMaxLength: 30,
  // 在推特发送推文输入链接时，好像不管链接长度，所代表的字数都会是23
  linkCharacterCountRepresentationInPost: 23,
  // 发推时的最大字数
  maxPostCharactersOnSend: 280,
  maxAltCharactersOnSend: 1000,
  // 最大图片数
  maxImageNumberOnSend: 4
} as const
