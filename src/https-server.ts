
/*
 * https-server.ts
 * Author: PerterPon<perterpon@gmail.com>
 * Create: Sun Aug 18 2019 14:00:31 GMT+0800 (中国标准时间)
 */

import * as https from 'https';

import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as crypto from 'crypto';

import * as config from 'src/config';
import { IncomingMessage, ServerResponse } from 'http';
import { register } from 'src/controller';
import * as url from 'url';
import { TWSEvent, TRegisterData } from 'src/ws-server';

export async function init(): Promise<void> {

    const etcFolder: string = config.getEtcFolderPath();
    const app: https.Server = https.createServer({
        cert: fs.readFileSync(path.join(etcFolder, 'ssl.pem')),
        key: fs.readFileSync(path.join(etcFolder, 'ssl.key'))
    }, async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const urlParam: url.UrlWithParsedQuery = url.parse(req.url, true);
        if ('/radio/register' === urlParam.pathname) {
            const queryData: unknown = urlParam.query as unknown;
            const registerData: TRegisterData = queryData as TRegisterData;
            const checkResult: boolean = checkSign(registerData.timestamp, registerData.sign);
            if (false === checkResult) {
                res.statusCode = 403;
                res.end('no permission');
            } else {
                const resData: TWSEvent = await register(registerData.name, registerData);
                res.end(JSON.stringify(resData));
            }
        }
    });

    const lisConfig: config.TListenConfig = config.getConfig();
    app.listen(lisConfig.wsPort);

}

function checkSign(timestamp: number, clientSideSign: string): boolean {
    const configInfo: config.TListenConfig = config.getConfig();
    const md5 = crypto.createHash('md5');
    const serverSideSign: string = md5.update(`${configInfo.salt}${timestamp}`).digest('hex');
    return serverSideSign === clientSideSign;
}
