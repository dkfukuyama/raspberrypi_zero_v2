const ut = require('./utils');

async function GetVolumeFromFriendlyNameAsync(fname) {
    return new Promise((resolve, reject) => {
        let sto = setTimeout(() => reject('get vol time out find google home'), 30000);
        const client = new ChromecastAPI();
        client.on('device', async function (device) {
            if (device.friendlyName == fname) {
                clearTimeout(sto);
                for (let i = 0; ; i++) {
                    await GetVolumeFromDeviceAsync(device)
                        .then(v => resolve(v))
                        .catch(err => { if (i > 10) reject(err) });
                }
                await delay_ms(500);
            }
        });
    });
}

async function GetVolumeFromDeviceAsync(device) {
    return new Promise((resolve, reject) => {
        let sto = setTimeout(() => reject(), 20000);
        try {
            device.getVolume((err, volume) => {
                clearTimeout(sto);
                if (err) {
                    reject(err);
                } else {
                    resolve(volume);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

async function SetVolumeAsync(device, vol){
    return new Promise((resolve, reject)=>{
        let sto = setTimeout(() => reject(), 10000);
        try {
            device.setVolume(vol, () => {
                console.log(`SetVol ${vol}`);
                clearTimeout(sto);
                resolve();
            });
        } catch (err) {
            reject(err);
        }
    });
}

const ChromecastAPI = require('chromecast-api');
const path = require('path');

async function playOnGoogleHome(fname, media, params){
    console.log('playOnGoogleHome');
    return new Promise((resolve, reject) =>{
        let sto = setTimeout(()=>reject('time out find google home'), 30000);
        const client = new ChromecastAPI();
        client.on('device', async function (device) {
            console.log(device.friendlyName);
            if(device.friendlyName == fname){
                clearTimeout(sto);
                setTimeout(()=>reject('device play end is not detected time out'), 20000);
                if(params?.volume){
                    await SetVolumeAsync(device, params.volume/100);
                }
                console.log(media);
                device.play(media, function (err) {
                    console.log('PLAY CALLBACK');
                    if (!err) resolve('Play');
                    else reject(err);
                });
            }
        });
    });
}

function getNowDateWithString(){
    let dt = new Date();
    let y = dt.getFullYear();
    let m = ("00" + (dt.getMonth()+1)).slice(-2);
    let d = ("00" + dt.getDate()).slice(-2);
    let h = ("00" + dt.getHours()).slice(-2);
    let min = ("00" + dt.getMinutes()).slice(-2);
    let sec = ("00" + dt.getSeconds()).slice(-2);
    let ms = ("000" + dt.getMilliseconds()).slice(-3);

    let result = `${y}-${m}-${d}_${h}-${min}-${sec}_${ms}`;
    return result;
}


const vars = require('./variables');
const gtts = require('./google_tts')
async function speechOnGoogleHome(fname, params){
    return new Promise(async (resolve, reject)=>{
        try{
            setTimeout(()=>reject('TIMEOUT speechOnGoogleHome'), 120000);
            let path_togo = (params.outFile ?? getNowDateWithString()) + ".wav";
            // 日付時刻から保存パス設定
            params.outfilePath = path.join(vars.globalVars().saveDir, path_togo);
            console.log(params.outfilePath);

            if(params.reverse_play){
                params.text = params.text.split("").reverse().join("");
            }

            await gtts.getTtsMp3(params).catch((err)=>reject(err));
            const fpath = vars.globalVars().httpDir + "/" + path_togo;
            await playOnGoogleHome(fname, fpath, params).catch((err)=>reject(err));
            resolve();
        }catch(err){
            reject(err);
        }
    });
}

var request = require('request');
async function getCalJson(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>reject('Get Cal Timeout'), 30000);
        var data = [];

        var options = {
            url: vars.globalVars().g_calenderSummaryUrl,
            method: 'GET'
        };
        try{
            request(options, function (error, response, body) {
                if(error){
                    reject(error);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        }catch(er){
            reject(er);
        }
    });
}

async function speechOnGoogleHomeCal(fname, params){
    let stay_loop = true;

    return new Promise(async (resolve, reject)=>{
        for(let i=0; stay_loop && i<10; i++){
            stay_loop = false;
            await getCalJson().then(async (g)=>
            {
                console.log(g);
                params = g;
                params.volume = 80;
                params.voiceTypeId = Math.floor(Math.random() * 4);
                params.pitch = Math.random() * 10 - 5;
                
                return speechOnGoogleHome(fname, params);
            }).catch(er=>{
                console.log(er);
                stay_loop = true;
            });
        }
        reject();
    });
}

exports.GetVolumeFromFriendlyNameAsync = GetVolumeFromFriendlyNameAsync;
exports.speechOnGoogleHome = speechOnGoogleHome;
exports.speechOnGoogleHomeCal = speechOnGoogleHomeCal;
