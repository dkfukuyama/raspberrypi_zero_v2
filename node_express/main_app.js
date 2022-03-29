﻿const express = require("express");
const app = express();
const path = require('path');
const gtts = require('./google_home')
const favicon = require('express-favicon');
const vars = require('./variables');
const exec = require('child_process').exec;
const bodyParser = require('body-parser');
const { google } = require("@google-cloud/text-to-speech/build/protos/protos");

const ghome = require('./gHomeCnt');
const ut = require('./utils');


app.use(favicon(path.join(__dirname, '/views/ico/favicon.png')));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

// テンプレートエンジンの指定
app.set("view engine", "ejs");


const speaker_name = '2Fリビング';
let volumeLevel = 30;

page_path_set_index_ejs = [
    {
        path: '/',
        title: 'こんにちは、ぐーぐるさんだよ',
        level: 0
    },
    {
        path: '/speak',
        title: 'しゃべらせたいとき',
        view_page: './speak.ejs',
        level: 0,
        postfunc: async (req, res)=>{
            return gtts.speechOnGoogleHome(
                speaker_name, 
                {
                    text: req.body.text,
                    reverse_play: req.body.reverse_play,
                    pitch : req.body.pitch,
                    speakingRate: req.body.speed,
                    volume: req.body.volume,
                    voiceTypeId : req.body.voice_type
                }
            );
        },
        specialParams:{
            voiceTypes : require('./google_tts').voiceType,
        },
    },
    {
        path: '/music',
        title: 'おんがくをかける',
        view_page: './music.ejs',
        level: 0
    },
    {
        path: '',
        title: 'クイズゲーム',
        view_page: './quiz.ejs',
        level: 0
    },
    {
        path: '/quiz/play',
        title: 'あそぶ',
        title2: 'クイズゲームであそぶ',
        view_page: './quiz.ejs',
        level: 1
    },
    {
        path: '/quiz/make',
        title: 'つくる',
        title2: 'クイズゲームをつくる',
        view_page: './quiz.ejs',
        level: 1
    },
    {
        path: '/config',
        title: 'かんり、せってい',
        view_page: './config.ejs',
        level: 0
    },
    {
        path: '/command',
        title: '',
        hidden: true,
        postfunc: async (req, res)=>{
            if(req.body.mode)
            {
                console.log('COMMAND MODE');
                console.log(req.body.mode);
                switch(req.body.mode){
                case 'cal_today' :
                    return gtts.speechOnGoogleHomeCal(speaker_name, {});
                case 'clean_wav':
                    return new Promise((resolve, _) => resolve(require('./clean').clean_wav(100)));
                case 'system_command' :
                    console.log(`${req.body.command}`);
                    return new Promise((resolve, reject)=>{
                        exec(req.body.command, (err, stdout, stderr) => {
                            if (err) {
                                reject(err);
                            }else{
                                console.log(`stdout: ${stdout}`)
                                resolve(stdout);
                            }
                        });
                    });
                default:
                    return new Promise((resolve, _)=>resolve());
                }
            }
        }
    }
]

page_path_set_index_ejs.forEach(p =>{

    if(p.postfunc){
        app.post(p.path, async function(req, res, next) {
            console.log('postfunc');
            console.log(req.body);

            let er_occurred = false;
            pfunc_results = await p.postfunc(req, res).catch(er=>{
                er_occurred = true;
                return JSON.stringify(er);
            });
            console.log(pfunc_results);
            if (req.body.short_return) {
                res.type(req.body.return_header);
                res.send(pfunc_results);
                res.end();
            }else{
                next();
            }
        });
    }
    app.all(p.path, function (req, res) {
        try{
            let data = {
                page: p,
                items: null
            };
            // レンダリングを行う
            res.render("./index.ejs", {data: data, prevPostData: req.body, pages: page_path_set_index_ejs});

        }catch(er){
            console.log('CATCH ERROR');

            let data = {
                title: p.title,
                view_page : p.view_page,
                errors: er
            };

            res.render("./ER/error.ejs", data);
        }
    });
});

app.all("*.css", function (req, res) {
    const p = { root: path.join(__dirname, "views")};
    res.sendFile(req.path, p, (err)=>{
        if(err){
            next(err);
        }
    });
});

app.get("*.wav", function (req, res, next){
    const p = path.join(vars.globalVars().saveDir0, req.path);
    res.sendFile(p, (err)=>{
        if(err){
            next(err);
        }
    });
});

app.use(function(req, res, next){
    console.log(`404 NOT FOUND ERROR : ${req.path}`);
    res.status(404);
    res.render("./ER/404.ejs", {path: req.path, pages: page_path_set_index_ejs });
});

app.use((err, req, res, next) => {
    res.status(err.status);
    res.render("./ER/500.ejs", {path: req.path, pages: page_path_set_index_ejs });
})

let httpServerPort = vars.globalVars().serverPort;
async function main() {

    let localtime = new Date(Date.now());
    let localdate0 = new Date(localtime.getFullYear(), localtime.getMonth(), localtime.getDate());
    let localdate1 = new Date(localtime.getFullYear(), localtime.getMonth(), localtime.getDate()+1);

    console.log(await gtts.getCalJson(
        localdate0.toLocaleDateString().substring(0,10).split("/").join("-"), 
        localdate1.toLocaleDateString().substring(0,10).split("/").join("-")
    ));
    return;

    app.listen(httpServerPort, () => console.log(`http server port No. ${app.settings.port}`));
    ghome.startSeekGoogleLoop();
    for (let i = 0; ; i++) {
        console.log(ghome.getGoogleHomeAddresses());
        /*
        await ghome.getVolume(speaker_name)
            .then(async v => {
                console.log(v);
                ghome.play(speaker_name);
                await ut.delay_ms(10000);
            })
            .catch(err => console.debug(err));
        */

        await ut.delay_ms(1000);
    }
}

main();
