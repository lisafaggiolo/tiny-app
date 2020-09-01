const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortUrl', (req, res) => {
  let templateVars = { shortURL: req.params.shortUrl, longURL: urlDatabase[req.params.shortUrl] };
  //console.log(/urls/:shortUrl route);
  console.log(urlDatabase)
  console.log(templateVars)
  res.render('urls_show', templateVars);
});

/*app.get('/urls/:b2xVn2', (req, res) => {
  let templateVars = { shortURL: req.params['b2xVn2'], longURL: 'http://www.lighthouselabs.ca' };
  res.render('urls_show', templateVars);
});*/

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`)
});

app.listen(PORT, () => {
  
  console.log(`Example app listening on port ${PORT}`);
});