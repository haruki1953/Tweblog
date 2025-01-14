# 部署
<!-- 如果网络没问题，推荐使用 [方法 1: 从 Docker Hub 拉取部署](#方法-1-从-docker-hub-拉取部署)，否则请使用 [方法 2: 手动请求并加载镜像](#方法-2-手动请求并加载镜像) -->

为了保证 Tweblog 在每次更新之后数据不丢失，请准备好保存数据的文件夹。
```sh
mkdir -p ${HOME}/Tweblog/data
cd ${HOME}/Tweblog
```

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

## 从 Docker Hub 拉取部署 
```sh
docker run -d \
	--name Tweblog \
	-v ${HOME}/Tweblog/data:/app/data \
	-p 51125:51125 \
	--restart unless-stopped \
	harukiowo/tweblog:0.0.2
```

查看日志
```sh
docker logs Tweblog
```


<!-- ## 方法 2: 手动请求并加载镜像
```sh
# 将文件下载到当前目录
curl -L -O https://sakiko.top/d/onedrive/Sakiko/Project/Tweblog/0_0_1/tweblog-0_0_1.tar

# 加载镜像
docker load -i tweblog-0_0_1.tar

# 启动容器
docker run -d \
	--name Tweblog \
	-v ${HOME}/Tweblog/data:/app/data \
	-p 51125:51125 \
	--restart unless-stopped \
	harukiowo/tweblog:0.0.2

# 查看日志
docker logs Tweblog
``` 
-->


