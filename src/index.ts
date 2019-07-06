
/*
 * index.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Sun Jul 07 2019 00:02:56 GMT+0800 (CST)
 */

import * as oss from 'src/oss';
import { WsServer } from 'src/ws-server';
import * as config from 'src/config';
import { Dash } from 'src/dash';

let wsServer: WsServer;

async function init(): Promise<void> {
    wsServer = new WsServer();
    await config.init();
    const configInfo: config.TListenConfig = config.getConfig();
    await oss.init(configInfo.oss);
}

async function start(): Promise<void> {
    await init();
    await startDashs();

    // init websocket server here, to ensure the dash is ready.
    await wsServer.init();
}

async function startDashs(): Promise<void> {
    const configInfo: config.TListenConfig = config.getConfig();
    for(let name in configInfo.mpds) {
        const mpd: string = configInfo.mpds[name as string];
        startDash(name, mpd);
    }
}

async function startDash(name: string, mpd: string): Promise<void> {
    const dash: Dash = new Dash();
    await dash.init(name, mpd);
    listenDash(dash, name);
}

async function listenDash(dash: Dash, name: string): Promise<void> {
    while (true) {
        await dash.getMediaFregment();
        
    }
}

start();
