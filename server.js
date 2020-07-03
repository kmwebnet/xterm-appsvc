// expressフレームワーク
var express = require('express');
var app = express();

var https = require('https');
var fs = require('fs');

const options = {
    key:    fs.readFileSync( '/usr/src/app/certs/server.key' ),
    cert:   fs.readFileSync( '/usr/src/app/certs/server.chain' ),
    ca:     [fs.readFileSync( '/usr/src/app/certs/signer-ca.crt' ), fs.readFileSync( '/usr/src/app/certs/root-ca.crt' )],
    requestCert: true
};

var httpsserver = https.createServer( options, app );

const expressWs = require('express-ws')(app, httpsserver);


// WEB画面設定
app.get('/serial', (req, res) => res.sendFile('index.html'));

app.ws('/ws/pub1', function(ws, req) {
    ws.on('message', function(pmsg) {

        // 全接続クライアントに送信
        var sWss = expressWs.getWss('/ws/test1');
        sWss.clients.forEach(function(client) {
            if (client !== ws) client.send(pmsg);
        });
        });
});

app.ws('/ws/res1', function(ws, req) {
});


// express-ws ウェブソケット処理
app.ws('/ws/test1', function(ws, req) {
    ws.on('message', function(msg) {

    // 全接続クライアントに送信
    var rWss = expressWs.getWss('/ws/res1');
    rWss.clients.forEach(function(client) {
        if (client !== ws) client.send(msg);
    });
    });
});


// イベント待機
httpsserver.listen(3000, () => console.log('Listening on port 3000'));