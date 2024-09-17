export type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
};

export type User = {
  id: number;
  fullname: string;
  username: string;
  bio?: string;
};

export type WsPayload = {
  readonly msgType: string;
  readonly msgData: object;
};
