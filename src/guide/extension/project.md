# 项目说明

- 后端 https://github.com/haruki1953/tweet-blog-hono
- 前端1（管理） https://github.com/haruki1953/tweet-blog-vue3
- 前端2（公开） https://github.com/haruki1953/tweet-blog-public-vue3
- 桌面版后端 https://github.com/haruki1953/tweblog-electron-hono
- 桌面版前端 https://github.com/haruki1953/tweblog-electron-vue3

关于Web版与桌面版
```
Web版 tweet-blog-hono
桌面版 tweblog-electron-hono

所有主要的修改，都应该先在Web版进行，然后再根据git记录来修改桌面版

以下是Web版 tweet-blog-hono 的说明
```

## 开发

```sh
# 安装项目依赖
pnpm install

# 启动开发服务器
pnpm dev
```

后端将运行在 3000 端口，之后将前端 tweet-blog-vue3 配置并启动即可

关于两个前端的信息
```
前端1（管理） tweet-blog-vue3
前端2（公开） tweet-blog-public-vue3

tweet-blog-vue3 是主要的，需要登录，可以进行发送推文等操作
tweet-blog-public-vue3 是公开的，没有登录页面，任何用户都可以通过它来浏览推文
```

关于数据储存路径
```
对于Web版，数据存放在项目目录下的 data 文件夹中
路径配置： src\configs\system.ts
```

关于 Drizzle
```
在项目启动时，会自动进行迁移（没有数据库则会创建数据库），详见 src\db\index.ts

当数据库 src\db\schema.ts 修改时，使用以下命令生成迁移记录：
pnpm drizzle-kit generate

再次启动项目，即可自动进行迁移。
也可以通过命令迁移：
pnpm drizzle-kit migrate
```

## 打包
在生产环境运行时，一共有两个前端要被本后端（Web版）托管，要将其打包并存放在 static 文件夹下
```sh
# 要注意顺序，因为有 emptyOutDir
# 注意应该在对应的前端执行，并且应确保其 src\config\config.ts 中的后端路径正确

# tweet-blog-public-vue3
pnpm build --outDir ../tweet-blog-hono/static --emptyOutDir

# tweet-blog-vue3
pnpm build --outDir ../tweet-blog-hono/static/admin --emptyOutDir
```

然后需要修改 Dockerfile ，代理设置需要根据自己的情况修改或删除
```Dockerfile
ENV http_proxy=http://192.168.2.110:10811/
ENV https_proxy=http://192.168.2.110:10811/
```

docker 命令
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


