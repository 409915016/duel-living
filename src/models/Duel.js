import AV from '../libs/lean'
import { EventEmitter } from 'events'

const DuelObject = AV.Object.extend('Duel')

import Host from './Host'
import Player from './Player'

class Duel extends EventEmitter {
  constructor(players = [], scores = {}, hosts = [], status = 0, save = true) {
    super()

    this.players = players
    this.scores = scores
    this.hosts = hosts
    this.status = status
    // Status: 0 - not yet, 1 - playing, 2 - ended

    if (save) {
      const duelObject = new DuelObject() //构建储存对象
      duelObject.set('scores', scores)    //设置分数
      duelObject.set('status', status)    //设置状态

      const playersRelation = duelObject.relation('players') //创建 players 中间表
      for (const player of players)
        playersRelation.add(player.object) //创建和比赛双方的关系

      const hostsRelation = duelObject.relation('hosts') //创建 hosts 中间表
      for (const host of hosts)
        hostsRelation.add(host.object) //创建和主持人的关系

      duelObject.save() //保存赛事表
        .then(duel => {
          this.object = duel
          this.id = duel.id
          this.emit('ready')
        })
        .catch(err => this.emit('error', err))
    }
  }

  updateScores(scores) { //更新比分
    this.object.set('scores', scores)
    return this.object.save()
  }

  updateStatus(status) { //更新比赛状态
    this.object.set('status', status)
    return this.object.save()
  }

  plain() {
    return {
      id: this.id,
      players: this.players.map(player => player.plain()),
      scores: this.scores,
      hosts: this.hosts.map(host => host.plain()),
      status: this.status
    }
  }

  static fetch(id) { //id 查找某个比赛
    const query = new AV.Query(DuelObject)
    return new Promise((resolve, reject) => {
      query.get(id)
        .then(object => Duel.wrap(object))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchAllDuels() { //所有比赛列表
    const query = new AV.Query(DuelObject)
    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchDuelsNotYet() { //未开始的比赛
    const query = new AV.Query(DuelObject)
    query.equalTo('status', 0)

    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchDuelsPlaying() { //比赛中
    const query = new AV.Query(DuelObject)
    query.equalTo('status', 1)
    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static fetchDuelsEnded() { //比赛结束
    const query = new AV.Query(DuelObject)
    query.equalTo('status', 2)
    return new Promise((resolve, reject) => {
      query.find()
        .then(results => results.map(Duel.wrap))
        .then(promises => Promise.all(promises))
        .then(resolve)
        .catch(reject)
    })
  }

  static wrap(object) { //包装函数
    return new Promise((resolve, reject) => {
      Promise.all([
        object.relation('players').query().find(),
        object.relation('hosts').query().find()
      ])
        .then(([ players, hosts ]) => {
          players = players.map(Player.wrap)
          hosts = hosts.map(Host.wrap)

          const scores = object.get('scores')
          const status = object.get('status')

          const duel = new Duel(players, scores, hosts, status, false)
          duel.object = object
          duel.id = object.id

          resolve(duel)
        })
        .catch(reject)
    })
  }
}

export default Duel
