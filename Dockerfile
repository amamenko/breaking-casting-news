FROM node:14-alpine

WORKDIR /usr/src/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/google-chrome

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apk update && apk add gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apk update && \
  apk add google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install 
COPY . ./ 
EXPOSE 4000 
RUN npm run build build 
CMD [ "npm", "start" ]