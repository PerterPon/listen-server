
/*
 * test-index.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Wed Sep 04 2019 20:53:18 GMT+0800 (中国标准时间)
 */

import * as config from 'src/config';
import * as cos from 'src/cos';
import * as fs from 'fs';
import * as path from 'path';

async function start(): Promise<void> {
  await config.init();
  const configInfo: config.TListenConfig = config.getConfig();
  await cos.init();
  const fileContent: Buffer = fs.readFileSync('/Users/pon/project/listen-server/bbc2.mp3');
  await cos.putFile('test.mp3', fileContent);
  console.log('done');
}

start();
