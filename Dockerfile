FROM node:14-alpine
WORKDIR /usr/src/app
RUN apk add --nocache udev ttf-freefont chromium git
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser
COPY package*.json ./
RUN npm install 
COPY . ./ 
EXPOSE 4000 
RUN npm run build build 
CMD [ "npm", "start" ]