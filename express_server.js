const express    = require('express');
const app        = express();
const PORT       = 8080;
const bodyParser = require("body-parser");
//let cookie       = require('cookie-parser');
const bcrypt     = require('bcrypt');
const salt       = bcrypt.genSaltSync(10);
const cookieSession = require('cookie-session');

const { urlsBelongsToUser,
        getUserInfoByValue, 
        generateRandomString
      }          = require('./helpers')

app.use(cookieSession({

  name: 'session',
  keys: ['key1', 'key2']
}))

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookie());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

function createUser(userObj, email ,password) {
  const newUserId = generateRandomString(2)// const randomId = Math.round(Math.random() * 1000)
  
  userObj[newUserId] = {
    id : newUserId,
    email,
    password
  }

}


/**** TEMP DATABASES ****/

let urlDatabase = {

  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": {longURL: "http://www.google.com",        userID: "user2RandomID"},
  "9sm5x2": {longURL: "http://www.google.com",        userID: "userRandomID"},
};

const userObj = {
  
  "userRandomID": {
    id      : "userRandomID", 
    email   : "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id      : "user2RandomID", 
    email   : "user2@example.com", 
    password: "dishwasher-funk"
  }
};


/**** LINK TO PAGE FOR A BRAND NEW URL ****/
app.get("/urls/new", (req, res) => {
  
  const user = getUserInfoByValue(userObj, req.session.user_id);
  
  let templateVars = {
    email   : user.email,
    password: user.password,
    user    : user
  };
   
  if (user.email === undefined) {
    
    return res.redirect('/urls');
  } else {

    return res.render("urls_new", templateVars);
  }

  
})


app.get('/', (req, res) => {
  
  res.redirect('/urls');
});


/**** ADDING A NEW URL****/ 

app.get("/urls/:id", (req, res) => {

  const shortURL     = req.params.id;
  const user         = getUserInfoByValue(userObj, req.session['user_id']);
  const allowedOrNot = urlDatabase[shortURL].userID === user.id;


  let templateVars = {
    email   : user.email,
    shortURL: shortURL,
    longURL : urlDatabase[shortURL].longURL,
    user    : user
  };


  // if the user isnt connected, send him back to login page
  if (user.email === undefined) {
   
    return res.redirect("/urls");
  }else if (!urlDatabase[shortURL].userID){
  
    return res.render('urls_show', templateVars);
  } else if (!allowedOrNot){ 
    
    return res.redirect("/urls");
  } else {
    
    return res.render("urls_show", templateVars);
  }

});



app.post("/urls/:id", (req, res) => {

  const user     = getUserInfoByValue(userObj, req.session['user_id']);
  const shortURL = req.params.id;
  const longURL  = req.body.longURL; 

  urlDatabase[shortURL] = { longURL: longURL, userID: user.id };
  
  return res.redirect('/urls');
});



app.get('/u/:id', (req, res) => {
  
  return res.redirect(urlDatabase[req.params.id].longURL);
});



/**** /URLS SPECIFIC ****/

//renders the urls_index page (under certain conditions)
app.get('/urls', (req, res) => {

  const user    = getUserInfoByValue(userObj, req.session.user_id);
  const urls    = urlDatabase;
  const userURL = {};

  let templateVars = { 
    email:    user.email,
    id:       user.id,
    password: user.password,
    urls:     userURL,
    user:     user 
  };
  

  //conditional sending the user to an appropriate version of the index page if they are not associated 
  //with an account or not logged in. 
  if (!user) {
    
    return res.render('urls_index', templateVars);

    //will loop through the url database and only show the ones belonging to the logged in user
  } else {
    //console.log("line 182 if user => ", user);
    for (let shortURL in urls) {
    
      if (urlsBelongsToUser(shortURL, user, urlDatabase)) {
      
        userURL[shortURL] = urls[shortURL];
      }
    }
  }

  return res.render('urls_index', templateVars);
  
});



//responsible for adding newly created or modified urls to the urls_index page
app.post("/urls", (req, res) => {
  //console.log(req.cookie);
  const shortURL = generateRandomString(3);
  const user     = getUserInfoByValue(userObj, req.session.user_id);
  const longURL  = req.body.longURL; 
  
  urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: user.id };

  return res.redirect('/urls');
});



/**** /urls/:shortURL SPECIFICS ****/

app.get('/urls/:shortURL', (req, res) => {

  const user = getUserInfoByValue(userObj, req.session['user_id'])

  let templateVars = {
    email:    user.email,
    shortURL: req.params.shortURL, 
    longURL:  urlDatabase[req.params.shortURL] };
  
  //renders the url modification page along with the necessary information so the page shows 
  //the proper message
  return res.render('urls_show', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params[shortURL]];
  
  return res.redirect(`http//${longURL}`);
});



/**** USER DELETING URLS FROM MAIN PAGE ****/

app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL  = req.params.shortURL;
  const user      = getUserInfoByValue(userObj, req.session.user_id);
  const isAllowed = urlsBelongsToUser(shortURL, user, urlDatabase);
  
  //conditional making sure the users are allowed to delete the urls only if it belongs to them!
  if (!isAllowed) {

    return res.redirect('/urls');
  } else {
    
    delete urlDatabase[shortURL];
    
    return res.redirect(`/urls`);
  }

});


/****USER LOGIN ****/

app.get("/login", (req, res) => {
  console.log("line 258 get/login req.body=>",req.body)
  console.log("line 258 get/login req.params =>",req.params)
  let templateVars = {
    email: getUserInfoByValue(userObj, req.session['user_id']).email,
    urls : urlDatabase 
  };
  
  res.render('user_login', templateVars);
});


app.post('/login', (req, res) =>{
  
  const { email, password } = req.body;
  const hashedPW            = bcrypt.hashSync(password, salt);
  const user                = getUserInfoByValue(userObj, email);
  
  //makes sure both fields are filled
  if (email === '' || password === '') {

    //would end up sending them back to the registration form with a OUPS
    return res.status(400).send('Oops! Please go back and fill out the forms properly!');
  //makes sure the emails are matching
  }  else if (email !== user.email) {

    return res.status(403).send('Oops wrong email! Please go back and try again!');
  //makes sure the hashed passeword matched the one in the databank
  } else if (!bcrypt.compareSync(user.password, hashedPW)) {

    return res.status(403).send('Oops wrong password! Please go back and try again!');
  //if and only if everything is matching
  } else if (email === user.email && bcrypt.compareSync(user.password, hashedPW)) {
    
  const user_id = user.id;
   
  // if the user and the hashed password are valid and associated with an account, an encrypted cookie session
  // is created and the user is redirected to the index page.
  req.session.user_id = userObj[user_id].email;
  res.redirect("/urls");
  }
});


app.post("/login/button", (req, res) =>{

  let templateVars = {
    email: getUserInfoByValue(userObj, req.session['user_id']).email,
    urls : urlDatabase 
  };

  res.redirect('/login', templateVars);
});

/**** USER LOGOUT ****/

app.post('/logout', (req,res) => {

  req.session = null;
  res.redirect('/urls');
});




/**** USER REGISTRATION ****/

app.get("/register", (req, res) => {
  
  const templateVars = {
    email: null
  }
  res.render('user_registration', templateVars);
});
 


app.post("/register", ( req, res) => {

  const { email, password } = req.body;
  const hashedPW            = bcrypt.hashSync(password, salt);
  const user                = getUserInfoByValue(userObj, email);

  //conditionals making sure there is an email and a password to create the account
  if (email === '' || password === ''){

    return res.status(400).send('Oops! Please go back and fill out the forms properly!'); 
  //makes sure the email isn't associated to an account already
  } else if (email === user.email) {

    
    return res.status(400).send('Oops! We already have this email in our data bank. Please go back and enter a new email.');
  //if all the fields are conditions are met - an account is created with a hashed password and an ecrypted session
  } else {
    
    createUser(userObj, email, hashedPW);
    
    const user_id = getUserInfoByValue(userObj, email).id;
    
    req.session.user_id = userObj[user_id].email;
    res.redirect("/urls")
  }

});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}`);
});