# 项目说明

- 后端 https://github.com/haruki1953/tweet-blog-hono
- 前端1（管理） https://github.com/haruki1953/tweet-blog-vue3
- 前端2（公开） https://github.com/haruki1953/tweet-blog-public-vue3


## 后端启动
```sh
# 安装项目依赖
pnpm install

# 生成Prisma Client
pnpm prisma generate

# 将Prisma schema推送到数据库，创建数据库
pnpm prisma db push

# 启动开发服务器
pnpm dev
```

开发服务器将运行在 3000 端口

## 前端启动
```sh
pnpm install
```

在启动前，需要改一下接口路径配置
```ts
// src\config\config.ts

// 启用
// 开发时使用的
const apiBaseUrl = 'http://localhost:3000/api/'
const staticBaseUrl = 'http://localhost:3000/'

// 注释掉
// // 部署时，将由后端来托管前端，设置为根路径
// const apiBaseUrl = '/api/'
// const staticBaseUrl = '/'
```

```sh
pnpm dev
```

## docker打包
将两个前端的接口路径配置正确，之后打包前端
```sh
# tweet-blog-vue3
# tweet-blog-public-vue3
pnpm build
```

打包后的 `tweet-blog-public-vue3/dist` 中的全部文件复制至后端 `tweet-blog-hono/static`，
打包后的 `tweet-blog-vue3/dist` 中的全部文件复制至后端 `tweet-blog-hono/static/admin`

然后需要修改 Dockerfile ，代理设置需要根据自己的情况修改或删除（有两处）
```Dockerfile
# 设置代理
ENV http_proxy=http://192.168.2.110:10811/
ENV https_proxy=http://192.168.2.110:10811/
```

之后在后端 `tweet-blog-hono` 目录中进行打包
```sh
# 构建
docker build -t tweblog-xxx:0.0.0 .

# 运行
docker run -d \
	--name Tweblog \
	-v ${HOME}/Tweblog/data:/app/data \
	-p 51125:51125 \
	--restart unless-stopped \
	tweblog-xxx:0.0.0

# 查看日志
docker logs Tweblog
```
