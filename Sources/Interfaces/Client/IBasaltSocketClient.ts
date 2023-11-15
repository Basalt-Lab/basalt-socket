import { IBasaltConnectionManager, IBasaltEventListenerManager } from '@/Interfaces';

export interface IBasaltSocketClient extends IBasaltConnectionManager, IBasaltEventListenerManager {}
