#Specify a base image
FROM node:alpine

#Specify a working directory
WORKDIR /usr/app

#Copy the project
COPY ./ ./

#Install dependencies
RUN npm install 

#Default command
CMD ["npm","start"]