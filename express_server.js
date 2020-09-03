const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
let crypto = require("crypto");
let cookie = require('cookie-parser')


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookie());

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
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
})


app.get('/', (req, res) => {
  res.send('Hello!');
});

// :shortURL SPECIFICS

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    username: req.cookies["username"], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params[shortURL]];
  res.redirect(`http//${longURL}`);
});

/***************  ******************* */

app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/submit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  
  /*** temp testing ***/
  //console.log(`submit : ${req.params.shortURL}`);
  //console.log(`long parans ${req.body.longURL}`);
  //console.log(urlDatabase);
  res.redirect(`/urls`);
});

/****USERNAME****/
// const createUser = (userObj, nicename, fullName, password) => {
//   // const randomId = Math.round(Math.random() * 1000)
//   userObj[nicename] = {
//     nicename,
//     fullName,
//     password
//   }
// }

// app.get("/login", (req, res) =>{
//   let templateVars = {
//     username: req.cookie['username']
//     // ... any other vars
//   };
//   console.log(templateVars)
//   res.redirect('urls_index', templateVars);
// });



app.post("/login", (req, res) =>{
  
  const nicename = req.body.username;
  res.cookie('username', nicename);
  res.redirect('/urls');
});


app.post('/logout', (req,res) => {
  //let nicename = req.body;
  console.log('req.body.username:',req.body);
  res.clearCookie('username')
  console.log("cookie:",cookie);
  //console.log(templateVars);
  //req.session = null;
  //res.cookie(nicename, null);
  res.redirect('/urls');
})

app.post("/urls/:id", (req, res) => {

  //console.log(req.body)
  //console.log(req.params)
  const shortURL = req.params.id;
  const longURL = req.body.longURL; 

  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  

  console.log(req.cookies)
  let templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
  
});

//generates a random string 

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