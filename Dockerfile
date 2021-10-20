FROM node:alpine AS builder

ARG BUILD_ARG=dist:prod

WORKDIR /app
COPY . .
RUN npm install -g npm@7.15.0
RUN npm install -g lerna
RUN cd /app/ts-client-library && rm package-lock.json && npx lerna bootstrap
RUN cd /app/opaque && npm install
RUN cd /app/ && npm install && npm run $BUILD_ARG

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=builder /app/dist .

ENTRYPOINT ["nginx", "-g", "daemon off;"]