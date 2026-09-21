from node:20
WORKDIR /app
copy package*.json ./
run npm install
copy . .
expose 3000

cmd ["node","app.js"]