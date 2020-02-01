
<p align="center">
  <a href="http://duel-living.avosapps.us/">
    <img src="http://img.pikapika.ink/duel/duel_index.png">
  </a>

  <h3 align="center">Duel Living</h3>

  <p align="center">
    本项目源自
    <br>
    <a href="https://github.com/iwillwen/duel-living"><strong>iwillwen/duel-living</strong></a>
    <br>
    在此感谢项目原作者<a href="https://github.com/iwillwen">小问</a>
  </p>
</p>

> Duel Living 的定位是一个非常简单的赛事文字直播平台，现实世界中也已经有很多类似的产品，Duel Living 便以这样的一种产品形式演示如何利用 ES2015 标准中的新特性，更加简单方便地实现项目需求。——《实战 ES2015》 P211

## Table of contents

 - [Why](#why)
 - [Demo](#demo)
 - [Quick start](#quick-start)
 - [FAQ](#faq)
 - [Todo list](#todo-list)
 - [Ref](#ref)
 
## Why

Duel Living 作为<a href="http://www.broadview.com.cn/book/3621">《实战 ES2015》</a>  中的实践案例，随着时间的推移，案例中使用的 `Node.js` `Koa` `Vue` 框架和 `LeanCloud SDK` 功能有较大的更新，部分 `API` 已过时。

该项目在[源代码](https://github.com/iwillwen/duel-living)上修复了这些问题，遵守作者原意:

- 使用 `Koa2` 作为后端
- 使用 JavaScript `ES2015` 语法
- 选用 `LeanCloud` 提供的开箱即用的数据存储方案
- 着重在业务逻辑的编写，无需关心应用开发环境、部署等问题

当然也有一些[遗留问题](#todo-list)

## Demo

- 访问 [duel-living.avosapps.us](http://duel-living.avosapps.us/) 预览该 demo
- [duel-living 管理后台](http://duel-living.avosapps.us/admin) username:mather pwd:admin

## Quick start

##### 注册 LeanCloud

项目数据存储依赖 [LeanCloud](https://www.leancloud.cn/) 提供的 LeanStorage 服务，在开发前预先创建基础数据，便于后面调试。

1. 创建 LeanCloud 帐号
2. 创建开发版应用（建议华北区）
3. 创建数据表 （Class）：
    - Duel
    - Message
    - Player  添加列 `title`
4. 使用 [API 在线测试工具](https://leancloud.cn/dashboard/apionline/index.html#!/user) 新建默认管理员用户：

```
{
    username: 'admin',
    password: 'admin',
    nickname: 'admin'
}
```

##### 本地运行

先安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](https://leancloud.cn/docs/leanengine_cli.html)，克隆项目：

```ssh
git clone https://github.com/409915016/duel-living.git
```
安装依赖：

```ssh
yarn install
```

登录 LeanCloud 帐号并关联当前应用：

```ssh
lean login
lean switch
```

运行项目：

```ssh
lean up
```

访问默认的 `http://localhost:3000` 和 `http://localhost:3000/admin` 


## 部署

#### LeanCloud 云引擎

在云引擎中将体验实例 Web 组的 **Web 主机域名** 设置为你喜爱的域名 `duel-living.avosapps.us`

使用 `lean deploy` 命令可上传至实例中：

```
E:\project>lean deploy
[INFO] Current CLI tool version:  0.20.1
[INFO] Retrieving app info ...
[INFO] Preparing to deploy mather(*********) to region: cn group: web production
[INFO] Node.js runtime detected
[INFO] Uploading file 743.85 KiB / 743.85 KiB  100.00% 1s
[REMOTE] 开始构建 20190616-205743
[REMOTE] 正在下载应用代码 ...
[REMOTE] 正在解压缩应用代码 ...
[REMOTE] 运行环境：nodejs
[REMOTE] 正在下载和安装依赖项 ...
[REMOTE] 存储镜像到仓库（138.41MB）...
[REMOTE] [Node.js] 使用 Node.js v10.16.0, Node SDK 3.4.0, JavaScript SDK 3.13.2
[REMOTE] 版本 20190616-205743 构建完成
[REMOTE] 开始部署 20190616-205743 到 web1
[REMOTE] 正在创建新实例 ...
[REMOTE] 正在启动新实例 ...
[REMOTE] 实例启动成功：{"runtime":"nodejs-v10.16.0","version":"3.4.0"}
[REMOTE] 正在更新云函数信息 ...
[REMOTE] 部署完成：1 个实例部署成功
[INFO] Deleting temporary files
```


### FAQ

##### 请求出现 429 Too many requests.

由于开发版应用分配的是免费体验实例，存在[休眠策略](https://leancloud.cn/docs/leanengine_plan.html#hash633315134)和有限的硬件资源。

我建议读者在**本地调试**中学习，会获得较好的体验。


### Todo list

由于未对 Node.js 有深入的了解，兼容推进过程中也遇到了一些暂时无解问题，未能按照作者原意：

- [ ] [WebSocket](https://github.com/websockets/ws) 服务未能挂载在默认端口，暂为 `8000`，路径不变
- [ ] [PeerJs](https://github.com/peers/peerjs) 服务未能挂载在默认端口，暂为 `9000`，路径不变


### Ref

##### [LeanCloud 命令行工具 CLI 使用指南](https://leancloud.cn/docs/leanengine_cli.html)

##### [LeanCloud 云引擎快速入门](https://leancloud.cn/docs/leanengine_quickstart.html)

##### [LeanCloud 数据存储开发指南 · JavaScript](https://leancloud.cn/docs/leanstorage_guide-js.html)
