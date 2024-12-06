FROM node:22-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY ./nginx-server.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
