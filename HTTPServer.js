const express = require('express');
const session = require('express-session');
const http = require('http');
const app = express();
const fs = require('fs');

const port = 2137

var responseInvterval;

const { EasyDiscord, DiscordBot } = require ('./discordtoolkit/index.js');
const discord = new EasyDiscord({
    id: '802531955681001492',
    secret: GetConfigSecret()
  }, 'https://mbd.jcx.pl:2137/auth');
const botConfig = {
    token: GetConfigToken(),
    guild: '797316268998787072',
    role: '802531099909029928'
}

const bot = new DiscordBot();
bot.start(botConfig.token);

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
    GetFile('AuthRedirect.html', res, 'text/html');
});

app.get('/discord', (req, res) => {
    req.session.dauth = true;
    discord.request(req, res);
});

app.get('/auth', async function (req, res) {
    if (req.session.dauth) {
        req.session.dresult = await discord.response(req);
        res.redirect("/prices");
    } else res.redirect("/");
});

app.get('/prices', async (req, res) =>
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

app.get('/background.jpg', (req, res) =>
{
    GetFile('background.jpg', res, '');
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

function GetConfigSecret()
{
    return fs.readFileSync(__dirname + '/secret.config', 'utf-8');
}

function GetConfigToken()
{
    return fs.readFileSync(__dirname + '/token.config', 'utf-8');
}

function ServerRequest(req, res)
{
    var body = "";
    req.on("data", function (chunk) {
        body += chunk;
    });

    req.on("end", function(){
        const item = body;

        const itemJson = fs.readFileSync(__dirname + '/items/' + item + '.item')
        res.writeHead(200);
        res.end(itemJson);
    });             
}