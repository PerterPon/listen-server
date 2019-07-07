
/*
 * oss.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sat Jul 06 2019 21:51:21 GMT+0800 (CST)
 */

import * as OSS from 'ali-oss';
import * as config from 'src/config';

let oss: OSS;

export async function init(options: OSS.Options): Promise<void> {
    const configInfo: config.TListenConfig = config.getConfig();
    oss = new OSS(configInfo.oss);
}

export async function putFile(fileName: string, file: Buffer): Promise<void> {
    await oss.put(fileName, file);
}
