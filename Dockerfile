FROM node:9
ADD . /code
WORKDIR /code
RUN npm install
