# Stage 1: Build the React application
FROM node:20-alpine AS build

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production

ARG VITE_BACKEND_URL=https://onsight-backend-b3e2hdbgcsfudyfx.eastus2-01.azurewebsites.net
ENV BACKEND_PROXY_URL=$VITE_BACKEND_URL

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
