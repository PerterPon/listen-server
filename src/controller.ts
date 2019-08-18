
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
    return {
        event: EEvent.REGISTER,
        data: {
            baseUrl: `${configInfo.ossPrefix}/${name}`,
            ...item.firstFregment,
        }
    }
}
