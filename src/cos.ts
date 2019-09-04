
/*
 * cos.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Wed Sep 04 2019 20:43:33 GMT+0800 (中国标准时间)
 */

import * as Cos from 'cos-nodejs-sdk-v5';
import * as config from 'src/config';

let cos;

export interface TCOSOption {
  SecretId: string;
  SecretKey: string;
  Bucket: string;
  Region: string;
};

export async function init(): Promise<void> {
  const configInfo: config.TListenConfig = config.getConfig();
  cos = new Cos(configInfo.cos);
}

export async function putFile(fileName: string, file: Buffer): Promise<void> {
  const configInfo: config.TListenConfig = config.getConfig();
  return new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: configInfo.cos.Bucket,
      Region: configInfo.cos.Region,
      Key: fileName,
      Body: file
    }, (error: Error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

