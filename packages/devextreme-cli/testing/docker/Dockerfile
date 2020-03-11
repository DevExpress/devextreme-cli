FROM buildkite/puppeteer

USER root

WORKDIR /usr/dx/app

COPY package.json ./

RUN yarn --prod

COPY . .

EXPOSE 9222

CMD [ "node", "index.js" ]
