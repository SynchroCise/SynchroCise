FROM node:12.4.0
WORKDIR /app
COPY . .
ENV NODE_ENV=production
RUN npm install
RUN npm run build
RUN mv /app/build /app/server
EXPOSE 3001
CMD ["npm", "run" ,"prod"]