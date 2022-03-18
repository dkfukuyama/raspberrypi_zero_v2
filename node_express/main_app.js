const express = require("express");
const app = express();
const path = require('path');
const gtts = require('./google_home')
const vars = require('./variables');
const exec = require('child_process').exec;


const speaker_name = 'リビングルーム';

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
                    speakingRate : req.body.speed,
                    volume : req.body.volume ?? 0.4,
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
                    return new Promise(async (resolve, _)=>await resolve(gtts.speechOnGoogleHomeCal(speaker_name, {})));
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
                }
            }
        }
    }
]

const bodyParser = require('body-parser');
const internal = require("stream");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

// テンプレートエンジンの指定
app.set("view engine", "ejs");

page_path_set_index_ejs.forEach(p =>{

    if(p.postfunc){
        app.post(p.path, async function(req, res, next) {
            console.log('postfunc');
            console.log(req.body);

            try{
                pfunc_results = await p.postfunc(req, res);
                console.log(pfunc_results);
                if (req.body.return_type == 'text') {
                    res.type('text/plain');
                    res.send(pfunc_results);
                    res.end();
                }
            } catch(er){
                if (req.body.return_type == 'text') {
                    res.type('text/plain');
                    res.send(JSON.stringify(er));
                    res.end();
                }
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

app.listen(vars.globalVars().serverPort, ()=>console.log(vars.globalVars().serverPort));
