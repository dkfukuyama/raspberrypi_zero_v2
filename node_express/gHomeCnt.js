const ut = require('./utils');
const bonjour = require('bonjour')();
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;

let gHomeAddresses = [];
let gHomeSeekFlag_timeout = null;
let secondsCount = 0;

function getGoogleHomeAddresses() {
    return gHomeAddresses;
}

function getGHAddrFromName(friendlyname) {
    let returnval = [];
    gHomeAddresses.forEach((a) => {
        if (a.friendlyName == friendlyname) {
            returnval.push(a.address);
        }
    });
    return returnval;
}

function startSeekGoogleLoop() {
    stopSeekGoogleLoop();
    gHomeSeekFlag_timeout = setInterval(async () => {
        secondsCount = (secondsCount + 1) % 20;
        if (gHomeAddresses == null || gHomeAddresses.length == 0 || secondsCount % 120 == 0) {
            gHomeAddresses = await seekGoogleHomes(2000);
        }
    }, 5000);
}

function stopSeekGoogleLoop() {
    if (gHomeSeekFlag_timeout) {
        clearInterval(gHomeSeekFlag_timeout);
    }
}

async function seekGoogleHomes(timeout_ms) {
    let browser = bonjour.find({ type: 'googlecast' });
    await ut.delay_ms(timeout_ms);
    let return_val = [];
    browser.services.forEach(s => {
        return_val.push(
            { address: s.addresses[0], friendlyName: s.txt.fn }
        );
    });
    return return_val;
}

function play(gHomeName, playUrl, playVolume) {
    return new Promise((resolve, reject) => {
        let adrs = getGHAddrFromName(gHomeName);
        if (adrs.length == 0) {
            reject(`the address corresponds to "${gHomeName}" is NOT FOUND!!`);
            return;
        }
        const client = new Client();

        client.connect({ host: adrs[0] }, function () {
            console.log('connected, launching app ...');

            client.launch(DefaultMediaReceiver, function (err, player) {
                var media = {

                    // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                    contentId: 'http://192.168.1.17:8091/g_dlfile/2022-03-26_23-28-13_135.wav',
                    contentType: 'audio/wav',
                    //contentType: 'video/mp4',
                    streamType: 'BUFFERED', // or LIVE

                    // Title and cover displayed while buffering
                    metadata: {
                        type: 0,
                        metadataType: 0,
                        title: "Big Buck Bunny",
                    }
                };

                player.on('status', function (status) {
                    console.log('status broadcast playerState=%s', status.playerState);
                });

                console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

                player.load(media, { autoplay: true }, function (err, status) {
                    console.log('media loaded playerState=%s', status.playerState);

                    /*
                    // Seek to 2 minutes after 15 seconds playing.
                    setTimeout(function () {
                        player.seek(2 * 60, function (err, status) {
                            //
                        });
                    }, 15000);
                    */
                });

            });

        });

        client.on('error', function (err) {
            console.log('Error: %s', err.message);
            client.close();
        });
    });
}

async function playAsync(gHomeName, playUrl) {

}

function pushPlayList(gHomeName, playUrl) {

}

function clearPlayList(gHomeName) {

}

function interruptPlay(gHomeName, playUrl) {

}

function interruptAndResumePlay(gHomeName, playUrl) {

}

function getVolume(gHomeName) {
    return new Promise((resolve, reject) => {
        let adrs = getGHAddrFromName(gHomeName);
        if (adrs.length == 0) {
            reject(`the address corresponds to "${gHomeName}" is NOT FOUND!!`);
            return;
        }
        const client = new Client();
        client.connect({ host: adrs[0] }, function () {
            client.getVolume(function (err, vol) {
                if (err) {
                    client.close();
                    reject(err) // handle error
                }
                client.close();
                resolve(vol) // {"controlType":"attenuation","level":0.7999999523162842,"muted":false,"stepInterval":0.05000000074505806}
            });
        });
        client.on('error', function (err) {
            client.close();
            reject(`Error: ${err.message}`);
        });
    });
}



function play_test(host) {
    const client = new Client();

    client.connect({ host: host }, function () {
        console.log('connected, launching app ...');

        client.launch(DefaultMediaReceiver, function (err, player) {
            var media = {

                // Here you can plug an URL to any mp4, webm, mp3 or jpg file with the proper contentType.
                contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
                //contentType: 'audio/mp3',
                contentType: 'video/mp4',
                streamType: 'BUFFERED', // or LIVE

                // Title and cover displayed while buffering
                metadata: {
                    type: 0,
                    metadataType: 0,
                    title: "Big Buck Bunny",
                    images: [
                        { url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg' }
                    ]
                }
            };

            player.on('status', function (status) {
                console.log('status broadcast playerState=%s', status.playerState);
            });

            console.log('app "%s" launched, loading media %s ...', player.session.displayName, media.contentId);

            player.load(media, { autoplay: true }, function (err, status) {
                console.log('media loaded playerState=%s', status.playerState);

                /*
                // Seek to 2 minutes after 15 seconds playing.
                setTimeout(function () {
                    player.seek(2 * 60, function (err, status) {
                        //
                    });
                }, 15000);
                */
            });

        });

    });

    client.on('error', function (err) {
        console.log('Error: %s', err.message);
        client.close();
    });

}

exports.getGoogleHomeAddresses = getGoogleHomeAddresses;
exports.startSeekGoogleLoop = startSeekGoogleLoop;
exports.stopSeekGoogleLoop = stopSeekGoogleLoop;
exports.getGHAddrFromName = getGHAddrFromName;

exports.play = play;
exports.getVolume = getVolume;
