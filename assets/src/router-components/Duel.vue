<template>
  <div id="duel">
    <h2 id="main-title">{{title}}</h2>

    <div class="section">
      <div class="player" v-for="(i, player) in duel.players" :class="playerClass(i)">
        <span class="player-title">{{player.title}}</span>

        <h1 class="score">{{score(player.id)}}</h1>
      </div>
    </div>

    <div class="section">
      <ul id="messages">
        <li class="message" v-for="message in messages">[{{message.host.nickname}}]: {{message.content}} ({{message.scores[duel.players[0].id]}} - {{message.scores[duel.players[1].id]}})</li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'DuelPage',

    data() {
      return {
        duel: {
          players: []
        },
        messages: [],
        messagesIds: new Set(),
        peer: null,
        peerConns: new Set()
      }
    },

    computed: {
      title() {//赛事标题
        if (!this.duel.players.length) return ''

        return `${this.duel.players[0].title} VS ${this.duel.players[1].title}`
      }
    },

    ready() {
      const duelId = this.$route.params.id

      fetch(`/api/duel/${duelId}`)//获取当前赛事详情
        .then(res => res.json())
        .then(data => {
          this.duel = data.duel
          this.messages = this.messages.concat(data.messages) //从服务器获取 messages

          for (const message of data.messages) {
            this.messagesIds.add(message.id) //保存 messagesIds
          }

          this.setupPeer() //初始化 P2P 客户端

          if (data.directly) { //直连
            this.connectToServer() //连接服务器
          } else {
            this.connectToPeer() //连接其他客户端
          }
        })
    },

    methods: {
      playerClass(i) {
        switch (i) {
          case 0:
            return { 'player-blue': true }
          case 1:
            return { 'player-red': true }
        }
      },

      score(id) { //赛事比分对象中 用id 找 比分
        return this.duel.scores[id] || 0
      },

      setupPeer() { //连接 p2p 服务器
        const id = Math.random().toString(32).substr(2)
        this.peer = new Peer(id, { //返回 实例并保存
          path: `/peer`, 
          host: location.hostname,
          port: parseInt('9000'),
          token: this.$route.params.id// token 是 赛事id
        })
        this.peer.id = id

        this.peer
          .on('connection', conn => { //连接的实例
            this.peerConns.add(conn)
            conn.on('data', data => this.handleMessage(JSON.parse(data))) 
            //从连接的实例中接收data 数据并处理

            conn.on('close', () => {
              this.peerConns.delete(conn)//删除连接实例
            })
          })
      },

      connectToServer() {
        const wsURL = `ws://${location.hostname}:8000/direct`
        const socket = new WebSocket(wsURL) //启用 WebSocket

        socket.onopen = evt => {
          socket.send(JSON.stringify({
            type: 0,
            id: this.peer.id, //客户端 id
            duel: this.$route.params.id //赛事id
          }))
        }

        socket.onmessage = evt => { //从服务器收到信息
          this.handleMessage(JSON.parse(evt.data))
        }
      },

      connectToPeer() { //连接其他客户端
        fetch(`/api/duel/${this.$route.params.id}/nearest?id=${this.peer.id}`) //寻找附近的客户端
          .then(res => res.json())
          .then(data => {
            const conn = this.peer.connect(data.id)
            conn.on('data', data => this.handleMessage(JSON.parse(data))) //监听信息
            this.peerConns.add(conn) //加入连接池
          })
      },

      handleMessage(data) {
        switch (data.type) {
          // Message
          case 1:
            if (this.messagesIds.has(data.message.id)) return //已接受过当前信息

            this.messagesIds.add(data.message.id) 
            this.messages.unshift(data.message) //加入新的信息
            this.duel.scores = data.message.scores //更新比分

            for (const conn of this.peerConns) {
              conn.send(JSON.stringify(data)) //遍历所有 p2p 实例，再发送当前的 data
            }

            break
        }
      }
    }
  }
</script>

<style scoped>
  #main-title {
    text-align: center;
  }

  .section {
    width: 98vw;
    margin: 1vw;
    background: #fff;
    box-shadow: 0 1px 1px rgba(0,0,0,.3);
    border-radius: 2px;
    box-sizing: border-box;
    overflow: hidden;
    margin-bottom: .5rem;
  }

  .player {
    width: 49vw;
    float: left;
    margin: 0;
    border: 0;
    padding: 1rem;
    text-align: center;
    color: #FFF;
  }

  .player:first-child {
    border-radius: 2px 0 0 2px;
  }

  .player:last-child {
    border-radius: 0 2px 2px 0;
  }

  .player-red {
    background: #ff4d4d;
  }

  .player-blue {
    background: #3c8fff;
  }

  .score {
    font-size: 3rem;
    margin: 1rem 0 .5rem 0;
  }

  #messages {
    list-style: none;
    padding: 0;
    margin: 10px;
    height: 66vh;
    overflow-y: scroll;
  }

  .message {
    margin-bottom: .4rem;
    font-size: 1.1rem;
  }
</style>