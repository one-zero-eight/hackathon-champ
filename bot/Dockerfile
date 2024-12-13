FROM denoland/deno:alpine-2.1.4
WORKDIR /app
ADD . /app
RUN deno install --allow-import --entrypoint main.ts
CMD ["run", "--allow-net", "--allow-env", "--allow-import", "main.ts"]
