export const authRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{1,32}$/,
      message: '用户名必须是 1-32位 的字符，只能包含字母数字下划线',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{6,32}$/,
      message: '密码必须是 6-32位 的字符，只能包含字母数字下划线',
      trigger: 'blur'
    }
  ]
}

export const imageRule = {
  // 允许的文件类型
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  typeError: '请选择 jpg、png 或 gif 格式的图片文件',
  // 允许的大小
  maxSize: 20 * 1024 * 1024,
  sizeError: '图片不能超过 20MB'
}
