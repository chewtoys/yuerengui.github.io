(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{324:function(n,e){n.exports={attributes:{title:"macOS 安装 LNMP",date:"2019-09-08T17:26:08.000Z",tags:["Mac","LNMP"]},html:'<h1>安装之前</h1>\n<blockquote>\n<p>之前写过一篇 <code>mac</code> 环境安装的文章,但是不太满意，当时也就是囫囵吞枣不求甚解的把环境运行成功就 ok 了，有些重要的步骤也没有提及，趁着现在重新安装 lnmp 环境的时候再写一遍文章，把内容整理清楚。</p>\n</blockquote>\n<h1>开始安装</h1>\n<p><more></more></p>\n<h2>安装Mysql</h2>\n<pre><code class="language-bash">brew install mysql\n安装完成之后的一系列设置可以直接通过安装后的反馈信息来操作，或者使用 brew info mysql 查看操作\nbrew info mysql\nmysql: stable 5.7.16 (bottled)\n==&gt; Dependencies\nBuild: cmake ✘\nRequired: openssl ✔\n==&gt; Requirements\nRequired: macOS &gt;= 10.7 ✔\n==&gt; Options\n--with-archive-storage-engine\n       \tCompile with the ARCHIVE storage engine enabled\n--with-blackhole-storage-engine\n       \tCompile with the BLACKHOLE storage engine enabled\n--with-debug\n       \tBuild with debug support\n--with-embedded\n       \tBuild the embedded server\n--with-local-infile\n       \tBuild with <span class="hljs-built_in">local</span> infile loading support\n--with-test\n       \tBuild with unit tests\n==&gt; Caveats\nWe<span class="hljs-string">\'ve installed your MySQL database without a root password. To secure it run:\n    mysql_secure_installation\n\nTo connect run:\n    mysql -uroot\n\nTo have launchd start mysql now and restart at login:\n  brew services start mysql\nOr, if you don\'</span>t want/need a background service you can just run:\n  mysql.server start\n<span class="hljs-comment"># 所有需要设置的操作都会在上面列出来,再者如果你想在安装之前了解一下安装依赖以及是否兼容你的现有系统,使用上述命令也是可以的</span>\n</code></pre>\n<p>按照上述信息,进行一系列设置</p>\n<pre><code class="language-bash">$ brew services start mysql <span class="hljs-comment"># 开机启动</span>\n$ mysql_secure_installation <span class="hljs-comment"># 安全设置</span>\n$ mysql.server start <span class="hljs-comment"># 启动 Mysql</span>\n</code></pre>\n<h2>安装 php7</h2>\n<pre><code class="language-bash">$ brew tap homebrew/dupes\n$ brew tap josegonzalez/homebrew-php\n$ brew install php70 <span class="hljs-comment"># 安装 php7会内置 php-fpm,无需指定</span>\n</code></pre>\n<p>由于 mac 自带 php,为了优先使用我们安装的 php,需要设置下环境变量</p>\n<pre><code class="language-bash"><span class="hljs-built_in">echo</span> <span class="hljs-string">\'export PATH="$(brew --prefix php70)/bin:"\'</span> ~/.zshrc <span class="hljs-comment"># php</span>\n<span class="hljs-built_in">echo</span> <span class="hljs-string">\'export PATH="$(brew --prefix php56)/sbin:$PATH"\'</span> ~/.zshrc <span class="hljs-comment"># php-fpm </span>\n<span class="hljs-comment"># 而后使用 php -v 和 php-fpm -v 查看当前版本是否均为7.0</span>\n$ php -v\nPHP 7.0.13 (cli) (built: Nov 15 2016 23:48:44) ( NTS )\nCopyright (c) 1997-2016 The PHP Group\nZend Engine v3.0.0, Copyright (c) 1998-2016 Zend Technologies\n$ php-fpm -v\nPHP 7.0.13 (fpm-fcgi) (built: Nov 15 2016 23:48:48)\nCopyright (c) 1997-2016 The PHP Group\nZend Engine v3.0.0, Copyright (c) 1998-2016 Zend Technologies\n</code></pre>\n<h3>配置 php</h3>\n<pre><code class="language-bash">$ php --ini <span class="hljs-comment"># 找到 php.ini 文件路径</span>\nConfiguration File (php.ini) Path: /usr/<span class="hljs-built_in">local</span>/etc/php/7.0\nLoaded Configuration File:         /usr/<span class="hljs-built_in">local</span>/etc/php/7.0/php.ini\nScan <span class="hljs-keyword">for</span> additional .ini files <span class="hljs-keyword">in</span>: /usr/<span class="hljs-built_in">local</span>/etc/php/7.0/conf.d\nAdditional .ini files parsed:      (none)\n\n<span class="hljs-comment"># /usr/local/etc/php/7.0/php.ini</span>\n...\ncgi.fix_pathinfo=0 <span class="hljs-comment"># 注释去掉,值改为0</span>\n...\n</code></pre>\n<h3>配置 php-fpm</h3>\n<p>使用 <code>php-fpm -v</code>查看 php-fpm 的主配置文件,而后编辑主配置文件</p>\n<pre><code class="language-bash"><span class="hljs-comment"># /usr/local/etc/php/7.0/php-fpm.conf</span>\n...\n[global]\n; Pid file\n; Note: the default prefix is /usr/<span class="hljs-built_in">local</span>/var\n; Default Value: none\npid = run/php-fpm.pid\n<span class="hljs-comment"># 去掉前面的注释即可</span>\n...\n\n<span class="hljs-comment"># 编辑主配置文件夹的下级目录php-fpm.d/www.conf 配置文件</span>\n\n<span class="hljs-comment"># /usr/local/etc/php/7.0/php-fpm.d/www.conf</span>\n...\n; Unix user/group of processes\n; Note: The user is mandatory. If the group is not <span class="hljs-built_in">set</span>, the default user<span class="hljs-string">\'s group\n;       will be used.\nuser = _www\ngroup = _www\n# 将 user 和 group 的注释去掉,内容不变\n\n; The address on which to accept FastCGI requests.\n; Valid syntaxes are:\n;   \'</span>ip.add.re.ss:port<span class="hljs-string">\'    - to listen on a TCP socket to a specific IPv4 address on\n;                            a specific port;\n;   \'</span>[ip:6:addr:ess]:port<span class="hljs-string">\' - to listen on a TCP socket to a specific IPv6 address on\n;                            a specific port;\n;   \'</span>port<span class="hljs-string">\'                 - to listen on a TCP socket to all addresses\n;                            (IPv6 and IPv4-mapped) on a specific port;\n;   \'</span>/path/to/unix/socket<span class="hljs-string">\' - to listen on a unix socket.\n; Note: This value is mandatory.\nlisten = /usr/local/var/run/php-fpm/php-fpm.sock\n# 这里的 listen 有好几种方式，可以选择侦听端口，或者 sock 文件,我这里选择 sock,而后制定生成 sock 文件的路径\n# 我把它和 nginx.pid/php-fpm.pid 放在一起,都是在/usr/local/var/run/目录,你可以选择新建个文件夹然后把 sock\n#  文件指定到文件夹下\n\n; Set permissions for unix socket, if one is used. In Linux, read/write\n; permissions must be set in order to allow connections from a web server. Many\n; BSD-derived systems allow connections regardless of permissions.\n; Default Values: user and group are set as the running user\n;                 mode is set to 0660\nlisten.owner = nobody\nlisten.group = nobody\n# 将 listen.owner和 listen.group 前面的注释去掉\n...\n\n# 启动 和 停止 php-fpm\n$ sudo php-fpm\n$ sudo kill -USR2 `cat /usr/local/var/run/php-fpm.pid` # 重启\n$ sudo kill -INT `cat /usr/local/var/run/php-fpm.pid` # 停止\n</span></code></pre>\n<h2>安装 nginx</h2>\n<pre><code class="language-bash">brew install nginx\n</code></pre>\n<p>安装完成之后需要进行一系列配置</p>\n<pre><code class="language-bash"><span class="hljs-comment"># 使用 nginx -t 查看 nginx 的配置主文件路径</span>\n$ nginx -t\nnginx: the configuration file /usr/<span class="hljs-built_in">local</span>/etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /usr/<span class="hljs-built_in">local</span>/etc/nginx/nginx.conf <span class="hljs-built_in">test</span> is successful\n\n<span class="hljs-comment"># /usr/local/etc/nginx/nginx.conf</span>\nuser  nobody; <span class="hljs-comment"># 取消注释</span>\nworker_processes  1; <span class="hljs-comment"># 自己看情况</span>\n\nerror_log  /Users/rengui/logs/error.log;\nerror_log  /Users/rengui/logs/error.log  notice;\nerror_log  /Users/rengui/logs/error.log  info;\n\npid        /usr/<span class="hljs-built_in">local</span>/var/run/nginx.pid; <span class="hljs-comment"># nginx.pid 的生成路径</span>\nevents {\n    worker_connections  256; <span class="hljs-comment"># 自己看情况</span>\n}\n\nhttp {\n    include       mime.types;\n    default_type  application/octet-stream;\n    log_format  main  <span class="hljs-string">\'$remote_addr - $remote_user [$time_local] "$request" \'</span>\n                     <span class="hljs-string">\'$status $body_bytes_sent "$http_referer" \'</span>\n                     <span class="hljs-string">\'"$http_user_agent" "$http_x_forwarded_for"\'</span>;\n    \n    access_log  /Users/rengui/logs/nginx.access.log  main;\n\n    sendfile        on;\n    keepalive_timeout  65;\n    port_in_redirect off;\n\t\n    server {\n        listen 80;\n        server_name localhost;\n        root /Users/rengui/htdocs; <span class="hljs-comment"># 项目根目录</span>\n        access_log  /Users/rengui/logs/nginx.host.access.log  main; \n        <span class="hljs-comment"># 为了方便起见,我把一系列的日志文件都放在了~/logs/ 下</span>\n        location / {\n            root /Users/rengui/htdocs;\n            index  index.php index.html index.htm;\n        }\n    \n        <span class="hljs-comment"># 40x错误页面</span>\n        error_page  404              /404.html;\n        location = /40x.html {\n            <span class="hljs-comment"># 你的 40x 错误页面路径</span>\n            root /Users/rengui/htdocs/errors;\n        }\n\n        <span class="hljs-comment"># 50x错误页面</span>\n        error_page   500 502 503 504  /50x.html;\n        location = /50x.html {\n            <span class="hljs-comment"># 你的 50x 错误页面路径</span>\n            root /Users/rengui/htdocs/errors; \n        }\n        \n        location ~ \\.php$ {\n            try_files <span class="hljs-variable">$uri</span> =404;\n            <span class="hljs-comment"># 这里需要填上你的 php-fpm.sock 的路径</span>\n            fastcgi_pass unix:/usr/<span class="hljs-built_in">local</span>/var/run/php-fpm/php-fpm.sock;\n            fastcgi_param SCRIPT_FILENAME <span class="hljs-variable">$document_root</span><span class="hljs-variable">$fastcgi_script_name</span>;\n            fastcgi_index index.php;\n            include fastcgi_params;\n        }\n    }\n    include servers/*;\n}\n\n<span class="hljs-comment"># 编辑完成之后测试一下配置文件是否有错</span>\n$ sudo nginx -t \n\n<span class="hljs-comment"># 启动和停止 nginx</span>\n$ sudo nginx\n$ sudo nginx -s stop | quit | reopen | reload\n</code></pre>\n<p>nginx rewrite 配置</p>\n<pre><code class="language-bash"><span class="hljs-keyword">if</span> (!-d <span class="hljs-variable">$request_filename</span>)\n{\n    rewrite ^/(.+)/$ /<span class="hljs-variable">$1</span> permanent;\n}\n\n<span class="hljs-comment"># removes trailing "index" from all controllers</span>\n<span class="hljs-keyword">if</span> (<span class="hljs-variable">$request_uri</span> ~* index/?$)\n{\n    rewrite ^/(.*)/index/?$ /<span class="hljs-variable">$1</span> permanent;\n}\n\n<span class="hljs-comment"># unless the request is for a valid file (image, js, css, etc.), send to bootstrap</span>\n<span class="hljs-keyword">if</span> (!-e <span class="hljs-variable">$request_filename</span>)\n{\n    rewrite ^/(.*)$ /index.php?/<span class="hljs-variable">$1</span> last;\n    <span class="hljs-built_in">break</span>;\n}\n</code></pre>\n<blockquote>\n<p>Refer to:<br>\n<a href="http://www.libing.cc/mac-osx-%E5%BC%80%E5%8F%91%E8%80%85%E7%8E%AF%E5%A2%83-%E5%90%8C%E6%97%B6%E4%BD%BF%E7%94%A8homebrew%E6%90%AD%E5%BB%BA-php%EF%BC%8Cnginx-%EF%BC%8Cmysql%EF%BC%8Credis%EF%BC%8Cmemcache-lnmp/">Mac OSX 开发者环境</a><br>\n<a href="http://www.awaimai.com/671.html">CentOS 7搭建LNMP教程 - 歪麦博客</a></p>\n</blockquote>\n<h2>后续问题修复</h2>\n<p>最近开始在本地使用 Yii,运行数据库迁移命令  <code>php yii migrate</code> 的时候会报错</p>\n<p><img src="/images/cover/If3q7hnKzQh5d8FrI2giy4zHquRLBJ5K.jpeg" alt="QQ20170220-1@2x"></p>\n<p>php cli 模式下 Yii 连接数据库使用的是 socket 连接,需要在 php.ini 配置 mysql,mysqli,pdo socket 连接的路径,大致就是下面这样</p>\n<pre><code class="language-bash">mysql.default_socket = /var/run/mysqld/mysqld.sock\nmysqli.default_socket = /var/run/mysqld/mysqld.sock\npdo_mysql.default_socket = /var/run/mysqld/mysqld.sock\n</code></pre>\n<p>然后homebrew 安装的 Mysql默认没有 My.cnf,使用 <code>mysql --verbose --help | grep -A 1 \'Default options\'\'</code> 查看 mysql.cnf 默认读取路径</p>\n<pre><code class="language-bash">Default options are <span class="hljs-built_in">read</span> from the following files <span class="hljs-keyword">in</span> the given order:\n/etc/my.cnf /etc/mysql/my.cnf /usr/<span class="hljs-built_in">local</span>/etc/my.cnf ~/.my.cnf\n</code></pre>\n<p>然后在/etc 下创建 <code>my.cnf</code>,复制下面内容</p>\n<pre><code class="language-bash"><span class="hljs-comment">#</span>\n<span class="hljs-comment"># The MySQL database server configuration file.</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># You can copy this to one of:</span>\n<span class="hljs-comment"># - "/etc/mysql/my.cnf" to set global options,</span>\n<span class="hljs-comment"># - "~/.my.cnf" to set user-specific options.</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># One can use all long options that the program supports.</span>\n<span class="hljs-comment"># Run program with --help to get a list of available options and with</span>\n<span class="hljs-comment"># --print-defaults to see which it would actually understand and use.</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># For explanations see</span>\n<span class="hljs-comment"># http://dev.mysql.com/doc/mysql/en/server-system-variables.html</span>\n\n<span class="hljs-comment"># This will be passed to all mysql clients</span>\n<span class="hljs-comment"># It has been reported that passwords should be enclosed with </span>\n<span class="hljs-comment"># ticks/quotes escpecially if they contain "#" chars...</span>\n<span class="hljs-comment"># Remember to edit /etc/mysql/debian.cnf when changing </span>\n<span class="hljs-comment"># the socket location.</span>\n[client]\nport        = 3306\n<span class="hljs-comment">#socket     = /var/run/mysqld/mysqld.sock</span>\n\n<span class="hljs-comment"># Here is entries for some specific programs</span>\n<span class="hljs-comment"># The following values assume you have at least 32M ram</span>\n\n<span class="hljs-comment"># This was formally known as [safe_mysqld]. Both versions </span>\n<span class="hljs-comment"># are currently parsed.</span>\n[mysqld_safe]\n<span class="hljs-comment">#socket     = /var/run/mysqld/mysqld.sock</span>\n<span class="hljs-comment">#nice       = 0</span>\n\n[mysqld]\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># * Basic Settings</span>\n<span class="hljs-comment">#</span>\n\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># * IMPORTANT</span>\n<span class="hljs-comment">#   If you make changes to these settings and your system uses </span>\n<span class="hljs-comment">#   apparmor, you may also need to also adjust </span>\n<span class="hljs-comment">#   /etc/apparmor.d/usr.sbin.mysqld.</span>\n<span class="hljs-comment">#</span>\n\nuser       = _mysql\nsocket     = /var/run/mysqld/mysqld.sock\nport        = 3306\n<span class="hljs-comment">#basedir    = /usr</span>\ndatadir    = /usr/<span class="hljs-built_in">local</span>/var/mysql\n<span class="hljs-comment">#tmpdir     = /tmp</span>\nskip-external-locking\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># Instead of skip-networking the default is now to listen only on</span>\n<span class="hljs-comment"># localhost which is more compatible and is not less secure.</span>\n<span class="hljs-comment"># bind-address        = 127.0.0.1</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># * Fine Tuning</span>\n<span class="hljs-comment">#</span>\nmax_allowed_packet  = 16M\nthread_stack        = 192K\nthread_cache_size   = 8\n<span class="hljs-comment"># This replaces the startup script and checks MyISAM tables if needed</span>\n<span class="hljs-comment"># the first time they are touched</span>\n<span class="hljs-comment">#max_connections       = 100</span>\n<span class="hljs-comment">#table_cache           = 64</span>\n<span class="hljs-comment">#thread_concurrency    = 10</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># * Query Cache Configuration</span>\n<span class="hljs-comment">#</span>\nquery_cache_limit   = 1M\nquery_cache_size    = 16M\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># * Logging and Replication</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># Both location gets rotated by the cronjob.</span>\n<span class="hljs-comment"># Be aware that this log type is a performance killer.</span>\n<span class="hljs-comment"># As of 5.1 you can enable the log at runtime!</span>\n<span class="hljs-comment">#general_log_file        = /var/log/mysql/mysql.log</span>\n<span class="hljs-comment">#general_log             = 1</span>\n\nlog_error                = /usr/<span class="hljs-built_in">local</span>/var/mysql/yuerengui.local.err\n\n<span class="hljs-comment"># Here you can see queries with especially long duration</span>\n<span class="hljs-comment">#log_slow_queries   = /var/log/mysql/mysql-slow.log</span>\n<span class="hljs-comment">#long_query_time = 2</span>\n<span class="hljs-comment">#log-queries-not-using-indexes</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># The following can be used as easy to replay backup logs or </span>\n<span class="hljs-comment"># for replication.</span>\n<span class="hljs-comment"># note: if you are setting up a replication slave, see </span>\n<span class="hljs-comment">#       README.Debian about other settings you may need </span>\n<span class="hljs-comment">#       to change.</span>\n<span class="hljs-comment">#server-id          = 1</span>\n<span class="hljs-comment">#log_bin            = /var/log/mysql/mysql-bin.log</span>\nexpire_logs_days    = 10\nmax_binlog_size     = 100M\n<span class="hljs-comment">#binlog_do_db       = include_database_name</span>\n<span class="hljs-comment">#binlog_ignore_db   = include_database_name</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># * InnoDB</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># InnoDB is enabled by default with a 10MB datafile in /var/lib/mysql/.</span>\n<span class="hljs-comment"># Read the manual for more InnoDB related options. There are many!</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># * Security Features</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># Read the manual, too, if you want chroot!</span>\n<span class="hljs-comment"># chroot = /var/lib/mysql/</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># For generating SSL certificates I recommend the OpenSSL GUI "tinyca".</span>\n<span class="hljs-comment">#</span>\n<span class="hljs-comment"># ssl-ca=/etc/mysql/cacert.pem</span>\n<span class="hljs-comment"># ssl-cert=/etc/mysql/server-cert.pem</span>\n<span class="hljs-comment"># ssl-key=/etc/mysql/server-key.pem</span>\n\n<span class="hljs-comment"># Query Caching</span>\nquery-cache-type = 1\n\n<span class="hljs-comment"># Default to InnoDB</span>\ndefault-storage-engine=innodb\n\n[mysqldump]\nquick\nquote-names\nmax_allowed_packet  = 16M\n\n[mysql]\n<span class="hljs-comment">#no-auto-rehash # faster start of mysql but no tab completition</span>\n\n[isamchk]\nkey_buffer      = 16M\n</code></pre>\n<p>主要就是把 [mysqld]下面的mysqld.socket 改成对应的地址,默认就可以了...<br>\n添加完成后更改目录权限</p>\n<pre><code class="language-bash">chown -R mysql:mysql /var/run/mysqld/\nchmod -R 0755 /var/run/mysqld\n</code></pre>\n<p>然后启动 mysql,一般到这里就会成功了,如果有错误,继续查看错误日志,继续 google,继续排错。<br>\n因为现在写的步骤是事后回忆的,所以难免会有疏漏,如有错误,欢迎指正。<br>\n最后附上成功的截图,完。</p>\n<p><img src="/images/cover/00ZIGDyadqGuDl433es5TjAdFMWpVuYq.jpeg" alt="QQ20170220-0@2x"></p>\n<p><strong>延伸阅读</strong></p>\n<p><a href="https://www.zybuluo.com/phper/note/89081">php-fpm的配置和优化 - 作业部落 Cmd Markdown 编辑阅读器</a><br>\n<a href="https://www.phpini.com/linux/rhel-centos-7-install-nginx-mysql-php-lemp">RHEL / CentOS 7 安裝 Nginx, MySQL, PHP (LEMP) – Linux 技術手札</a><br>\n<a href="https://www.vultr.com/docs/how-to-install-php-7-x-on-centos-7">How to Install PHP 7.x on CentOS 7 - Vultr.com</a><br>\n<a href="https://segmentfault.com/a/1190000007469714?_ea=1354994">基于CentOS 7.2 的Laravel 生成环境部署</a></p>\n'}}}]);