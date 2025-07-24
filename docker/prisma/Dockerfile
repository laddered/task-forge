FROM node:20

WORKDIR /prisma

COPY package*.json ./
RUN npm install

COPY . .

# Для отладки/ручного входа используйте:
# CMD ["sh", "-c", "tail -f /dev/null"]
CMD ["npx", "prisma", "migrate", "deploy"]
