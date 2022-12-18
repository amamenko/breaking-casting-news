FROM zenika/alpine-chrome:with-node

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /usr/src/app

COPY --chown=chrome package.json package-lock.json ./
RUN npm install
COPY --chown=chrome . ./ 
EXPOSE 4000
ENTRYPOINT ["tini", "--"]
CMD [ "npm", "start" ]