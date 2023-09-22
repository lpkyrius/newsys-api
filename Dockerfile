FROM node:lts-slim

# Grant user node to write in /app folder
RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app

COPY package*.json ./ 

#RUN npm install --omit=dev
RUN npm install 

#COPY . ./
# user node as app folder's owner 
COPY --chown=node:node . .

# For security reasons, Let's use node user, 
# it's a default user that comes with the 
# docker image for NodeJS. So, we don't use 
# the root user to run the next command. 
# USER node 

CMD [ "npm", "start" ]

EXPOSE 8000