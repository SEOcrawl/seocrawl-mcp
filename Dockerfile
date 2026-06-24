# Glama builds and runs this image, then performs the MCP introspection
# exchange (initialize + tools/list) over stdio. The container only needs to
# start and respond to introspection — which this manifest server does.
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# App source.
COPY server.js ./

# stdio MCP server.
CMD ["node", "server.js"]
