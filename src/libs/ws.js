import { Server as WebSocketServer } from 'ws'
import { merge } from 'lodash'

const sockets = new Map()
const duels = new Map()
const maxNodePeerNum = 100 //连接数量上限

export function WSServer(server) { //新建 WebSocket 实例
  const wss = new WebSocketServer({
    server,
    path: '/direct',
    port: '8000' //fix cant in default port 3000
  })

  wss.on('connection', connection) //客户端连接操作
  merge(wss, proto)

  return wss
}

function connectionsCount() {
  return sockets.size //返回 Map 对象数量，表示 sockets客户端数量
}

function isAvailable() { //检查当前是否超载
  return connectionsCount() < maxNodePeerNum
}

function setMaxNodePeerNum(n) { //设置最大客户端数量
  maxNodePeerNum = n
}

function connection(socket) { //处理 message 事件数据
  socket.on('message', msg => handleMessage(msg, socket))
}

function handleMessage(msg, socket) { //处理 web socket 过来的信息
  const data = JSON.parse(msg)

  switch (data.type) {
    // Hand shaking
    case 0: //握手连接
      sockets.set(data.id, socket)  //sockets Map 对象
      //保存 socket 对象到 Map 中， P2P 客户端标识 作为 key

      if (!duels.has(data.duel)) //检查客户端所看的赛事在不在 服务器中
        duels.set(data.duel, new Set()) //不在的话就将赛事 id 为key，val 为空的 Set对象

      duels.get(data.duel).add(data.id) //客户端已记录，将 P2P 客户端标识放入 Set val 里
      break

    // Disconnect
    case 2:
      sockets.delete(data.id)

      if (duels.has(data.duel)) {
        duels.get(data.duel).delete(data.id)
      }
      break
  }
}

function boardcast(data, duelId) { //服务器广播客户端
  if (!duels.has(duelId)) return //检查 赛事id 在不在内存中

  const socketsIds = duels.get(duelId)//取出 peer id

  for (const id of socketsIds) {//循环 peer id
    const socket = sockets.get(id) //取出对应的 socket 对象，发送对应的数据
    socket.send(data)
  }
}

export const proto = {
  connectionsCount,
  isAvailable,
  setMaxNodePeerNum,
  boardcast
}