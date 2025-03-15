FROM node:lts-alpine AS build
WORKDIR /app
COPY client/package* .
RUN npm ci
COPY client .
RUN npm run build

FROM node:lts-alpine AS deploy
WORKDIR /app
COPY server/package* .
RUN npm ci
COPY server .
COPY --from=build /app/dist /app/public
ENTRYPOINT npm run prod
EXPOSE 80

