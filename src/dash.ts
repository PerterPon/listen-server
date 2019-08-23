
/*
 * dash.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sat Jul 06 2019 21:42:16 GMT+0800 (CST)
 */

import * as Events from 'events';
import { NodeDashClient, TFirstFregment } from 'node-dash-client';
import * as fs from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import * as request from 'request-promise';
import * as crypto from 'crypto';

import { radioData, radioFirstFregment, TRadioDataItem, TListenFirstFregment } from 'src/data';
import * as config from 'src/config';
import * as oss from 'src/oss';
import { sleep } from 'src/util';

import { EEvent } from 'src/enum';

const MAX_CACHE_NUM = 10;

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

        radioFirstFregment.set(this.dashName, firstFregment);

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
        while (true) {
            const mediaData: {fregmengId: number, data: Buffer} = await this.dash.getMediaFregment();
            this.onMediaData(mediaData.fregmengId, mediaData.data);
        }
    }

    private async onMediaData(fregmengId: number, data: Buffer): Promise<void> {
        const configInfo: config.TListenConfig = config.getConfig();
        const md5 = crypto.createHash('md5');
        const cryptedFregmentId: string = md5.update(`${configInfo.salt}_${fregmengId}`).digest('hex');
        const fileName: string = `${configInfo.ossPrefix}/${this.dashName}/${cryptedFregmentId}.mp3`;

        const mp3Data: Buffer = await this.encode(`${this.dashName}_${cryptedFregmentId}`, data);

        await oss.putFile(fileName, mp3Data);
    }

    private async encode(name: string, data: Buffer): Promise<Buffer> {
        const configInfo: config.TListenConfig = config.getConfig();
        const { shmPath } = configInfo;
        const inputFileName: string = path.join(shmPath, name);
        const outputFileName: string = path.join(shmPath, `${name}.mp3`);
        this.write2SHM(inputFileName, data);
        await this.doEncode(inputFileName, outputFileName);
        const mp3Data: Buffer = fs.readFileSync(outputFileName);

        fs.unlinkSync(inputFileName);
        fs.unlinkSync(outputFileName);

        return mp3Data;
    }

    private doEncode(inputFile: string, outputFile: string): Promise<void> {
        return new Promise((resolve) => {
            ffmpeg()
            .input(inputFile)
            .output(outputFile)
            .on('end', resolve)
            .run();
        });
    }

    private write2SHM(fileName: string, data: Buffer): void {
        const firstFregment: TFirstFregment = radioFirstFregment.get(this.dashName);
        const bufferFile: Buffer = Buffer.concat([firstFregment.data, data]);
        fs.writeFileSync(fileName, bufferFile);
    }

    private async triggerCDN(fileNamePath: string): Promise<void> {
        const configInfo: config.TListenConfig = config.getConfig();
        const cdnUrl: string = `${configInfo.cdnDomain}/${fileNamePath}`;
        try {
            await request(cdnUrl);
        } catch (e) {
            
        }
    }

}
