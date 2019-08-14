
/*
 * controller.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sun Jul 07 2019 12:43:52 GMT+0800 (CST)
 */

import { radioData, TRadioDataItem } from 'src/data';
import { EEvent } from 'src/enum';
import * as config from 'src/config';

import { TWSEvent, TRegisterData } from 'src/ws-server';

export async function register(name: string, data: TRegisterData): Promise<TWSEvent> {
    const item: TRadioDataItem|undefined = radioData.get(name);
    if (undefined === item) {
        return null;
    }

    const configInfo: config.TListenConfig = config.getConfig();
    let firstFregmentIds: number[] = [];
    const totalMediaLen: number = item.mediaFregment.length;
    if (1 === totalMediaLen) {
        firstFregmentIds = [item.mediaFregment[0]];
    } else if (2 <= totalMediaLen) {
        const latestFregment: number = data.latestFregmentId;
        const lastIndex: number = item.mediaFregment.indexOf(latestFregment);
        let startIndex: number = totalMediaLen - 2;
        if (-1 < lastIndex) {
            startIndex = lastIndex + 1;
        }
        if (startIndex <= totalMediaLen - 2) {
            firstFregmentIds = [item.mediaFregment[startIndex - 2], item.mediaFregment[startIndex - 1]];
        } else {
            firstFregmentIds = [item.mediaFregment[startIndex - 1]];
        }
    }
    return {
        event: EEvent.REGISTER,
        data: {
            firstFregment: item.firstFregment,
            latestFregments: firstFregmentIds,
            baseUrl: `${configInfo.ossPrefix}/${name}`
        }
    }
}
