FROM node:20.12.2-alpine3.19 AS base

# 构建阶段
FROM base AS builder
WORKDIR /app

# 设置代理
ENV http_proxy=http://192.168.2.110:10811/
ENV https_proxy=http://192.168.2.110:10811/

# 复制安装依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm、安装依赖
RUN npm install -g pnpm@8.15.3 && \
    pnpm install --frozen-lockfile

# 复制文件 tsconfig.json 和 entrypoint.sh
COPY tsconfig.json entrypoint.sh ./
# 复制目录 src、drizzle 和 static
COPY ./src ./src
COPY ./drizzle ./drizzle
COPY ./static ./static

# 生成PrismaClient、编译、修剪依赖、清理缓存
RUN pnpm build && \
    pnpm prune --prod && \
    pnpm store prune && \
    npm cache clean --force

# 取消代理
ENV http_proxy=
ENV https_proxy=

# 运行阶段
FROM base AS runner
WORKDIR /app

# 复制文件
COPY --from=builder /app/entrypoint.sh /app/entrypoint.sh
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/drizzle /app/drizzle
COPY --from=builder /app/static /app/static

# 声明数据卷
VOLUME ["/app/data"]

# 设置端口
ENV TWEBLOG_PORT=51125
EXPOSE 51125

ENTRYPOINT ["sh", "entrypoint.sh"]
