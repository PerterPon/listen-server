
/*
 * controller.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sun Jul 07 2019 12:43:52 GMT+0800 (CST)
 */

import { radioData, TRadioDataItem } from 'src/data';
import { EEvent } from 'src/enum';
import * as config from 'src/config';

import { TWSEvent } from 'src/ws-server';

export async function register(name: string): Promise<TWSEvent> {
    const item: TRadioDataItem|undefined = radioData.get(name);
    if (undefined === item) {
        return null;
    }

    const configInfo: config.TListenConfig = config.getConfig();
    let firstFregmentIds: number[] = [];
    const totalMediaLen: number = item.mediaFregment.length;
    if (2 === totalMediaLen) {
        firstFregmentIds = [item.mediaFregment[0]];
    } else if (3 <= totalMediaLen) {
        firstFregmentIds = [item.mediaFregment[totalMediaLen - 2], item.mediaFregment[totalMediaLen - 3]];
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
