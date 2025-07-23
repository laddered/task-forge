FROM node:20

WORKDIR /socket

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "server.js"]
# Для отладки/ручного входа используйте:
# CMD ["sh", "-c", "tail -f /dev/null"]
