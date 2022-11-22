# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json package.json
COPY client/package.json client/package.json
RUN npm install --silent
RUN cd client/ && npm install --silent

# add app
COPY . .

# start app
CMD ./scripts/start.sh