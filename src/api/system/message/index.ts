import request from '@/config/axios'
import { APIListParams, APICommonTableData } from '@/api/common/types'
import {
  MsgDisplayType,
  MessageData,
  MessageType,
  MessageTableData,
  MessageEditData
} from './types'

export const getMessageTableList = async (
  data: APIListParams & { messageType: MessageType; displayType: MsgDisplayType[] }
) => {
  const response = await request.post<APICommonTableData<MessageData>>({
    url: '/agent/base/mess/page',
    data
  })
  return {
    ...response,
    data: {
      ...response.data,
      records: response.data.records.map((msg) => {
        return {
          ...msg,
          displayType: msg.displayType.split(',') as MsgDisplayType[]
        }
      })
    }
  } as IResponse<APICommonTableData<MessageTableData>>
}

export const getMessageList = async () => {
  const response = await request.post<MessageData[]>({
    url: '/agent/base/mess/list',
    data: {
      messageType: MessageType.Agent,
      displayType: [MsgDisplayType.Login, MsgDisplayType.Marquee]
    }
  })
  return response.data.map((msg) => {
    return {
      ...msg,
      displayType: msg.displayType.split(',')
    }
  }) as MessageTableData[]
}

export const delMessages = (ids: number[]): Promise<IResponse> => {
  return request.post({ url: '/agent/base/mess/delete', data: { ids } })
}

export const saveMessage = (data: MessageEditData): Promise<IResponse> => {
  return request.post({ url: '/agent/base/mess/saveOrUpdate', data })
}
