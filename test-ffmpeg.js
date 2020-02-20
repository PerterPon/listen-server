

const ffmpeg = require('fluent-ffmpeg');

const path = require('path');
const bbcmp4 = path.join(__dirname, './bbc.mp4');
const bbcmp3 = path.join(__dirname, './bbc.mp3');

ffmpeg(bbcmp4).output(bbcmp3).run();

