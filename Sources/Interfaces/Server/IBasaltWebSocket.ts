import { WebSocket } from 'uWebSockets.js';

import { IBasaltUserData } from '@/Interfaces';

export interface IBasaltWebSocket extends WebSocket<IBasaltUserData> {}
