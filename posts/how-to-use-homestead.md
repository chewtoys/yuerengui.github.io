---
title: homestead的安装使用
date: 2017-05-24 18:48:29
tags:
      - Homestead
      - Mac
      - Laravel
---

>装这套虚拟环境的起因是因为我本地的环境已经接近崩溃，`brew doctor`各种`warning`和`error`，寻思着重新装下`brew`,可是重新安装会把我本地辛辛苦苦弄好的环境也给卸载掉，于是就想直接弄套laravel官方推荐的虚拟环境`homestead`,也省的以后在重装系统或者系统升级的时候再重新搭建或者修复我的作业环境了。

>2017年06月22日10:35:42 编辑：现在已经不再使用 vagrant 而改用 Docker

<more></more>

# 安装环境

首先需要安装virtualbox虚拟机，直接去[virtual官网](https://www.virtualbox.org/wiki/Downloads)下载完成安装。然后是使用`vagrant box add laravel/homestead` 获取`vagrant`的真实下载路径,而后用迅雷下载,这里要说的是,因为国内网络环境的原因,一般情况下命令行下载基本上都会失败,所以要把vagrant的真实下载路径copy出来用第三方下载工具下载，下载完成之后手动安装。

```bash
>vagrant box add laravel/homestead
==> box: Loading metadata for box 'laravel/homestead'
    box: URL: https://atlas.hashicorp.com/laravel/homestead
==> box: Adding box 'laravel/homestead' (v0.5.0) for provider: virtualbox
    box: Downloading: https://atlas.hashicorp.com/laravel/boxes/homestead/versions/0.5.0/providers/virtualbox.box
# 上面就是真实的下载路径,copy出来手动下载,文件1个G左右,有人说不能用迅雷离线下载,文件会损坏,这里注意一下
==> box: Box download is resuming from prior download progress
```

下载完成之后,创建一个名为`metadata.json`的文件,添加下面的内容,放在`vagrant.box`的同级目录中

```javascript
{
    "name": "laravel/homestead",
    "versions": [{
        "version": "0.5.0",   //注意替换成你的版本
        "providers": [{
            "name": "virtualbox",
            "url": "file://virtualbox.box"   //注意替换成你的box的文件名
        }]
    }]
}
```

然后执行,如果状态如下则表示安装成功

```bash
>vagrant box add metadata.json
>vagrant box list
laravel/homestead (virtualbox, 5.0.0)
```

然后下载一套预设的配置文件,放到你的home目录下就可以

```bash
>cd ~
>git clone https://github.com/laravel/homestead.git Homestead
>cd Homestead
>bash init.sh
```

<!-- more -->

运行之后会生成`Homestead.yaml`在你的`~/.homestead`目录下，编辑配置项

```bash
---
ip: "192.168.10.10"
memory: 2048
cpus: 1
provider: virtualbox

authorize: ~/.ssh/id_rsa.pub

keys:
    - ~/.ssh/id_rsa

folders:
    - map: ~/Code # 你需要把你的项目放在Code文件夹中，然后共享到homestead虚拟机
      to: /home/vagrant/Code # 你在虚拟机中的项目根路径
      type: "nfs"

sites:
    - map: homestead.app # 访问的域名
      to: /home/vagrant/Code/laravel/public #项目的public路径
    - map: front.app
      to: /home/vagrant/Code/company/public

databases:
    - homestead

# blackfire:
#     - id: foo
#       token: bar
#       client-id: foo
#       client-token: bar

# ports:
#     - send: 50000
#       to: 5000
#     - send: 7777
#       to: 777
#       protocol: udp
```

然后在hosts文件中将`homestead.app`,`front.app` 域名映射到`192.168.10.10` 即可,配置完成后在`~/Homestead`目录下运行`vagrant up`即可,另,如果更改配置,使用`vagrant reload --provision`即可生效,如果你想使用`sequel Pro`连接虚拟机中的Mysql数据库,使用如下配置

```text
端口:33060
帐号:homestead
密码:secret
```

>参考:[使用Homestead搭建开发环境](https://solarhell.com/post/2016/04/homestead)