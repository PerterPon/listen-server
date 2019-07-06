
/*
 * dash.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Sat Jul 06 2019 21:42:16 GMT+0800 (CST)
 */

import { NodeDashClient } from 'node-dash-client';

import { data as radioData } from 'src/radio-data';

const MAX_CACHE_NUM = 20;

export class Dash {

    public dashName: string = '';
    private mpd: string = '';

    private dash: NodeDashClient = null;

    public async init(name: string, mpdFile: string): Promise<void> {
        this.dashName = name;
        this.mpd = mpdFile;
        this.dash = new NodeDashClient({
            mpdFile
        });
        radioData.set(name, {
            firstFregment: null,
            mediaFregment: [],
        });
        await this.dash.init();
        await this.getFirstFregment();
    }

    public async getFirstFregment(): Promise<Buffer> {
        const dataItem = radioData.get(this.dashName);
        if (null !== dataItem.firstFregment) {
            return dataItem.firstFregment;
        }
        const firstFregment: Buffer = await this.dash.getFirstFregment();
        dataItem.firstFregment = firstFregment;
        return firstFregment;
    }

    public async getMediaFregment(): Promise<{data: Buffer, ID: number}> {
        const dataItem = radioData.get(this.dashName);
        const mediaData: Buffer = await this.dash.getMediaFregment();
        const fregmentId: number = Math.floor(Date.now() / 1000);
        dataItem.mediaFregment.push(fregmentId);
        if (dataItem.mediaFregment.length > MAX_CACHE_NUM) {
            dataItem.mediaFregment.shift();
        }
        return {
            data: mediaData,
            ID: fregmentId
        }
    }

}
