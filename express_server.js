const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
let crypto = require("crypto");


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let newShortId = crypto.randomBytes(3).toString('hex');
  return newShortId;
}




// url to a page meant to add new urls to our urls page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})


app.get('/', (req, res) => {
  res.send('Hello!');
});

// :shortURL SPECIFICS

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params[shortURL]];
  res.redirect(`http//${longURL}`);
});

/********************************************* */

app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/submit", (req, res) => {

  console.log(`submit : ${req.params.shortURL}`);
  console.log(`long parans ${req.body.longURL}`);
  urlDatabase[req.params.shortURL] = req.body.longURL
  console.log(urlDatabase);
  res.redirect(`/urls`);
});



app.post("/urls/:id", (req, res) => {

  console.log(req.body)
  console.log(req.params)
  const shortURL = req.params.id;
  const longURL = req.body.longURL; 

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

/*
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

*/






app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}`);
});