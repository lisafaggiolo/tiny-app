const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
let crypto = require("crypto");
let cookie = require('cookie-parser');
const { response } = require('express');


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookie());


/**** TEMP DATABASE ****/
let urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userObj = {
  
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

/**** SHORT RANDOM STRING MAKER ****/
function generateRandomString(num) {
  let newShortId = crypto.randomBytes(num).toString('hex');
  return newShortId;
}

function createUser(userObj, email ,password) {
  const newUserId = generateRandomString(2)// const randomId = Math.round(Math.random() * 1000)
  userObj[newUserId] = {
    id : newUserId,
    email,
    password
  }
}


/**** LINK TO PAGE FOR A BRAND NEW URL ****/
app.get("/urls/new", (req, res) => {
  
  let templateVars = {
    email: getUserInfoByValue(userObj, req.cookies['user_id']).email

  };
  res.render("urls_new", templateVars);
})


app.get('/', (req, res) => {
  
  res.send('Hello!');
});


/**** ADDING A NEW URL****/ 

app.post("/urls/:id", (req, res) => {
  
  const shortURL = req.params.id;
  const longURL = req.body.longURL; 

  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});



app.get('/urls', (req, res) => {
  //console.log(req.cookies)
  let templateVars = { 
    email: getUserInfoByValue(userObj, req.cookies['user_id']).email,
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
  
});


app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  let shortURL = generateRandomString(3);
  urlDatabase[shortURL] = req.body.longURL;
  //console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});



/****:shortURL SPECIFICS ****/

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    email: getUserInfoByValue(userObj, req.cookies['user_id']).email,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params[shortURL]];
  res.redirect(`http//${longURL}`);
});



/**** USER MODIFYING URLS FROM MAIN PAGE ****/

app.post("/urls/:shortURL/delete", (req, res) => {

  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});


app.post("/urls/:shortURL/submit", (req, res) => {
  
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect(`/urls`);
});




/****USER LOGIN/OUT ****/


app.post("/login/button", (req, res) =>{

  res.redirect('/login');
});

app.get("/login", (req, res) => {
  
  let templateVars = { 
    email: getUserInfoByValue(userObj, req.cookies['user_id']).email,
    urls: urlDatabase 
  };
  res.render('user_login', templateVars);
});


app.post('/login', (req, res) =>{

  const { email, password } = req.body;

  if (email === '' || password === ''){
    //would end up sending them back to the registration form with a OUPS!
    res.status(400).send('Oops! Please go back and fill out the forms properly!')
  
  }  else if (email !== getUserInfoByValue(userObj, email).email) {
    res.status(403).send('Oops wrong email! Please go back and try again!')
    

  } else if (password !== getUserInfoByValue(userObj, email).password) {
    res.status(403).send('Oops wrong password! Please go back and try again!')
    
  } else if (email === getUserInfoByValue(userObj, email).email && password === getUserInfoByValue(userObj, email).password) {
    
  const user_id = getUserInfoByValue(userObj, email).id; 

  res.cookie('user_id', userObj[user_id].email);
  res.redirect("/urls");
  }
});



app.post('/logout', (req,res) => {

  res.clearCookie('user_id');
  res.redirect('/urls');
})

/**** USER REGISTRATION ****/

app.get("/register", (req, res) => {
  
  // let templateVars = { 
  //   email: getUserInfoByValue(userObj, req.cookies['user_id']).email,
  //   urls: urlDatabase 
  // };
  res.render('user_registration');
});


/**** AWESOME HELPER FUNCTION ****/

const getUserInfoByValue = (userObj, value) => {
  
  for (let user in userObj){
    
    if (userObj[user].email === value){
    
      return userObj[user]; 
   
    } else if (userObj[user].id === value) {
    
      return (userObj[user]);
  }
  }
  return false;
}


app.post("/register", ( req, res) => {

  const { email, password } = req.body;

  if (email === '' || password === ''){
    //would end up sending them back to the registration form with a OUPS!
    res.status(400).send('Please fill out the forms properly!')
  
  } else if (email === getUserInfoByValue(userObj, email).email) {
    
    res.status(400).send('Oops! We already have this email in our data bank.')

  } else {
     
    createUser(userObj, email, password);

    const user_id = getUserInfoByValue(userObj, email).id; 

    res.cookie('user_id', userObj[user_id].email);
    res.redirect("/urls")
  }

});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}`);
});