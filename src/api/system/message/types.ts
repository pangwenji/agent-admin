export type MessageData = {
  remark: null
  createTime: string
  updateTime: string
  updaterUser: number
  createUser: string
  id: number
  title: string
  messageType: MessageType
  displayType: string
  displayMember: string
  messageContent: string
  effectDate: string
  invalidDate: string
}

export type MessageTableData = Omit<MessageData, 'displayType'> & {
  displayType: MsgDisplayType[]
}

export type MessageEditData = Pick<MessageTableData, 'displayType' | 'title' | 'messageContent'>

/* 消息类型(默认代理消息) AGENT_MESS:代理消息 / MEMBER_MESS:会员消息 */
export const enum MessageType {
  Agent = 'AGENT_MESS',
  Member = 'MEMBER_MESS'
}

/* 	公告类型 LOGIN_DISPLAY:登录/MARQUEE_DISPLAY:跑马灯 */
export const enum MsgDisplayType {
  Login = 'LOGIN_DISPLAY',
  Marquee = 'MARQUEE_DISPLAY'
}
