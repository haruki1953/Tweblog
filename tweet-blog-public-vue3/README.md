# Tweblog

- 网站 https://tweblog.com
- 文档 https://github.com/haruki1953/Tweblog
- 后端 https://github.com/haruki1953/tweet-blog-hono
- 前端1（管理） https://github.com/haruki1953/tweet-blog-vue3
- 前端2（公开） https://github.com/haruki1953/tweet-blog-public-vue3
- 桌面版后端 https://github.com/haruki1953/tweblog-electron-hono
- 桌面版前端 https://github.com/haruki1953/tweblog-electron-vue3

关于两个前端的信息
```
前端1（管理） tweet-blog-vue3
前端2（公开） tweet-blog-public-vue3

tweet-blog-vue3 是主要的，需要登录，可以进行发送推文等操作
tweet-blog-public-vue3 是公开的，没有登录页面，任何用户都可以通过它来浏览推文
```

运行前要在 `src\config\config.ts` 修改后端 tweet-blog-hono 的路径
```ts
// 开发时使用的
const apiBaseUrl = 'http://localhost:3000/api/public/'
const staticBaseUrl = 'http://localhost:3000/'

// // 这是为了在手机上测试，需要的话要改为自己电脑的ip
// const apiBaseUrl = 'http://192.168.2.110:3000/api/public/'
// const staticBaseUrl = 'http://192.168.2.110:3000/'

// // 部署时，将由后端来托管前端，设置为根路径
// const apiBaseUrl = '/api/public/'
// const staticBaseUrl = '/'
```

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
