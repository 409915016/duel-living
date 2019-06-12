import Duel from '../models/Duel'
import Player from '../models/Player'
import Message from '../models/Message'
import Host from '../models/Host'

const router = {
  get: {},
  post: {}
}

let peerServer = null
let websocketServer = null

router.get.fetchAllDuels = async function(ctx) { //返回所有比赛列表
  const duels = await Duel.fetchAllDuels()
  
  ctx.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuelsNotYet = async function(ctx) { //未开始的比赛列表
  const duels = await Duel.fetchDuelsNotYet()

  this.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuelsPlaying = async function(ctx) { //正在进行的比赛列表
  const duels = await Duel.fetchDuelsPlaying()

  this.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuelsEnded = async function(ctx) { //结束的比赛列表
  const duels = await Duel.fetchDuelsEnded()

  this.body = {
    duels: duels.map(duel => duel.plain())
  }
}

router.get.fetchDuel =async function(ctx) { //返回某场比赛详细信息
  const duel = await Duel.fetch(this.params.id)
  const messages = await Message.fetchMessagesByDuel(duel, 20)

  this.body = {
    duel: duel.plain(),
    messages: messages.map(message => message.plain()),
    directly: websocketServer.isAvailable()
  }
}

router.get.fetchDuelMessages = async function(ctx) { //某场赛事的 消息列表
  const count = parseInt(this.query.count) || 20

  const duel = await Duel.fetch(this.params.id)
  const messages = await Message.fetchMessagesByDuel(duel, count)

  this.body = {
    messages: messages.map(message => message.plain())
  }
}

router.get.fetchNearestPeer = async function(ctx) { //p2p 
  const id = this.params.id
  const peerId = this.query.id

  const nearestId = await peerServer.fetchNearestId(peerId, id)

  this.body = {
    id: nearestId
  }
}

router.post.newDuel = async function(ctx) { //创建新的赛事 需：比赛双方id 主持人登录
  if (!this.req.currentUser) return this.body = { //未登录
    error: 'not logined' 
  }

  const playersId = this.request.body.players

  const players = await Promise.all( //根据 id 数组取得所有参赛方对象
    playersId.map(id => Player.fetch(id))
  )

  const duel = new Duel(
    players, //参赛方对象 array
    { [playersId[0]]: 0, [playersId[1]]: 0 }, //比分
    [ Host.wrap(this.req.currentUser) ] //主持人登录信息
  )

  await new Promise(resolve => duel.once('ready', resolve))

  this.body = {
    duel: duel.plain() //返回创建好的赛事信息
  }
}

router.post.updateDuelStatus = async function(ctx) { //更新赛事状态
  if (!this.req.currentUser) return this.body = {
    error: 'not logined'
  }

  const duel = await Duel.fetch(this.params.id)
  await duel.updateStatus(parseInt(this.request.body.status))

  this.body = {
    status: parseInt(this.request.body.status)
  }
}

router.post.postMessage = async function(ctx) { //提交赛事消息数据
  const content = this.request.body.content  //消息内容
  const host = Host.wrap(this.req.currentUser) //检查当前主持人信息
  const duel = await Duel.fetch(this.params.id) //赛事id
  const scores = this.request.body.scores //分数

  await duel.updateScores(scores) //更新赛事的比分

  const message = new Message(duel, content, scores, host) //创新的赛事消息

  this.body = {
    message: message.plain() //返回消息结果
  }
}

export default (_peerServer, _websocketServer) => {
  peerServer = _peerServer //p2p 
  websocketServer = _websocketServer //

  Message.onNewMessage(message => { //创建新的消息
    websocketServer.boardcast(JSON.stringify({
      type: 1, 
      message: message //消息实体
    }), message.duel.id) //赛事id
  })

  return router
}