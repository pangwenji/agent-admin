/* eslint-disable no-magic-numbers */
import { useStorage } from '@/hooks/web/useStorage'
import { isHttps } from './is'

const WS_ORIGIN =
  isHttps(window.location.href) && import.meta.env.VITE_WSS_BASE_PATH
    ? import.meta.env.VITE_WSS_BASE_PATH
    : import.meta.env.VITE_WS_BASE_PATH

const url = `${WS_ORIGIN}/agentws/websocket`

let socket: WebSocket

type ListenerHandler = (ev: MessageEvent) => void

const messageListeners: ListenerHandler[] = []
const addMsgListener = (fn: (ev: MessageEvent) => void) => {
  if (messageListeners.find((func) => func === fn)) return
  messageListeners.push(fn)
}
const removeMsgListener = (fn?: (ev: MessageEvent) => void) => {
  if (!fn) {
    messageListeners.splice(0)
    return
  }
  const fnIndex = messageListeners.findIndex((func) => func === fn)
  if (fnIndex > -1) {
    messageListeners.splice(fnIndex, 1)
  }
}

function init() {
  //请求头添加token
  const { getStorage } = useStorage()
  const token = getStorage('token')
  socket = new WebSocket(url, [token])
  socket.onopen = function () {
    console.log('WebSocket is open now.' + new Date().toString())
    heartCheck.start()
  }

  socket.onclose = function (event) {
    console.log('websocket 断开: ' + event.code + ' ' + event.reason + ' ' + event.wasClean)
    console.log('WebSocket is closed now.')
    reconnect()
  }

  socket.onerror = function () {
    console.log('WebSocket is error now.')
  }

  socket.onmessage = function (event) {
    const message = event.data
    console.log('Received message: ' + message + ' ' + new Date().toUTCString())
    messageListeners.forEach((fn) => {
      fn(event)
    })
    heartCheck.start()
  }
}

//心跳检测
const HeartCheckTimeout = 28 * 1000 //每隔28秒发送心跳
const heartCheck: any = {
  timeout: HeartCheckTimeout,
  timeoutObj: null,
  //severTimeout: 5000,  //服务端超时时间
  //serverTimeoutObj: null,
  start: function () {
    // const _this = this
    this.timeoutObj && clearTimeout(this.timeoutObj)
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
    this.timeoutObj = setTimeout(function () {
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      //onmessage拿到返回的心跳就说明连接正常
      socket?.send('heartbeat') // 心跳包
      //计算答复的超时时间
      //_this.serverTimeoutObj = setTimeout(function() {socket.close();}, _this.severTimeout);
    }, this.timeout)
  }
}

let limitConnect = 3 // 断线重连次数
let timeConnect = 0
// 重连
function reconnect() {
  // lockReconnect加锁，防止onclose、onerror两次重连
  if (limitConnect > 0) {
    limitConnect--
    timeConnect++
    console.log('第' + timeConnect + '次重连')
    init()
  } else {
    console.log('TCP连接已超时')
  }
}

const close = () => {
  if (!socket) return
  socket.onclose = null
  socket.close()
  console.log('WebSocket is destroyed', socket.readyState)
}

const websocketTools = {
  init,
  close,
  addMsgListener,
  removeMsgListener
}

export default websocketTools
