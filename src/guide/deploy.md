# Web版

**DockerHub：** https://hub.docker.com/r/harukiowo/tweblog

目前只能用 docker 部署 Tweblog Web版，部署前请确认已经安装了 [docker](https://docs.docker.com/)

为了保证 Tweblog 在每次更新之后数据不丢失，请准备好保存数据的文件夹。
```sh
mkdir -p ${HOME}/Tweblog/data
cd ${HOME}/Tweblog
```

## 使用 docker 部署 Tweblog
运行以下命令
```sh
docker run -d \
	--name Tweblog \
	-v ${HOME}/Tweblog/data:/app/data \
	-p 51125:51125 \
	--restart unless-stopped \
	harukiowo/tweblog:1.3.0
```

部署完成后，使用命令查看日志
```sh
docker logs Tweblog
```

输出以下内容，部署成功
```
  ========================================
			  Tweblog 已启动
  ========================================
  
  公开访问: http://127.0.0.1:51125/
  
  管理访问: http://127.0.0.1:51125/admin/
  默认用户名: admin
  默认密码: adminadmin

  https://tweblog.com/
  https://github.com/haruki1953/Tweblog
  
  ========================================
```
::: info 注意
日志中如果没有信息，可能需要再等待几秒（并重新执行日志查看命令），数据库初始化需要一点时间
:::

如果有网络问题，可以参考下面的 docker [代理配置](#docker-代理配置)

## 开始使用
访问位于 `/admin/` 路径的管理页面，使用默认用户名与密码登录

::: warning 项目部署后，第一要务是修改用户名与密码
在管理页面中，点击屏幕下方控制条中的设置按钮，进入系统设置页面修改用户名与密码

常见问题：[忘记密码](faq.md#忘记密码)
:::

关于 `/` 根路径的公开页面，任何访问的用户都能通过这个页面浏览推文


## docker 代理配置
代理配置 [Daemon proxy configuration](https://docs.docker.com/engine/daemon/proxy/)
```sh
vim /etc/docker/daemon.json
```
```json
{
  "proxies": {
    "http-proxy": "http://127.0.0.1:10809/",
    "https-proxy": "http://127.0.0.1:10809/"
  }
}
```
```sh
systemctl restart docker
```




