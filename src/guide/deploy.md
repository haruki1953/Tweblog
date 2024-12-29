# 部署
如果网络没问题，推荐使用 [方法 1: 从 Docker Hub 拉取部署](#方法-1-从-docker-hub-拉取部署)，否则请使用 [方法 2: 手动请求并加载镜像](#方法-2-手动请求并加载镜像)

为了保证 Tweblog 在每次更新之后数据不丢失，请准备好保存数据的文件夹。
```sh
mkdir -p ${HOME}/Tweblog/data
cd ${HOME}/Tweblog
```

## 方法 1: 从 Docker Hub 拉取部署 
如果有代理软件的话，可以尝试先设置代理
```sh
export http_proxy=http://127.0.0.1:10809/
export https_proxy=http://127.0.0.1:10809/
```

从 Docker Hub 拉取部署 
```sh
docker run -d \
	--name Tweblog \
	-v ${HOME}/Tweblog/data:/app/data \
	-p 51125:51125 \
	--restart unless-stopped \
	tweblog:0.0.0
```

查看日志
```sh
docker logs Tweblog
```


## 方法 2: 手动请求并加载镜像
```sh
# 将文件下载到当前目录
curl -L -O https://sakiko.top/d/onedrive/Sakiko/Project/Tweblog/20241228/tweblog-build-241228-132538.tar

# 加载镜像
docker load -i tweblog-build-241228-132538.tar

# 启动容器
docker run -d \
	--name tweblog-run-241228-132538 \
	-v /root/tweblog-run-241228-132538/data:/app/data \
	-p 51125:51125 \
	--restart unless-stopped \
	tweblog-build-241228-132538:0.0.0

# 查看日志
docker logs tweblog-run-241228-132538

```


