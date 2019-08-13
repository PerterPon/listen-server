
/*
 * util.ts
 * Author: 王 羽涵<perterpon.wang@bytedance.com>
 * Create: Tue Aug 13 2019 16:41:00 GMT+0800 (中国标准时间)
 */

export async function sleep(time: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    });
}