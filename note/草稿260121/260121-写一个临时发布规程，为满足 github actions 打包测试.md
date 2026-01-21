发布规程

## 版本更改

后端部分
```
tweet-blog-hono
tweblog-electron-hono
这两个目录是类似的，其中要在以下地方修改版本信息

package.json
src\configs\info.ts
```

tweblog-electron-hono 中还有一些配置要注意，其在测试时可能会修改，要保证其为以下
```ts
// src\configs\system.ts
export const systemDataPath = path.join(appElectron.getPath('documents'), 'Tweblog/data/')
// src\desktop\config.ts
export const getUrlIndexHtml = () => `http://127.0.0.1:${httpPort}/desktop/`
```

前端部分
```
tweet-blog-vue3
tweet-blog-public-vue3
tweblog-electron-vue3
这三个目录是类似的，其中要在以下地方修改版本信息

package.json
src\config\info.ts
```

正则替换
```
"version": "1.3.0.2-github-actions-test",
"version": "version",
```