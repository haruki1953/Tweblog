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
