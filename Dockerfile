FROM node:12.4.0
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN mv /app/build /app/server
EXPOSE 3001
CMD ["npm", "run" ,"server"]