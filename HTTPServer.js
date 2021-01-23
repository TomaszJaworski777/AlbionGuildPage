const priceChecker = require('./PriceHTTPReciver');
const express = require('express');
const session = require('express-session');
const { EasyDiscord, DiscordBot } = require ('./discordtoolkit/index.js');
const http = require('http');
const app = express();
const fs = require('fs');

const port = 2137

const discord = new EasyDiscord({
    id: '802531955681001492',
    secret: 'XR_S19EqUQsoyyo1MTdqqIiponcbROk4'
  }, 'https://mbd.jcx.pl:2137/auth');
  const bot = new DiscordBot();
  const botConfig = {
    token: 'ODAyNTMxOTU1NjgxMDAxNDky.YAwmIA.0xNqEjJ_xn5JZdQXbWGsyf3aCJo',
    guild: '797316268998787072',
    role: '802531099909029928'
  }

var responseInvterval;

const server = http.createServer(app);
server.listen(port, '127.0.0.1');
console.log('Listening on port ' + port + '...');

app.use(session(
{
    secret: 'no',
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
    req.session.dauth = false;
    res.end(`Discord auth loading!!`);
});

app.get('/discord', (req, res) => {
    req.session.dauth = true;
    discord.request(req, res);
});

app.get('/auth', async function (req, res) {
    if (req.session.dauth) {
        req.session.dresult = await discord.response(req);
        res.redirect("/page");
    } else res.redirect("/");
});

app.get('/page', async (req, res) =>
{
    if (req.session.dauth) {
        const result = req.session.dresult;
        if (!result.result) res.redirect('/error');
        else {
            const isAuth = await bot.hasUserRole(botConfig.guild, result.object.id, botConfig.role);
            if (isAuth) response = GetFile('index.html', res, 'text/html');
            else res.end('Fuck off!');
        }
    } 
    else res.redirect("/");
})

app.get('/error', (req, res) => {
    if (req.session.dauth) {
        const result = req.session.dresult;
        var response;
        if (result.cancel_by_user) response = "Cancel by user (pog)"
        else if (result.invalid_state) response = "CSRF";
        else if (result.no_code) response = "Invalid request";
        else if (result.auth) response = `AUTH: ${result.object}`;
        else response = `Internal: ${result.object}`;
        res.end(response);
    } else res.redirect("/");
  });

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