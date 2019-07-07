
/*
 * radio-data.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sun Jul 07 2019 00:14:56 GMT+0800 (CST)
 */

export interface TRadioDataItem {
    firstFregment: string;
    mediaFregment: number[];
};

export const radioData: Map<string, TRadioDataItem> = new Map();
