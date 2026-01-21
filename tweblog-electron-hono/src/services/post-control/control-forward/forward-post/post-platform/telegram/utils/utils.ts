// Telegram 的 PlatformPostId 格式为 @harukiOwO/45 (chatId/messageId)
// 解析 PlatformPostId
export const tgPlatformPostIdParseUtil = (input: string) => {
  const parts = input.split('/')
  if (parts.length !== 2 || isNaN(Number(parts[1]))) {
    return null
  }
  const [chatId, messageId] = parts
  return { messageId: Number(messageId), chatId }
}
// 拼接 PlatformPostId
export const tgPlatformPostIdStringifyUtil = ({ messageId, chatId }: {
  messageId: number
  chatId: string
}): string => {
  return `${chatId}/${messageId}`
}

// 自己的定义：chatId有@，而username没有。@harukiOwO -> harukiOwO
export const tgChatIdToUsernameUtil = (val: string): string => {
  if (!val.startsWith('@')) {
    return val
  }
  return val.slice(1)
}
export const tgUsernameToChatIdUtil = (val: string): string => {
  if (val.startsWith('@')) {
    return val
  }
  return `@${val}`
}

export const tgMessageToPlatformPostIdUtil = (message: {
  message_id: number
  chat: {
    id: number
    username?: string | undefined
  }
}) => {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    message_id,
    chat
  } = message
  const messageId = message_id
  const chatId = (() => {
    if (chat.username != null) {
      return tgUsernameToChatIdUtil(chat.username)
    }
    return String(chat.id)
  })()
  return tgPlatformPostIdStringifyUtil({
    messageId,
    chatId
  })
}
