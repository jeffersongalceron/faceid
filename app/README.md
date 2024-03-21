# Criar imagem 
docker build -t app_b2xbet .

docker run -dti --name app_b2xbet -p 8181:80 -v "$PWD":/usr/local/apache2/htdocs/ app_b2xbet