FROM node:23-alpine3.19

RUN apk update && \
    apk add git