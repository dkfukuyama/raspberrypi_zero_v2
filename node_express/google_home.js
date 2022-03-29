const path = require('path');
const vars = require('./variables');
const gtts = require('./google_tts')
const gHome = require('./gHomeCnt');
const request = require('request');


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

            await gtts.getTtsAudioData(params).catch((err)=>reject(err));
            const fpath = vars.globalVars().httpDir + "/" + path_togo;

            await gHome.play(fname, fpath, params).then(()=>resolve()).catch((err)=>reject(err));
        }catch(err){
            reject(err);
        }
    });
}

async function getCalJson(sdate, edate){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>reject('Get Cal Timeout'), 30000);

        var options = {
            url: vars.globalVars().g_calenderSummaryUrl,
            method: 'POST',
            json: true,
            followAllRedirects: true,
            form: {
                startDate:sdate,
                endDate:edate,
            }
        };
        try{
            request(options, function (error, response, body) {
                if(error){
                    reject(error);
                }else{
                    resolve(body);
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

exports.getCalJson = getCalJson;
exports.speechOnGoogleHome = speechOnGoogleHome;
exports.speechOnGoogleHomeCal = speechOnGoogleHomeCal;
