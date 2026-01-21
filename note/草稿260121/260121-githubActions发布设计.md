项目目录
```
https://github.com/Tweblog/tweblog
- LICENSE.md
- note/
- other/
- README.md
- Tweblog/
- tweblog-electron-hono/
- tweblog-electron-vue3/
- tweet-blog-hono/
- tweet-blog-public-vue3/
- tweet-blog-vue3/
```

基础
```
name: Release

on:
  release:
    types: [published]   # 当发布 Release 时触发
  workflow_dispatch:     # 也允许手动触发

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

permissions:
  id-token: write        # 用于 OIDC 身份令牌，生成签名证明
  contents: write        # 需要写权限才能上传 Release 资产，同时包含读权限
  attestations: write    # 写入 attestation 记录
  packages: write        # 如果工件要发布到 GitHub Packages，需要写权限

```


```
优先前端构建，即先构建前端并作为工件以便后面使用
前端构建部分，四个job，并行执行
前端用的都是pnpm version: 10.8.1

1 tweet-blog-vue3 主管理前端构建

2 tweet-blog-public-vue3 公开前端构建

3 tweblog-electron-hono 用于桌面端的前端构建

4 Tweblog vitepress文档构建将用于桌面端
这个特殊，在构建还要设置环境变量 export LOCAL_DOCS=true


然后是后端部分，等前端都完毕可开始
分别是 docker 和 桌面端，

tweet-blog-hono 是普通后端用于docker
先下载前端工件
tweet-blog-hono/static 中下载公开前端工件
tweet-blog-hono/static/admin 中下载主管理前端工件
然后即可docker打包
工作目录为 tweet-blog-hono
使用 tweet-blog-hono/Dockerfile.release
然后生成构建证明

tweblog-electron-hono 是桌面端后端主要目录
要在 windows 上进行，因为我要得到的是用于win的桌面端应用
其实我还想尝试在 linux 和 mac，不知道有没有问题，也试试吧
先下载前端工件
tweblog-electron-hono/static 中下载公开前端工件
tweblog-electron-hono/static/admin 中下载主管理前端工件
tweblog-electron-hono/static/desktop 中下载用于桌面端的前端工件
tweblog-electron-hono/static/docs 中下载vitepress文档前端
用的是yarn version: 1.22.22
然后yarn安装依赖
然后 yarn make
它好像会在像是这样的位置，像是这样的文件名
tweblog-electron-hono/out/make/zip/win32/x64/tweblog-win32-x64-1.3.0.zip
然后上传至release， svenstaro/upload-release-action@v2
是不是不需要指定文件名，应该这样对吗 tweblog-electron-hono/out/make/zip/*/*/*.zip
或者这样？ tweblog-electron-hono/out/make/*/*/*/*
然后生成构建证明
```