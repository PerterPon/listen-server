
/*
 * ws-server.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sat Jul 06 2019 21:49:32 GMT+0800 (CST)
 */

import * as https from 'https';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as crypto from 'crypto';

import * as config from 'src/config';
import * as controllers from 'src/controller';
import { EEvent } from './enum';

export interface TWSEvent<T = any> {
    event: string;
    data: T;
}

export interface TRegisterData {
    timestamp: number;
    sign: string;
    name: string;
    latestFregmentId: number;
}

function sleep(time: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

const connections: Map<string, WebSocket[]> = new Map();
let httpsApp: https.Server;
let wssServer: WebSocket.Server;
const connectionStatus: Map<WebSocket, boolean> = new Map();
const connectionName: Map<WebSocket, string> = new Map();

const EXPIRED_TIME = 60 * 1000;

export function init(): Promise<void> {
    const etcFolder: string = config.getEtcFolderPath();
    const configInfo: config.TListenConfig = config.getConfig();
    httpsApp = https.createServer({
        cert: fs.readFileSync(path.join(etcFolder, 'ssl.pem')),
        key: fs.readFileSync(path.join(etcFolder, 'ssl.key'))
    });

    wssServer = new WebSocket.Server({
        server: httpsApp
    });

    wssServer.on('connection', (connection: WebSocket) => {
        console.log('[WS-SERVER] new connection');
        connectionStatus.set(connection, true);
        connection.on('message', onMessage.bind(undefined, connection));
        connection.on('close', onClose.bind(undefined, connection));
        connection.on('error', onError.bind(undefined, connection));
    });

    return new Promise((resolve) => {
        httpsApp.listen(configInfo.wsPort, () => {
            console.log('[WS-SERVER] https server start success');
            deadCheck();
            resolve();
        });
    });
}

export async function onDashUpdate(name: string, fregmentId: number): Promise<void> {
    const conns: WebSocket[] | undefined = connections.get(name);
    if (void 0 === conns) {
        return;
    }

    console.log(`[WS-SERVER] dash update, name: [${name}], fregmentId: [${fregmentId}]`);
    for (let i = 0; i < conns.length; i++) {
        const conn: WebSocket = conns[i];
        conn.send(JSON.stringify({
            event: EEvent.MEDIA_FREGMENT,
            data: fregmentId,
        }));
    }

}

async function onMessage(connection: WebSocket, data: WebSocket.Data): Promise<void> {
    // if message is not string, ignore
    if (true === _.isString(data)) {
        try {
            const dataObj: TWSEvent = JSON.parse(data as string);
            const event: string = dataObj.event;
            if (EEvent.PING === event) {
                onPing(connection);
                return;
            } else if (EEvent.REGISTER === event) {
                onRegister(dataObj.data, connection);
            }

            const name: string|undefined = connectionName.get(connection);
            if (undefined === name) {
                return;
            }

            //TODO: a litte dirty
            const handler = (controllers as any)[event];
            if (true === _.isFunction(handler)) {
                const resData: any = await handler(name, dataObj.data, connection);
                // TODO: excute handler
                if (false === _.isEmpty(resData)) {
                    connection.send(JSON.stringify(resData));
                }
            }
        } catch(e) {
            console.log(`parse data: [${data}] with error`);
        }
    }
}

async function onRegister(data:TRegisterData, connection: WebSocket): Promise<void> {
    const configInfo: config.TListenConfig = config.getConfig();
    const now: number = Date.now();
    if (now - data.timestamp >= EXPIRED_TIME) {
        terminateConnection(connection);
        return;
    }

    const md5 = crypto.createHash('md5');
    const serverSideSign: string = md5.update(`${configInfo.salt}${data.timestamp}`).digest('hex');
    if (serverSideSign !== data.sign) {
        terminateConnection(connection);
        return;
    }

    if (true === _.isEmpty(configInfo.mpds[data.name])) {
        connection.send(JSON.stringify({
            event: EEvent.REGISTER,
            data: {
                error: 'name did not exists'
            }
        }));
        return;
    }

    removeConnection(connection);
    addConnection(data.name, connection);
}

async function onClose(connection: WebSocket, code: number, reason: string): Promise<void> {
    console.log(`[WS-SERVER] connection closeed, code: [${code}], reason: [${reason}]`);
    terminateConnection(connection);
}

async function onError(connection: WebSocket, err: Error): Promise<void> {
    console.log(`[WS-SERVER] connection with error: [${err.message}]`);
    terminateConnection(connection);
}

async function onPing(connection: WebSocket): Promise<void> {
    connectionStatus.set(connection, true);
    connection.send(JSON.stringify({
        event: EEvent.PONG,
    }));
}

function terminateConnection(connection: WebSocket): void {
    try {
        connection.terminate();
    } catch(e) {}
    removeConnection(connection);
}

function removeConnection(connection: WebSocket): void {
    const name: string = connectionName.get(connection);
    connectionStatus.delete(connection);
    connectionName.delete(connection);

    const conns: WebSocket[] = connections.get(name);
    if (false === _.isArray(conns)) {
        return;
    }
    _.remove(conns, (ws: WebSocket) => {
        return ws === connection;
    });
    connections.set(name, conns);
}

function addConnection(name: string, connection: WebSocket): void {
    let conns: WebSocket[]|undefined = connections.get(name);
    if (undefined === conns) {
        conns = [];
    }
    conns.push(connection);
    connections.set(name, conns);

    connectionName.set(connection, name);
    connectionStatus.set(connection, true);
}

let checking: boolean = false;
async function deadCheck(): Promise<void> {
    if (true === checking) {
        return;
    }
    checking = true;
    while (true) {
        await sleep(30 * 1000);
        const clients: Set<WebSocket> = wssServer.clients;
        clients.forEach((ws: WebSocket) => {
            if (true !== connectionStatus.get(ws)) {
                console.log('[WS-SERVER] found an dead connection, terminate it');
                terminateConnection(ws);
            }
            connectionStatus.set(ws, false);
        })
    }
}
