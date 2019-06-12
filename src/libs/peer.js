import { ExpressPeerServer } from 'peer'
import { merge } from 'lodash'
import fetch from 'node-fetch'


//P2P 协调客户端
const connectingIds = new Set() //唯一的数组
const regionMaps = new Map() //map 对象 保存着在看的赛事id  国家省市区 => new Set (很多客户端 客户端id)
const ids = new Map() //map 对象 保存着客户端id =>  ip 和 在看的赛事id

function parseIP(ip) { //解析 ip 地址所在地区
  if (ip === '::1') ip = '119.29.29.29'
  return fetch(`http://ip.taobao.com/service/getIpInfo.php?ip=${ip}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(info => ({
      country: info.country, //国家
      province: info.region, //区域
      city: info.city //城市
    }))
}

function connection(id) { // 路由/peer 连接过来
  //const id = Math.random().toString(32).substr(2)
  connectingIds.add(id)

  const ip = this.fetchIP(id) //用识别符找 ip 
  const duelId = this.fetchDuelID(id) //用识别符找 赛事id

  ids.set(id, {//保存 客户端id => ip 和 赛事id
    ip: ip,
    token: duelId
  })

  parseIP(ip) //解析ip 返回的国家省市区
    .then(region => {
      const keys = { //赛事 id 和 地区放在一起 => 对应客户端id
        level1: `${duelId}:${region.country}`,
        level2: `${duelId}:${region.country}:${region.province}`,
        level3: `${duelId}:${region.country}:${region.province}:${region.city}`
      }

      if (!regionMaps.has(keys.level1)) regionMaps.set(keys.level1, new Set())
      if (!regionMaps.has(keys.level2)) regionMaps.set(keys.level2, new Set())
      if (!regionMaps.has(keys.level3)) regionMaps.set(keys.level3, new Set())

      regionMaps.get(keys.level1).add(id)
      regionMaps.get(keys.level2).add(id)
      regionMaps.get(keys.level3).add(id)
    })
}

function disconnect(id) {//删除保存的 P2P 链接
  connectingIds.delete(id)

  const ip = this.fetchIP(id)
  const duelId = this.fetchDuelID(id)

  ids.delete(id)

  parseIP(ip)
    .then(region => {

      const keys = {
        level1: `${duelId}:${region.country}`,
        level2: `${duelId}:${region.country}:${region.province}`,
        level3: `${duelId}:${region.country}:${region.province}:${region.city}`
      }

      regionMaps.get(keys.level1).delete(id)
      regionMaps.get(keys.level2).delete(id)
      regionMaps.get(keys.level3).delete(id)
    })
}

function fetchNearestId(id, duelId) { //匹配最近的客户端
  const ip = this.fetchIP(id)

  return new Promise((resolve, reject) => {
    parseIP(ip)
      .then(region => {
        const keys = {
          level1: `${duelId}:${region.country}`,
          level2: `${duelId}:${region.country}:${region.province}`,
          level3: `${duelId}:${region.country}:${region.province}:${region.city}`
        }
        //返回相近的客户端id
        if (regionMaps.has(keys.level3)) return resolve(randomElement(regionMaps.get(keys.level3)))
        if (regionMaps.has(keys.level2)) return resolve(randomElement(regionMaps.get(keys.level2)))
        if (regionMaps.has(keys.level1)) return resolve(randomElement(regionMaps.get(keys.level1)))
      })
      .catch(reject)
  })
}

function fetchIP(id) { //用id 找出对应的 ip
  let ip = '119.29.29.29'
  if (this._clients.peerjs[id]) {  //id存在 于 peer 中吗
    ip = this._clients.peerjs[id].ip //取出
  } else if (ids.has(id)) { //存在于  客户端id 表中吗
    ip = ids.get(id).ip//取出
  } else {
  }
  return ip //返回
}

function fetchDuelID(id) {
  //_clients.peerjs 存在 客户端id吗
  //有的话 取出 token
  //没有的话 从 ids 中取出
  return this._clients.peerjs[id] ? this._clients.peerjs[id].token : ids.get(id).token
}


export const proto = {
  connection,
  disconnect,
  fetchNearestId,
  fetchIP,
  fetchDuelID
}

export function PeerServer(server) {
  const peerServer = ExpressPeerServer(server, {
    debug: false
  })

  peerServer.path = '/peer'
  //peerServer.emit('mount', { settings: {} })

  peerServer
    .on('connection', id => peerServer.connection(id))
    .on('disconnect', id => peerServer.disconnect(id))

  return merge(peerServer, proto)
}

function randomElement(set) { //new Set (很多客户端 客户端id)
  const size = set.size
  const pivot = Math.round(Math.random() * (size - 1)) //随机产出 客户端数量 0 ~size
  let rtnEl = null
  let n = -1

  set.forEach(el => { //找到随机出来的客户端id
    if (n === pivot) return
    n++
    if (n === pivot) rtnEl = el
  })

  return rtnEl
}