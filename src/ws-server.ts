
/*
 * ws-server.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Sat Jul 06 2019 21:49:32 GMT+0800 (CST)
 */

import * as ws from 'ws';

import { data as radioData } from 'src/radio-data';

const connections: Map<string, []> = new Map();

export async function init(): Promise<void> {
    
}

export async function onDashUpdate(name: string): Promise<void> {
    const dataItem = radioData.get(name);
    const fregmentId: number = dataItem.mediaFregment[dataItem.mediaFregment.length - 1];
    const conns: [] | undefined = connections.get(name);
    if (void 0 === conns) {
        return;
    }

}

export class WsServer {

    public async init(): Promise<void> {

    }

}
