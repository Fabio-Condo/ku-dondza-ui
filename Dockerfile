FROM node:16.20.2 as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

FROM nginx:stable

COPY --from=node /app/dist/post-app /usr/share/nginx/html

# Remove the default Nginx configuration file 
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy your custom nginx.conf file to the Nginx configuration directory
# Resolve o problema de não funcionamento das paginas 404 NOT FOUND configuradas na APP. Ou seja assim funcionara como esperado
COPY default.conf /etc/nginx/conf.d/

EXPOSE 80 


# Usando o DockerFile apenas(Sem usar o docker-compose) :
# docker build -t sci-warehouse-ui:v1 .
# docker run -p 4200:80 sci-warehouse-ui:v1
# docker run -p 4200:80 -d sci-warehouse-ui:v1    #Liberar o terminal

# Para levantar usando o docker-compose
# docker-compose up -d --build

# http://192.168.43.2:4200/v1/tecnicos  # usar o IP da minha máquina fisica (atribuido dentro da rede). localhost nao vai funcionar. Nota: Nao é IP docker
 



