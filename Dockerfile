#
# ---- Base ----
FROM node:alpine AS base
# set working directory
WORKDIR /app
# copy project file
COPY package.json .

#
# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN yarn install --production --frozen-lockfile
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN yarn install --frozen-lockfile

#
# ---- Build ----
FROM base AS build
# copy app sources
COPY src ./src
# copy build config files
COPY tsconfig.json webpack.config.js ./
# copy node_modules
COPY --from=dependencies /app/node_modules ./node_modules
# build app
RUN yarn run build

#
# ---- Release ----
FROM alpine AS release
# set working directory
WORKDIR /app
# set tini as our init process
ENTRYPOINT [ "tini", "--" ]
# update base system
RUN	apk update && apk upgrade 
# install packages
RUN apk add --no-cache npm tini
# install pm2
RUN npm install -g pm2
# copy config files
COPY .env.defaults ./
# copy docker specific files
COPY docker /
# copy production node_modules
COPY --from=dependencies /app/prod_node_modules ./node_modules
# copy app build
COPY --from=build /app/build ./
# expose port and define CMD
EXPOSE 4000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]