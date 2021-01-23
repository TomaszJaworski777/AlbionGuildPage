const priceChecker = require('./PriceHTTPReciver');
const express = require('express');
const session = require('express-session');
const http = require('http');
const app = express();
const fs = require('fs');

const port = 2137

var responseInvterval;

const server = http.createServer(app);
server.listen(port, '127.0.0.1');
console.log('Listening on port ' + port + '...');

app.get('/', (req, res) =>
{
    GetFile('index.html', res, 'text/html');
})

app.get('/index.html', (req, res) =>
{
    GetFile('index.html', res, 'text/html');
})

app.get('/styles.css', (req, res) =>
{
    GetFile('styles.css', res, 'text/css');
})

app.get('/Client.js', (req, res) =>
{
    GetFile('Client.js', res, '');
})

app.post('/price', (req, res) =>
{
    ServerRequest(req, res);
})

function GetFile(file, res, fileType)
{
    fs.readFile(__dirname + '/' + file, (error,data) =>
    {
        ProcessFileData(res, error, data, fileType);
    });
}

function ProcessFileData(res, error, data, fileType)
{
    if (error) 
    {
        PrintError(res);
        return;
    }

    PrintSite(data, res, fileType);
}

function PrintError(res)
{
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end();
}

function PrintSite(data, res, fileType)
{
    res.writeHead(200, { 'Content-Type': fileType });
    res.end(data);
}

function ServerRequest(req, res)
{
    var body = "";
    req.on("data", function (chunk) {
        body += chunk;
    });

    req.on("end", function(){
        priceChecker.clear();
        var splitted = SplitBody(body);
        priceChecker.getPrice(splitted[0], splitted[1], splitted[2]);
        responseInvterval = setInterval(function() { EndPriceRecive(res); }, 250);
    });             
}

function SplitBody(body)
{
    var splitted = ['', '', ''];
    var index = 0;

    for(var i = 0; i < body.length; i++)
    {
        if(body[i] === ',')
        {
            index++
            continue;
        }
        
        splitted[index] += body[i];
    }

    return splitted;
}

function EndPriceRecive(res)
{
    if(priceChecker.getPriceList().length > 0)
    {
        var priceList = priceChecker.getPriceList();
        var string = JSON.stringify(priceList[0]);
        res.writeHead(200);
        res.end(String(string));
        clearInterval(responseInvterval);
    }   
}