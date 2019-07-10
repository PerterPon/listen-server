
/*
 * radio-data.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sun Jul 07 2019 00:14:56 GMT+0800 (CST)
 */

import { TFirstFregment } from 'node-dash-client';

export interface TListenFirstFregment {
    sampleRate: number;
    codecs: string;
    duration: string;
    timescale: string;
    fileName: string;
    mimeType: string;
}

export interface TRadioDataItem {
    firstFregment: TListenFirstFregment;
    mediaFregment: number[];
};

export const radioData: Map<string, TRadioDataItem> = new Map();
