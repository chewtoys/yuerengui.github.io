---
title: 常用 Linux 命令
date: 2017-05-25 15:24:45
tags:
      - Linux
---

## 基本命令

```bash
$ sudo find / -name "*.git"  -exec rm {} \; 
# 搜索指定文件并通过bash命令执行相关操作,比如删除文件。`{}`代表前面的搜索结果,`\`是对`;`进行转义。
$ sudo chmod -R 0777 storage/
# 更改文件夹/文件的目录权限,`-R`是递归更改。
$ sudo chown -R rengui:rengui storage/
# 更改文件夹/文件的所属用户和组的权限 -R 是递归更改。
$ pwd
# 列出当前目录的绝对路径。
$ ls -al
# 列出当前文件夹下的所有文件（包括隐藏文件）的详细信息。
$ ln -s source/ dest
# 创建链接,链接分为`Hard Links`（硬链接）和`Symbolic Links`（软链接或符号链接）,默认创建的为硬链接,使用-s创建软链接。
$ mkdir aaa
# 创建文件夹。
$ rm -rf aaa/
# 删除文件\文件夹,`-rf`递归删除。
$ cp source dest
# 复制文件,`cp 源文件/文件夹 目标文件/文件夹`,`-r`为递归复制。
$ mv source dest
# 移动文件/文件夹。
$ grep
$ grep keywords /user/xxx/filename
$ grep "^Route::.*[\"']wap.*$" app/Http/routes.php
# 返回匹配的项目,支持正则表达式。
$ which mkdir
# 查看某条命令的bin路径
$ ps aux -l | grep nginx
# 查看某个进程详细信息
```