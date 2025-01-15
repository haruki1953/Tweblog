# 常见问题

## 忘记密码

用户名与密码等信息保存在 `data/admin.json`
```json
{
  "username": "admin",
  "password": "$2a$10$Vc04g2biHOr1XNrA7NcA.exvSQ9jILXD7X47NvwZwyfDMYbJTIcYy",
  "jwtAdminSecretKey": "XicBcdsYvTIFsQ8XDQMa1QczzPXPCJYVoAwz1FpXMJY=",
  "jwtAdminExpSeconds": 864000,
  "loginMaxFailCount": 10,
  "loginLockSeconds": 36000,
  "proxyAddressHttp": ""
}
```

将 `"username":` `"password":` ，这两行删除，并重启 Tweblog，即可将用户名与密码重置为默认
```sh
# 重启Docker容器
docker restart Tweblog
```

## 数据保存结构

```
\---data
    |   admin.json
    |   file.json
    |   forward.json
    |   profile.json
    |   task.json
    |   sqlite.db
    \---public
        +---avatar
        |       3e58da4a-bebe-4c16-bf66-60db65ccff16.jpeg
        |       ...
        +---icon
        |       18c0f567-d915-45b6-9612-843f45186eeb.jpeg
        |       ...
        \---image
            +---large
            |   +---00
            |   |       0312a82f-e98a-4458-bfc8-e3112229cd8c.jpeg
            |   |       ...
            |   +---01
            |   |       65507662-ed77-49bf-91e0-9fe97c9d35ce.jpeg
            |   |       ...
            |   ...
            +---original
            |   +---01
            |   |       65507662-ed77-49bf-91e0-9fe97c9d35ce.jpeg
            |   |       ...
            |   +---02
            |   |       3a70f599-9c16-4f1e-a06c-ef859a93444f.jpeg
            |   |       ...
            |   ...
            \---small
                +---00
                |       0312a82f-e98a-4458-bfc8-e3112229cd8c.jpeg
                |       ...
                +---01
                |       65507662-ed77-49bf-91e0-9fe97c9d35ce.jpeg
                |       ...
                ...
```

### 各文件用途
- **admin.json** 保存系统配置
- **file.json** 图片等文件配置
- **forward.json** 转发配置
- **profile.json** 个人资料
- **task.json** 任务进度信息
- **sqlite.db** 数据库文件
- **public** 文件夹，被后端静态文件托管

::: info 配置文件特性
在 Tweblog 启动时，如果配置文件中某一项缺失，则将会尝试自动修复（重置为默认值），并将记录日志
:::

### 图片文件解释
关于 `avatar` 和 `icon` 文件夹，保存的是头像和图标，其信息被记录在 `profile.json`

关于 `image` 文件夹，保存的是推文的图片， `small` `large` `original` 分别代表小图、大图、原图，其信息被记录在数据库。为了避免单个文件夹中包含过多文件，每次创建图片时会生成一个两位随机数作为文件夹名称，优化服务器的响应速度。



