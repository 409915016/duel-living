'use strict';
// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

const path = require('path');
const AV = require('leanengine');
const Koa = require('koa');
const views = require('koa-views');
const statics = require('koa-static');
const bodyParser = require("koa-bodyparser");

import http from 'http'
import { PeerServer } from './libs/peer'
import { WSServer as WebSocketServer } from './libs/ws'
import routes from './routes'

const app = new Koa();
const server = http.createServer()
const wss = WebSocketServer(server)
const peerServer = PeerServer(server)
app.use(bodyParser());

const router = routes(peerServer, wss)


app.use(router.routes())

// 设置模版引擎
app.use(views(path.join(__dirname, 'views')));

// 设置静态资源目录
app.use(statics(path.join(__dirname, 'public')));

// 加载云引擎中间件
app.use(AV.koa());


// router.get('/', async function(ctx) {
//   ctx.state.currentTime = new Date();
//   await ctx.render('./index.ejs');
// });

// 可以将一类的路由单独保存在一个文件中
// app.use(router.routes());

module.exports = app;
