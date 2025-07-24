FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Для отладки/ручного входа используйте:
# CMD ["sh", "-c", "tail -f /dev/null"]

CMD ["npm", "run", "dev"]
