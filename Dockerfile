# Gunakan official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Salin package.json dan install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Salin source code
COPY . .

# Expose port aplikasi
EXPOSE 3000

# Perintah untuk jalankan aplikasi
CMD ["node", "server.js"]