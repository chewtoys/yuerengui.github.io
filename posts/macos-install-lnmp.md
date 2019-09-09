---
title: macOS 安装 LNMP
date: 2019-09-08 17:26:08
tags:
    - Mac
    - LNMP
---

# 安装之前

> 之前写过一篇 `mac` 环境安装的文章,但是不太满意，当时也就是囫囵吞枣不求甚解的把环境运行成功就 ok 了，有些重要的步骤也没有提及，趁着现在重新安装 lnmp 环境的时候再写一遍文章，把内容整理清楚。

# 开始安装

<more></more>

## 安装Mysql

```bash
brew install mysql
安装完成之后的一系列设置可以直接通过安装后的反馈信息来操作，或者使用 brew info mysql 查看操作
brew info mysql
mysql: stable 5.7.16 (bottled)
==> Dependencies
Build: cmake ✘
Required: openssl ✔
==> Requirements
Required: macOS >= 10.7 ✔
==> Options
--with-archive-storage-engine
       	Compile with the ARCHIVE storage engine enabled
--with-blackhole-storage-engine
       	Compile with the BLACKHOLE storage engine enabled
--with-debug
       	Build with debug support
--with-embedded
       	Build the embedded server
--with-local-infile
       	Build with local infile loading support
--with-test
       	Build with unit tests
==> Caveats
We've installed your MySQL database without a root password. To secure it run:
    mysql_secure_installation

To connect run:
    mysql -uroot

To have launchd start mysql now and restart at login:
  brew services start mysql
Or, if you don't want/need a background service you can just run:
  mysql.server start
# 所有需要设置的操作都会在上面列出来,再者如果你想在安装之前了解一下安装依赖以及是否兼容你的现有系统,使用上述命令也是可以的
```
按照上述信息,进行一系列设置

```bash
$ brew services start mysql # 开机启动
$ mysql_secure_installation # 安全设置
$ mysql.server start # 启动 Mysql
```

## 安装 php7

```bash
$ brew tap homebrew/dupes
$ brew tap josegonzalez/homebrew-php
$ brew install php70 # 安装 php7会内置 php-fpm,无需指定
```
由于 mac 自带 php,为了优先使用我们安装的 php,需要设置下环境变量

```bash
echo 'export PATH="$(brew --prefix php70)/bin:"' ~/.zshrc # php
echo 'export PATH="$(brew --prefix php56)/sbin:$PATH"' ~/.zshrc # php-fpm 
# 而后使用 php -v 和 php-fpm -v 查看当前版本是否均为7.0
$ php -v
PHP 7.0.13 (cli) (built: Nov 15 2016 23:48:44) ( NTS )
Copyright (c) 1997-2016 The PHP Group
Zend Engine v3.0.0, Copyright (c) 1998-2016 Zend Technologies
$ php-fpm -v
PHP 7.0.13 (fpm-fcgi) (built: Nov 15 2016 23:48:48)
Copyright (c) 1997-2016 The PHP Group
Zend Engine v3.0.0, Copyright (c) 1998-2016 Zend Technologies
```

### 配置 php

```bash
$ php --ini # 找到 php.ini 文件路径
Configuration File (php.ini) Path: /usr/local/etc/php/7.0
Loaded Configuration File:         /usr/local/etc/php/7.0/php.ini
Scan for additional .ini files in: /usr/local/etc/php/7.0/conf.d
Additional .ini files parsed:      (none)

# /usr/local/etc/php/7.0/php.ini
...
cgi.fix_pathinfo=0 # 注释去掉,值改为0
...
```

### 配置 php-fpm

使用 `php-fpm -v`查看 php-fpm 的主配置文件,而后编辑主配置文件

```bash
# /usr/local/etc/php/7.0/php-fpm.conf
...
[global]
; Pid file
; Note: the default prefix is /usr/local/var
; Default Value: none
pid = run/php-fpm.pid
# 去掉前面的注释即可
...

# 编辑主配置文件夹的下级目录php-fpm.d/www.conf 配置文件

# /usr/local/etc/php/7.0/php-fpm.d/www.conf
...
; Unix user/group of processes
; Note: The user is mandatory. If the group is not set, the default user's group
;       will be used.
user = _www
group = _www
# 将 user 和 group 的注释去掉,内容不变

; The address on which to accept FastCGI requests.
; Valid syntaxes are:
;   'ip.add.re.ss:port'    - to listen on a TCP socket to a specific IPv4 address on
;                            a specific port;
;   '[ip:6:addr:ess]:port' - to listen on a TCP socket to a specific IPv6 address on
;                            a specific port;
;   'port'                 - to listen on a TCP socket to all addresses
;                            (IPv6 and IPv4-mapped) on a specific port;
;   '/path/to/unix/socket' - to listen on a unix socket.
; Note: This value is mandatory.
listen = /usr/local/var/run/php-fpm/php-fpm.sock
# 这里的 listen 有好几种方式，可以选择侦听端口，或者 sock 文件,我这里选择 sock,而后制定生成 sock 文件的路径
# 我把它和 nginx.pid/php-fpm.pid 放在一起,都是在/usr/local/var/run/目录,你可以选择新建个文件夹然后把 sock
#  文件指定到文件夹下

; Set permissions for unix socket, if one is used. In Linux, read/write
; permissions must be set in order to allow connections from a web server. Many
; BSD-derived systems allow connections regardless of permissions.
; Default Values: user and group are set as the running user
;                 mode is set to 0660
listen.owner = nobody
listen.group = nobody
# 将 listen.owner和 listen.group 前面的注释去掉
...

# 启动 和 停止 php-fpm
$ sudo php-fpm
$ sudo kill -USR2 `cat /usr/local/var/run/php-fpm.pid` # 重启
$ sudo kill -INT `cat /usr/local/var/run/php-fpm.pid` # 停止
```

## 安装 nginx

```bash
brew install nginx
```

安装完成之后需要进行一系列配置

```bash
# 使用 nginx -t 查看 nginx 的配置主文件路径
$ nginx -t
nginx: the configuration file /usr/local/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /usr/local/etc/nginx/nginx.conf test is successful

# /usr/local/etc/nginx/nginx.conf
user  nobody; # 取消注释
worker_processes  1; # 自己看情况

error_log  /Users/rengui/logs/error.log;
error_log  /Users/rengui/logs/error.log  notice;
error_log  /Users/rengui/logs/error.log  info;

pid        /usr/local/var/run/nginx.pid; # nginx.pid 的生成路径
events {
    worker_connections  256; # 自己看情况
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                     '$status $body_bytes_sent "$http_referer" '
                     '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log  /Users/rengui/logs/nginx.access.log  main;

    sendfile        on;
    keepalive_timeout  65;
    port_in_redirect off;
	
    server {
        listen 80;
        server_name localhost;
        root /Users/rengui/htdocs; # 项目根目录
        access_log  /Users/rengui/logs/nginx.host.access.log  main; 
        # 为了方便起见,我把一系列的日志文件都放在了~/logs/ 下
        location / {
            root /Users/rengui/htdocs;
            index  index.php index.html index.htm;
        }
    
        # 40x错误页面
        error_page  404              /404.html;
        location = /40x.html {
            # 你的 40x 错误页面路径
            root /Users/rengui/htdocs/errors;
        }

        # 50x错误页面
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            # 你的 50x 错误页面路径
            root /Users/rengui/htdocs/errors; 
        }
        
        location ~ \.php$ {
            try_files $uri =404;
            # 这里需要填上你的 php-fpm.sock 的路径
            fastcgi_pass unix:/usr/local/var/run/php-fpm/php-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            fastcgi_index index.php;
            include fastcgi_params;
        }
    }
    include servers/*;
}

# 编辑完成之后测试一下配置文件是否有错
$ sudo nginx -t 

# 启动和停止 nginx
$ sudo nginx
$ sudo nginx -s stop | quit | reopen | reload
```

nginx rewrite 配置

```bash
if (!-d $request_filename)
{
    rewrite ^/(.+)/$ /$1 permanent;
}

# removes trailing "index" from all controllers
if ($request_uri ~* index/?$)
{
    rewrite ^/(.*)/index/?$ /$1 permanent;
}

# unless the request is for a valid file (image, js, css, etc.), send to bootstrap
if (!-e $request_filename)
{
    rewrite ^/(.*)$ /index.php?/$1 last;
    break;
}
```

> Refer to:
> [Mac OSX 开发者环境](http://www.libing.cc/mac-osx-%E5%BC%80%E5%8F%91%E8%80%85%E7%8E%AF%E5%A2%83-%E5%90%8C%E6%97%B6%E4%BD%BF%E7%94%A8homebrew%E6%90%AD%E5%BB%BA-php%EF%BC%8Cnginx-%EF%BC%8Cmysql%EF%BC%8Credis%EF%BC%8Cmemcache-lnmp/)
> [CentOS 7搭建LNMP教程 - 歪麦博客](http://www.awaimai.com/671.html)


## 后续问题修复

最近开始在本地使用 Yii,运行数据库迁移命令  `php yii migrate` 的时候会报错

 ![QQ20170220-1@2x](/images/cover/If3q7hnKzQh5d8FrI2giy4zHquRLBJ5K.jpeg)
 
 php cli 模式下 Yii 连接数据库使用的是 socket 连接,需要在 php.ini 配置 mysql,mysqli,pdo socket 连接的路径,大致就是下面这样
 
 ```bash
mysql.default_socket = /var/run/mysqld/mysqld.sock
mysqli.default_socket = /var/run/mysqld/mysqld.sock
pdo_mysql.default_socket = /var/run/mysqld/mysqld.sock
 ```
 
 然后homebrew 安装的 Mysql默认没有 My.cnf,使用 `mysql --verbose --help | grep -A 1 'Default options''` 查看 mysql.cnf 默认读取路径
 
 ```bash
 Default options are read from the following files in the given order:
/etc/my.cnf /etc/mysql/my.cnf /usr/local/etc/my.cnf ~/.my.cnf
 ```
 然后在/etc 下创建 `my.cnf`,复制下面内容
 
 ```bash
 #
# The MySQL database server configuration file.
#
# You can copy this to one of:
# - "/etc/mysql/my.cnf" to set global options,
# - "~/.my.cnf" to set user-specific options.
#
# One can use all long options that the program supports.
# Run program with --help to get a list of available options and with
# --print-defaults to see which it would actually understand and use.
#
# For explanations see
# http://dev.mysql.com/doc/mysql/en/server-system-variables.html

# This will be passed to all mysql clients
# It has been reported that passwords should be enclosed with 
# ticks/quotes escpecially if they contain "#" chars...
# Remember to edit /etc/mysql/debian.cnf when changing 
# the socket location.
[client]
port        = 3306
#socket     = /var/run/mysqld/mysqld.sock

# Here is entries for some specific programs
# The following values assume you have at least 32M ram

# This was formally known as [safe_mysqld]. Both versions 
# are currently parsed.
[mysqld_safe]
#socket     = /var/run/mysqld/mysqld.sock
#nice       = 0

[mysqld]
#
# * Basic Settings
#

#
# * IMPORTANT
#   If you make changes to these settings and your system uses 
#   apparmor, you may also need to also adjust 
#   /etc/apparmor.d/usr.sbin.mysqld.
#

 user       = _mysql
socket     = /var/run/mysqld/mysqld.sock
port        = 3306
#basedir    = /usr
datadir    = /usr/local/var/mysql
#tmpdir     = /tmp
skip-external-locking
#
# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
# bind-address        = 127.0.0.1
#
# * Fine Tuning
#
max_allowed_packet  = 16M
thread_stack        = 192K
thread_cache_size   = 8
# This replaces the startup script and checks MyISAM tables if needed
# the first time they are touched
#max_connections       = 100
#table_cache           = 64
#thread_concurrency    = 10
#
# * Query Cache Configuration
#
query_cache_limit   = 1M
query_cache_size    = 16M
#
# * Logging and Replication
#
# Both location gets rotated by the cronjob.
# Be aware that this log type is a performance killer.
# As of 5.1 you can enable the log at runtime!
#general_log_file        = /var/log/mysql/mysql.log
#general_log             = 1
 
log_error                = /usr/local/var/mysql/yuerengui.local.err
 
# Here you can see queries with especially long duration
#log_slow_queries   = /var/log/mysql/mysql-slow.log
#long_query_time = 2
#log-queries-not-using-indexes
#
# The following can be used as easy to replay backup logs or 
# for replication.
# note: if you are setting up a replication slave, see 
#       README.Debian about other settings you may need 
#       to change.
#server-id          = 1
#log_bin            = /var/log/mysql/mysql-bin.log
expire_logs_days    = 10
max_binlog_size     = 100M
#binlog_do_db       = include_database_name
#binlog_ignore_db   = include_database_name
#
# * InnoDB
#
# InnoDB is enabled by default with a 10MB datafile in /var/lib/mysql/.
# Read the manual for more InnoDB related options. There are many!
#
# * Security Features
#
# Read the manual, too, if you want chroot!
# chroot = /var/lib/mysql/
#
# For generating SSL certificates I recommend the OpenSSL GUI "tinyca".
#
# ssl-ca=/etc/mysql/cacert.pem
# ssl-cert=/etc/mysql/server-cert.pem
# ssl-key=/etc/mysql/server-key.pem
 
# Query Caching
query-cache-type = 1
 
# Default to InnoDB
default-storage-engine=innodb
 
[mysqldump]
quick
quote-names
max_allowed_packet  = 16M
 
[mysql]
#no-auto-rehash # faster start of mysql but no tab completition
 
[isamchk]
key_buffer      = 16M
 ``` 
 
 主要就是把 [mysqld]下面的mysqld.socket 改成对应的地址,默认就可以了...
 添加完成后更改目录权限
 
 ```bash
 chown -R mysql:mysql /var/run/mysqld/
 chmod -R 0755 /var/run/mysqld
 ```
 
 然后启动 mysql,一般到这里就会成功了,如果有错误,继续查看错误日志,继续 google,继续排错。
 因为现在写的步骤是事后回忆的,所以难免会有疏漏,如有错误,欢迎指正。
 最后附上成功的截图,完。
 
 ![QQ20170220-0@2x](/images/cover/00ZIGDyadqGuDl433es5TjAdFMWpVuYq.jpeg)

**延伸阅读**

[php-fpm的配置和优化 - 作业部落 Cmd Markdown 编辑阅读器](https://www.zybuluo.com/phper/note/89081)
[RHEL / CentOS 7 安裝 Nginx, MySQL, PHP (LEMP) – Linux 技術手札](https://www.phpini.com/linux/rhel-centos-7-install-nginx-mysql-php-lemp)
[How to Install PHP 7.x on CentOS 7 - Vultr.com](https://www.vultr.com/docs/how-to-install-php-7-x-on-centos-7)
[基于CentOS 7.2 的Laravel 生成环境部署](https://segmentfault.com/a/1190000007469714?_ea=1354994)