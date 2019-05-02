sudo apt install mysql-server;

sudo mysql;
CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
UPDATE mysql.user SET authentication_string=PASSWORD('password'), plugin='mysql_native_password' WHERE User='newuser';
flush privileges;
