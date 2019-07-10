
/*
 * dash.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sat Jul 06 2019 21:42:16 GMT+0800 (CST)
 */

import * as Events from 'events';
import { NodeDashClient, TFirstFregment } from 'node-dash-client';

import { radioData, TRadioDataItem, TListenFirstFregment } from 'src/data';
import * as config from 'src/config';
import * as oss from 'src/oss';

import { EEvent } from 'src/enum';

const MAX_CACHE_NUM = 20;

export class Dash extends Events.EventEmitter {

    public dashName: string = '';
    private mpd: string = '';

    private dash: NodeDashClient = null;
    private listening: boolean = false;

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
        console.log(`[DASH] dash: [${this.dashName}] init success`);
        await this.getFirstFregment();
        console.log(`[DASH] get dash: [${this.dashName}] first fregment success`);
    }

    public async getFirstFregment(): Promise<TListenFirstFregment> {
        const dataItem = radioData.get(this.dashName);
        if (null !== dataItem.firstFregment) {
            return dataItem.firstFregment;
        }
        const firstFregment: TFirstFregment = await this.dash.getFirstFregment();
        const configInfo: config.TListenConfig = config.getConfig();
        const fregmentFileName: string = `${this.dashName}.dash`;
        const fileName: string = `${configInfo.ossPrefix}/${this.dashName}/${fregmentFileName}`;
        await oss.putFile(fileName, firstFregment.data);

        const listenFirstFregment: TListenFirstFregment = {
            duration: firstFregment.duration,
            timescale: firstFregment.timescale,
            codecs: firstFregment.codecs,
            mimeType: firstFregment.mimeType,
            fileName: fileName,
            sampleRate: firstFregment.sampleRate,
        };

        dataItem.firstFregment = listenFirstFregment;
        return dataItem.firstFregment;
    }

    public async start(): Promise<void> {
        if (true === this.listening) {
            return;
        }
        this.listening = true;
        const configInfo: config.TListenConfig = config.getConfig();
        while (true) {
            const mediaData: Buffer = await this.dash.getMediaFregment();
            const fregmentId: number = Math.floor(Date.now() / 1000);
            const fileName: string = `${configInfo.ossPrefix}/${this.dashName}/${fregmentId}.m4s`;

            const radioDataItem: TRadioDataItem = radioData.get(this.dashName);
            radioDataItem.mediaFregment.push(fregmentId);
            if (radioDataItem.mediaFregment.length >= MAX_CACHE_NUM) {
                radioDataItem.mediaFregment.shift();
            }

            await oss.putFile(fileName, mediaData);
            this.emit(EEvent.MEDIA_FREGMENT, this.dashName, fregmentId);
        }
    }

}
