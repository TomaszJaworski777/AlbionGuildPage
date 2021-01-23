/*
This file is NOT licensed under GNU AGPL v3 license!

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>
*/
const express = require('express');
const session = require('express-session');
const { EasyDiscord, DiscordBot } = require ('./discordtoolkit/index.js');
const app = express();

const discord = new EasyDiscord({
  id: '',
  secret: ''
}, 'http://localhost:3000/callback'); //see line 61
const bot = new DiscordBot();
const botConfig = {
  token: '',
  guild: '', //id
  role: '' //id
}

app.use(session({
  secret: 'no',
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  req.session.dauth = false;
  res.end(`Hi!`);
});

app.get('/discord', (req, res) => {
  req.session.dauth = true;
  discord.request(req, res);
});

app.get('/callback', async function (req, res) {
  if (req.session.dauth) {
    req.session.dresult = await discord.response(req);
    res.redirect("/data");
  } else res.redirect("/");
});

app.get('/data', async (req, res) => {
  if (req.session.dauth) {
    const result = req.session.dresult;
    if (!result.result) res.redirect('/error');
    else {
      const isAuth = await bot.hasUserRole(botConfig.guild, result.object.id, botConfig.role);
      var response;
      if (isAuth) response = "Hi, my VIP";
      else response = "Nope. Don't try";
      res.end(response);
    }
  } else res.redirect("/");
});

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

bot.start(botConfig.token)
  .then(() => app.listen(3000, () => console.log('Server ready')));
