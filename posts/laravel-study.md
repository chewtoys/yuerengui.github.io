---
title: Laravel零碎知识学习
date: 2017-05-24 18:51:47
tags:
      - Laravel
---

> 起因是因为工作的项目里面用到的laravel相关的知识极为零碎,一直这么下去好像一直在原地踏步一样，索性花一点时间自己捣鼓一下，把laravel的整体知识大概梳理一遍，把一些重要的东西记录下来，好让自己以后不管在工作中还是自己的项目里需要laravel高级功能的时候，不至于手足无措。

# Laravel常规

## 显示视图

```php
//控制器方法
public function xxx()
{
    $view = View('folder.bladename');
    return $view;
}
```

<more></more>

## 传递变量给视图

```php
public function xxx()
{
    $view = View('folder.bladename');
    # 第一种
    return $view->with('name',$name);
    # 第二种
    return $view->with([
        'name1' => 'value1',
        'name2' => 'value2'
    ])
    # 第三种
    $data = array(
        'name1' => 'value1',
        'name2' => 'value2'
    );
    return View('folder.bladename',$data);
    # 第四种
    $name1 = 'value1';
    $name2 = 'value2';
    return View('folder.bladename',compact('name1','name2'))
}
# 第五种，直接在模板中使用@inject声明类，通过类的方法调用数据
// xxx.blade.php
@inject('variable','App\Variables');
{{$variable->getNumber()}}
```

## 模板的部分代码共用

```js
@extend('master') //引入view文件夹下的master.blade.php到某个视图中
@yield('js-block');  //对某个模块进行占位，使用@section方法来写入具体内容
@section('js-block')
//details
@stop
@include('errors.list') //引入view文件夹下的某些共用元素
```

## 在视图中显示变量值

```js
// xx.blade.php
// {{$xxx}} 转义变量中的特殊字符为文本
// {!!$xx!!} 将变量中的特殊字符原样输出到网页
<input type="text" value="{{$name}}" />
```

## 配置路由

```php
//配置路由某一项，url访问:domain/checkmail
Route::get('/checkmail', 'CompanyController@checkmail');
//配置控制器下所有路由
Route::resource('articles','ArticlesController');
```


## artisan命令

```bash
# 创建控制器 默认会在控制器中生成一堆常用方法
php artisan make:controller SiteController
# 创建控制器 不生成任何默认方法
php artisan make:controller SiteController --plain
# 创建model
php artisan make:model Article
# 创建单独的表单验证文件
php artisan make:request createArticleRequest
# 查看生效的路由列表
php artisan route:list
# 创建中间件
php artisan make:middleware auth
```

## Laravel Migration

```bash
php artisan migrate # 创建迁移数据库表
php artisan migrate:rollback # 回滚最最近一次运行的迁移任务
php artisan make:migration create_article_table --create=articles # 创建一个新的迁移文件
php artisan make:migration add_id_column_to_article --table=articles # 创建一个新的迁移文件,针对已经存在的数据表做出修改
```

## 表单验证

1.使用单独的验证文件

```php
//xxxController.php
public function store(Requests\CreateArticleRequest $request){
    //continue;
}
//xxxRequest.php
public function rules(){
    return [
        'title'=>'required|min:3'
    ];
}
```

2.在post方法中验证

```php
//xxxController.php
public function store(Request $request){
    $this->validate($request,['title' => 'required'])
}
```

## setAttribute和queryScope用法

```php
//模型 xxx.php
//给模型添加固定方法来处理某些特地的字段
public function setSexAttribute($sex){
    $this->attribute['sex'] = 1;
}

```

```php
//模型 xxx.php
//给模型查询的时候添加链式操作
public function scopePublished($query){
    $query->where('published_at','<=',time());
}

//TODO Carbon的使用

```

## 取出外键关联的所有数据

一般做法当然是用`model`添加查询条件找到某个外键对应的数据，不过还有另外一种做法

```php
//比如你要查询某个用户对应的所有文章，文章中用户的外键是'user_id'
//用户模型 User.php

public function articles(){
    return $this->hasMany('App\Article','user_id');
}

//调用
$user = User::where('id',1)->first();
$user->articles();
```

## 注册并使用中间件

```php
//创建中间件
php artisan make:middleware isadmin
//在中间件的handle方法中进行逻辑判断
public function handle($request, Closure $next)
{
    if(true){
        return $next($request);
    }
    return Redirect('/');
}
//将中间件注册到kernel.php的中间件数组中
protected $routeMiddleware = [
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'can' => \Illuminate\Foundation\Http\Middleware\Authorize::class,
    'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    'test' => \App\Http\Middleware\TestMiddleware::class,
    'isadmin' => \App\Http\Middleware\isadmin::class
];
//在路由中使用中间件,当访问domain/admin/test url时，便会先去中间件逻辑判断，判断通过则会走路由组下面的路由
Route::group(['prefix'=>'admin','middleware'=>'isadmin'],function(){
    Route::get('/test',function(){
        return 'yes'
    })
})
```

## 分页

```php
//xxController.php
$list = xxModel::where('type',1)->pagination(15);
$view->with('list',$list);

//xx.blade.php
{{ $list->appends(['param2'=>'value2'])->render() }}
```

## validation自定义验证的错误信息返回

有某些非必填项的验证需要单独处理，但是我们也想让它和`Validator`的错误抛出方式一致，下面是实现方式

```php
//控制器
xxxController.php
$message = array('input_name'=>'错误提示信息');
return redirect()->back()->withInput()->withErrors($message);

//视图
views.blade.php
{{ $errors->first('input_name', ':message') }}
```



# Laravel高级

## Ioc容器介绍

```php
//TODO
```


# PHP常规

## 匿名函数和闭包

php中的匿名函数和闭包其实都是Closure的一个实例，而且在php中匿名函数和闭包是同一种东西。

```php
function a($method){
    return $method instanceof Closure;
}
a(function(){
    return 1;
})

//结果为a函数返回true
```

## call_user_function_array使用

```php
//调用回调函数（可以是匿名函数）,并将第二个数组参数作为回调函数的参数传入
call_user_func_array(function($arg1,$arg2){
    dd($arg1+$arg2);
},[1,100]);

//例子
$concrete = function($name){
			echo $name;
	};
$shared = 1;
$func = compact('concrete');
call_user_func_array($func['concrete'],['lisi']);
```

## 诸如 ::class 的使用

laravel 引入中间件配置的时候会在文件名后面加上::class 获取文件的类名,如果该类无命名空间,则获取的就是 class 的名称字符串,如果有命名空间,则会返回包含命名空间的完全限定名称,所以,明显可以知道,这对导入有命名空间的类有很大的便利。诸如

```php
//无命名空间
class person{}
echo person::class
'person'

//有命名空间
namespace app
class person{}
‘app\person'
```

## laravel5.2 自定义分页

```bash
php artisan vendor:publish --tag=laravel-pagination 
# 这一步是将 vendor 文件夹下的视图移动到 view 下面
{!! $foo->links('vendor.pagination.default'); !!}
# 引入 view 下面的分页视图模板
# 然后如果想修改视图的 html 结构在 view/vendor/pagination/default.balde.php 中修改即可
```