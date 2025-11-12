# Dockerfile para Backend PHP (opcional, para customização)
FROM php:8.2-apache

# Habilita mod_rewrite para URLs amigáveis
RUN a2enmod rewrite

# Configura permissões para escrita
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Define o diretório de trabalho
WORKDIR /var/www/html

# Expõe a porta 80
EXPOSE 80

# Comando padrão (já está na imagem base)
CMD ["apache2-foreground"]