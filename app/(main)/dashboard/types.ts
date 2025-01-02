export interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  isGroup?: boolean;
  memberCount?: number;
}
