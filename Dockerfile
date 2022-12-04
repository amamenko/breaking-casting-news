FROM node:alpine

WORKDIR /usr/src/app

# Installs latest Chromium (92) package.
RUN apk update && \
    apk upgrade && \ 
    apk add --no-cache \
    py3-pip \
    make \
    g++ \
    dumb-init \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm install
COPY . ./ 
EXPOSE 4000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "npm", "start" ]