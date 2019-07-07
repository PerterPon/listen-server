
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
    return {
        event: EEvent.REGISTER,
        data: {
            firstFregment: item.firstFregment,
            latestFregment: item.mediaFregment[item.mediaFregment.length - 1],
            baseUrl: `${configInfo.ossPrefix}/${name}`
        }
    }
}
