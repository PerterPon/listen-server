
/*
 * radio-data.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Sun Jul 07 2019 00:14:56 GMT+0800 (CST)
 */

export interface TRadioDataItem {
    firstFregment: Buffer;
    mediaFregment: number[];
};

export const data: Map<string, TRadioDataItem> = new Map();
