---
title: sublime3 常用设定
date: 2017-05-24 18:35:02
tags:
    - Mac
    - 编辑器
    - Sublime
---

# 添加命令行

安装完sublime先添加一下subl命令,方便以后在命令行里打开文件时直接调用sublime打开。

```bash
ln -s  "/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl" /usr/local/bin/subl
```

>用item2的自动完成的同学注意，item2的自动完成会给空格加上转义符，在添加软连接的时候记得把自动完成的`\`转义符给删除掉，不然软连接会添加失败，找不到源文件。

<more></more>

```bash
>subl --help
Sublime Text build 3126

Usage: subl [arguments] [files]         edit the given files
   or: subl [arguments] [directories]   open the given directories
   or: subl [arguments] -               edit stdin

Arguments:
  --project <project>: Load the given project
  --command <command>: Run the given command
  -n or --new-window:  Open a new window
  -a or --add:         Add folders to the current window
  -w or --wait:        Wait for the files to be closed before returning
  -b or --background:  Don't activate the application
  -s or --stay:        Keep the application activated after closing the file
  -h or --help:        Show help (this message) and exit
  -v or --version:     Show version and exit
...
```

<!-- more -->

# 安装Package Control

呼出控制台,把下面代码复制进去，回车

```python
import urllib.request,os; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); open(os.path.join(ipp, pf), 'wb').write(urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ','%20')).read())
```
安装完成后重启sublime

# 几个插件

- `emmet` 快速写代码的工具
- `Primer` sublime 一款UI主题 [传送门](https://packagecontrol.io/packages/Theme%20-%20Primer)
- `PackageResourceViewer` 修改主题设定的工具

好像没什么插件要装的，因为做的是后台开发，平时用的还是phpstorm，sublime相对后台来说还是比较弱的，现在只是当做一个文本编辑器来使用，所以暂时就不装什么插件了。

# 外观设定

## 内置样式设定

```markup
{
	"color_scheme": "Packages/Theme - Primer/primer.dark.tmTheme", # 颜色主题
	"enable_tab_scrolling": false, # 取消tab栏的上下箭头
	"font_face": "Courier New", # 代码字体
	"font_size": 15, # 字体大小
	"theme": "Primer.sublime-theme", # UI主题
	"theme_primer_sidebar_font_large": true, # sidebar字体大小设定
	"theme_primer_sidebar_tree_large": true, # sidebar文件间距大小设定
	"theme_primer_tab_active_blue": false, # active_tab背景颜色设定
	"theme_primer_tabs_font_normal": true, # tab字体大小设定
	"theme_primer_tabs_xlarge": true # tab大小设定
}
```

## sidebar,tabs字体设置

`command+shirt+p`呼出Package Control菜单,输入`PackageResourceViewer:Open Resource`找到主题文件`*.sublime-theme`,找到`tab_label`,`sidebar_label`, 在最后面添加`"font.face":"你想替换的字体"`,全部添加完成后保存即可。

最终效果图

![preview](/images/cover/TQnGjoRHXSWIEVqxepv537bvnkrzaBPI.jpeg)