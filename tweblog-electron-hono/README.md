# Tweblog

- 网站 https://tweblog.com
- 文档 https://github.com/haruki1953/Tweblog
- 后端 https://github.com/haruki1953/tweet-blog-hono
- 前端1（管理） https://github.com/haruki1953/tweet-blog-vue3
- 前端2（公开） https://github.com/haruki1953/tweet-blog-public-vue3
- 桌面版后端 https://github.com/haruki1953/tweblog-electron-hono
- 桌面版前端 https://github.com/haruki1953/tweblog-electron-vue3

本仓库是从tweet-blog-hono修改而来的

## 开发

在开发环境中，web界面是由前端的开发服务器提供的，所以首先要运行前端 tweblog-electron-vue3
```
  ➜  Local:   http://localhost:5173/desktop/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

之后应该修改 `src\desktop\config.ts`，来指定electron所使用的前端的url
```ts
export const getUrlIndexHtml = () => 'http://localhost:5173/desktop/'
```

electron安装可能会遇到网络问题，需要用比较特别的方式配置代理：[electron安装的网络问题](#electron安装的网络问题)
```sh
# 安装项目依赖
yarn install

# 编译
yarn build

# 启动
yarn start

# 代码修改后都需要编译再启动，最好在编译前删除dist
rm -rf dist && yarn build && yarn start

# package.json
# "main": "dist/index.js",
```

```
open http://localhost:51125
```

关于Web版与桌面版
```
Web版 tweet-blog-hono
桌面版 tweblog-electron-hono

所有主要的修改，都应该先在Web版进行，然后再根据git记录来修改桌面版

src\desktop 是桌面版独有的，其中是 electron 相关的配置
对于桌面版的 src\index.ts 其与Web版最主要的区别是，调用了 src\desktop 中导出的 startElectronDesktop 来创建桌面窗口

electron 好像不能用 pnpm ，所以改用了 yarn
因为 electron 的特殊性，桌面版不能再像Web版一样用 dev 来启动了，而是应该 build 之后再 start
```

关于数据储存路径
```
对于Web版，数据存放在项目目录下的 data 文件夹中

对于桌面版，数据存放在当前用户的文档文件夹下，在开发时使用TweblogDev文件夹，在打包前应将其改为Tweblog
```
```ts
// src\configs\system.ts
// // 桌面版，保存在项目外部，像大多数软件一样将数据保存在文档
// export const systemDataPath = path.join(appElectron.getPath('documents'), 'Tweblog/data/')
// 桌面版开发时用临时的路径
export const systemDataPath = path.join(appElectron.getPath('documents'), 'TweblogDev/data/')
```

关于 Drizzle
```
在项目启动时，会自动进行迁移（没有数据库则会创建数据库），详见 src\db\index.ts

！！以下都是只应该在Web版 tweet-blog-hono 进行的操作
！！在桌面版不能生成迁移记录，因为对于桌面版来说 electron 的特殊性会导致 drizzle-kit 无法正确获取数据路径

当数据库 src\db\schema.ts 修改时，使用以下命令生成迁移记录：
pnpm drizzle-kit generate

再次启动项目，即可自动进行迁移。
也可以通过命令迁移：
pnpm drizzle-kit migrate
```

## 打包

在生产环境运行时，一共有三个前端要被本后端（桌面版）托管，要将其打包并存放在 static 文件夹下
```sh
# 要注意顺序，因为有 emptyOutDir
# 注意应该在对应的前端执行，并且应确保其 src\config\config.ts 中的后端路径正确

# tweet-blog-public-vue3
pnpm build --outDir ../tweblog-electron-hono/static --emptyOutDir

# tweet-blog-vue3
pnpm build --outDir ../tweblog-electron-hono/static/admin --emptyOutDir

# tweblog-electron-vue3
pnpm build --outDir ../tweblog-electron-hono/static/desktop --emptyOutDir
```

之后执行make命令进行打包，可能需要配置代理来保证其正常执行
```sh
export http_proxy=http://127.0.0.1:10809/
export https_proxy=http://127.0.0.1:10809/

yarn make
```
关于打包的更过信息请参考electron文档
- https://www.electronjs.org/zh/docs/latest/tutorial/forge-overview
- https://www.electronforge.io/

## 其他

### electron安装的网络问题
- https://www.electronjs.org/zh/docs/latest/tutorial/installation#%E4%BB%A3%E7%90%86
- https://github.com/gajus/global-agent/blob/v2.1.5/README.md#environment-variables
```sh
# cmd
set ELECTRON_GET_USE_PROXY=true
set GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE=GLOBAL_AGENT_
set GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:10809
set GLOBAL_AGENT_HTTPS_PROXY=http://127.0.0.1:10809

# bash
export ELECTRON_GET_USE_PROXY=true
export GLOBAL_AGENT_ENVIRONMENT_VARIABLE_NAMESPACE=GLOBAL_AGENT_
export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:10809
export GLOBAL_AGENT_HTTPS_PROXY=http://127.0.0.1:10809
```
现在node下载ELECTRON是走的代理。注意，这样设置的是临时环境变量，每次安装时都要设置