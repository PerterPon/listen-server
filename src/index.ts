
/*
 * index.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sun Jul 07 2019 00:02:56 GMT+0800 (CST)
 */

import * as oss from 'src/oss';
import * as wsServer from 'src/ws-server';
import * as config from 'src/config';
import { Dash } from 'src/dash';
import { EEvent } from './enum';

async function init(): Promise<void> {
    console.log('[MAIN] initing ...');
    await config.init();
    const configInfo: config.TListenConfig = config.getConfig();
    await oss.init(configInfo.oss);
}

async function start(): Promise<void> {
    console.log('[MAIN] starting ...');
    await init();
    await startDashs();

    // init websocket server here, to ensure the dash is ready.
    await wsServer.init();
    console.log('[MAIN] listen server start success!');
}

async function startDashs(): Promise<void> {
    const configInfo: config.TListenConfig = config.getConfig();
    const dashQueue: Promise<void>[] = [];
    for(let name in configInfo.mpds) {
        const mpd: string = configInfo.mpds[name as string];
        dashQueue.push(startDash(name, mpd));
    }
    await Promise.all(dashQueue);
}

async function startDash(name: string, mpd: string): Promise<void> {
    const dash: Dash = new Dash();
    await dash.init(name, mpd);
    dash.on(EEvent.MEDIA_FREGMENT, onMediaFregment);
    dash.start();
}

async function onMediaFregment(name: string, fregmentId: number): Promise<void> {
    wsServer.onDashUpdate(name, fregmentId);
}

start();
