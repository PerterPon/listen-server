
/*
 * config.ts
 * Author: perterpon<perterpon@gmail.com>
 * Create: Sun Jul 07 2019 00:06:40 GMT+0800 (CST)
 */

import * as path from 'path';
import * as oss from 'ali-oss';
import * as fs from 'fs';
import { safeLoad } from 'js-yaml';
import * as _ from 'lodash';

export interface TListenConfig {
    mpds: {[name: string]: string};
    oss: oss.Options;
    ossPrefix: string;
    wsPort: number;
    salt: string;
}

let config: TListenConfig;

export function getEtcFolderPath(): string {
    const etcPath: string = path.join(__dirname, '../../etc');
    return etcPath;
}

export async function init(env?: string): Promise<TListenConfig> {
    const etcPath: string = getEtcFolderPath();
    const defaultFilePath: string = path.join(etcPath, '/default.yaml');
    const defaultFileContent: string = fs.readFileSync(defaultFilePath, 'utf-8');
    const defaultConfig: TListenConfig = safeLoad(defaultFileContent);

    let listenConfig: TListenConfig = {} as any;
    if (true === _.isString(env)) {
        const envFilePath: string = path.join(etcPath, `/${env}.yaml`);
        const envFileContent: string = fs.readFileSync(envFilePath, 'utf-8');
        const envConfig: TListenConfig = safeLoad(envFileContent);
        listenConfig = _.merge(defaultConfig, envConfig);
    } else {
        listenConfig = defaultConfig;
    }

    config = listenConfig;

    return listenConfig;
}

export function getConfig(): TListenConfig {
    return config;
}

