# Usando a imagem base do Node.js 21.10.0-alpine3.14
FROM node:latest

# Cria a pasta de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependências para dentro do contêiner
COPY package.json package-lock.json ./

# Instala as dependências da aplicação
RUN npm install

# Copia todo o código da aplicação para o contêiner
COPY . .

# Define variáveis de ambiente (opcional, dependendo da sua configuração)
ENV NODE_ENV=development

# Expõe a porta 3002 para o serviço de usuário
EXPOSE 3002

# Comando para rodar a aplicação
CMD ["node", "src/app.js"]

