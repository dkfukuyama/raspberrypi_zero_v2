pushd $PSScriptroot;
robocopy .\ \\pizero01.local\raspberry_pi\home\pi\rirema_server /XD node_modules /XF pm2start.json *.sqlite *.ps1 /XO /S /W:10 /R:30 /PURGE;
popd;
