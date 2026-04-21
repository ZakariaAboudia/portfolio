# Use the specified slim Node 22 image
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
# The asterisk handles cases where a lockfile doesn't exist yet
COPY . ./ 
#package.json package-lock.json* ./

# Install dependencies
#RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the standard development port (3000 for Next.js, 5173 for Vite)
EXPOSE 3000

# Start the development server
CMD tail -f > /dev/null
