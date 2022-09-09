# Use an node:14 image from DockerHub as a parent image
FROM node:16.15

# Set the working directory to /homyaksocial-backend
WORKDIR /kartinflix-backend

# Copy required files to the image
COPY index.js .
COPY package-lock.json .
COPY package.json .
COPY models ./models 
COPY frontend-test ./frontend-test

# run npm command, which looks for package-lock.json and install all deps from where
# as result directory node_modules will be created
RUN npm install

# Make port 3000 available to the world outside this container
EXPOSE 3002

# Run npm start command when the container launches
CMD ["npm", "start"]