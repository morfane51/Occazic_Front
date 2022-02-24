# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:16 AS build

# Set the working directory
WORKDIR /app/occazic_front

# Add the source code to app
COPY . .

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npm run build

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/occazic_front/dist/Occazic-Front /usr/share/nginx/html
COPY ./nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 82


