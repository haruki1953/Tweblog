# 桌面版

**Github：** https://github.com/haruki1953/Tweblog

Tweblog 所有的版本更新都在 Github 以 release 形式发布，可在此处获取最新的压缩包，解压即用
- https://github.com/haruki1953/Tweblog/releases

理论上是支持 Windows、Linux、Mac 的，但是自己现在只成功打包了 Windows 版，其他的让我再琢磨琢磨


## Web端口

Tweblog 桌面版其实就是用 electron 对Web版进行了浏览器套壳，但这样也能发挥出Web版最大的优势：跨设备远程控制

![](./assets/2025-02-01_211451.jpg)

在局域网内，可以通过电脑的 IP地址 + Web端口 ，在手机或其他设备的浏览器中访问。

::: info 固定电脑的IP地址
为了使访问更方便建议在其他设备中收藏地址，这样的话有一点需要注意，必须固定电脑的IP地址。有多种方法可以设置，比较方便的是在路由器中设置，关键词是 `DHCP服务`
:::

## 数据保存

Tweblog 桌面版会像大多数软件一样，将数据保存在当前用户的文档文件夹下，如
```
C:\Users\Administrator\Documents\Tweblog\data
```

关于数据结构可以参考 [数据保存结构](./faq#数据保存结构)

## 转移至Web版
桌面版 与 Web版 的数据结构是一样的，这意味这当有了自己的服务器来部署Web版后，可以轻松地将数据转移至Web。

转移数据时，最好先将 Web版的 Tweblog/data 文件夹删除，然后 将桌面版的 data 文件夹打包为zip，上传至服务器后，使用 unzip 命令解压。

::: warning 注意
从桌面版转移至Web版之前，应先在桌面版设置用户名与密码。

不过忘记设置了也没关系，可以参考 [忘记密码](./faq#忘记密码) 来重置密码
:::


