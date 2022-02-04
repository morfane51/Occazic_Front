# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:16 as build

# Set the working directory
WORKDIR /usr/local/occazic_front

# Add the source code to app
COPY ./ /usr/local/occazic_front/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npm run build


