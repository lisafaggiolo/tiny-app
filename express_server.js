const express    = require("express");
const app        = express();
const PORT       = 8080;
const bodyParser = require("body-parser");
const bcrypt     = require("bcrypt");
const salt       = bcrypt.genSaltSync(10);
const cookieSession = require("cookie-session");

const { urlsBelongsToUser, getUserInfoByValue, generateRandomString } = require("./helpers");

app.use(cookieSession({

  name: "session",
  keys: ["hello this is key 1", "dont forget about key2"]
}));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));


app.use((err, req, res, next) => {
  
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const createUser = (userObj, email ,password) => {
  const newUserId = generateRandomString(2);
  
  return userObj[newUserId] = {
    id : newUserId,
    email,
    password
  };
};


/**** TEMP DATABASES ****/

let urlDatabase = {

  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": {longURL: "http://www.google.com",        userID: "user2RandomID"},
  "9sm5x2": {longURL: "http://www.google.com",        userID: "userRandomID"},
};

const userObj = {
  
  "userRandomID": {
    id : "userRandomID",
    email : "user@example.com",
    password: bcrypt.hashSync("1234", salt)
  },
  "user2RandomID": {
    id      : "user2RandomID",
    email   : "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
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
    return res.redirect("/login");

  } else {
    return res.render("urls_new", templateVars);
  }
});


app.get("/", (req, res) => {
  
  res.redirect("/urls");
});


/**** MODIFY URLS ***/

//renders the urls_show page (if the user is allowed to modify it!)
app.get("/urls/:id", (req, res) => {

  const shortURL     = req.params.id;
  const user         = getUserInfoByValue(userObj, req.session["user_id"]);
  const allowedOrNot = urlDatabase[shortURL].userID === user.id;


  let templateVars = {
    email   : user.email,
    shortURL: shortURL,
    longURL : urlDatabase[shortURL].longURL,
    user    : user
  };


  if (user.email === undefined) {
    return res.redirect("/urls");

  } else if (!urlDatabase[shortURL].userID) {
    return res.render("urls_show", templateVars);

  } else if (!allowedOrNot) {
    return res.redirect("/urls");

  } else {
    return res.render("urls_show", templateVars);
  }
});


//modifies the url and sends user back to the urls_index page (url is now modified)
app.post("/urls/:id", (req, res) => {

  const user     = getUserInfoByValue(userObj, req.session["user_id"]);
  const shortURL = req.params.id;
  const longURL  = req.body.longURL;

  urlDatabase[shortURL] = { longURL: longURL, userID: user.id };
  
  return res.redirect("/urls");
});


//if the URL for the given ID exists - redirects to corresponding long URL
app.get("/u/:id", (req, res) => {
  
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("Oops! This short URL doesn't exist! Please enter a valid URL!");
  
  } else {
    return res.redirect(urlDatabase[req.params.id].longURL);
  }
});




/**** URLS SPECIFIC ****/

//renders the urls_index page (under certain conditions)
app.get("/urls", (req, res) => {

  const user    = getUserInfoByValue(userObj, req.session.user_id);
  const urls    = urlDatabase;
  const userURL = {};

  let templateVars = {
    email   : user.email,
    id      : user.id,
    password: user.password,
    urls    : userURL,
    user    : user
  };
  
  if (!user) {
    return res.render("urls_index", templateVars);

  } else {
    for (let shortURL in urls) {
      if (urlsBelongsToUser(shortURL, user, urlDatabase)) {
        userURL[shortURL] = urls[shortURL];
      }
    }
  }

  return res.render("urls_index", templateVars);
});



//responsible for adding newly created or modified urls to the urls_index page
app.post("/urls", (req, res) => {

  const shortURL = generateRandomString(3);
  const user     = getUserInfoByValue(userObj, req.session.user_id);
  const longURL  = req.body.longURL;

  if (longURL.startsWith('http://') || (longURL.startsWith('https://'))) {
    urlDatabase[shortURL] = { longURL: `${longURL}`, userID: user.id };

  } else {
    urlDatabase[shortURL] = { longURL: `http://${longURL}`, userID: user.id };
  }

  return res.redirect("/urls");
});



/**** /urls/:shortURL SPECIFICS ****/

app.get("/urls/:shortURL", (req, res) => {

  const user = getUserInfoByValue(userObj, req.session["user_id"]);

  let templateVars = {
    email   : user.email,
    shortURL: req.params.shortURL,
    longURL : urlDatabase[req.params.shortURL]
  };
    
  return res.render("urls_show", templateVars);
});



/**** USER DELETING URLS FROM MAIN PAGE ****/

app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL  = req.params.shortURL;
  const user      = getUserInfoByValue(userObj, req.session.user_id);
  const isAllowed = urlsBelongsToUser(shortURL, user, urlDatabase);
  
  if (!isAllowed) {
    return res.redirect("/urls");

  } else {
    delete urlDatabase[shortURL];
    return res.redirect(`/urls`);
  }

});


/****USER LOGIN ****/

app.get("/login", (req, res) => {
 
  let templateVars = {
    email: getUserInfoByValue(userObj, req.session["user_id"]).email,
    urls : urlDatabase
  };
  
  res.render("user_login", templateVars);
});


app.post("/login", (req, res) =>{
  
  const { email, password } = req.body;
  const user                = getUserInfoByValue(userObj, email);

  if (email === "" || password === "") {
    return res.status(400).send("Oops! Please go back and fill out the forms properly!");
  
  }  else if (email !== user.email) {
    return res.status(403).send("Oops wrong email/password! Please go back and try again!");
  
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Oops wrong email/password! Please go back and try again!");
  
  } else if (email === user.email && bcrypt.compareSync(password, user.password)) {
    const user_id = user.id;

    req.session.user_id = userObj[user_id].email;
    res.redirect("/urls");
  }
});


//login button located in the header
app.post("/login/button", (req, res) =>{

  let templateVars = {
    email: getUserInfoByValue(userObj, req.session["user_id"]).email,
    urls : urlDatabase
  };

  res.redirect("/login", templateVars);
});


/**** USER LOGOUT ****/

app.post("/logout", (req,res) => {

  req.session = null;
  res.redirect("/urls");
});


/**** USER REGISTRATION ****/

app.get("/register", (req, res) => {
  
  const templateVars = { email: null };

  res.render("user_registration", templateVars);
});
 

//registers the user in the database with an encrypted cookie session and hashed password
app.post("/register", (req, res) => {

  const { email, password } = req.body;
  const hashedPW            = bcrypt.hashSync(password, salt);
  const user                = getUserInfoByValue(userObj, email);
  
  if (email === "" || password === "") {

    return res.status(400).send("Oops! Please go back and fill out the forms properly!");
  } else if (email === user.email) {

    return res.status(400).send("Oops! We already have this email in our data bank. Please go back and enter a new email.");
  } else {
    
    createUser(userObj, email, hashedPW);
    const user_id = getUserInfoByValue(userObj, email).id;
    
    req.session.user_id = userObj[user_id].email;
    res.redirect("/urls");
  }

});


app.get("/urls.json", (req, res) => {

  res.json(urlDatabase);
});

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}`);
});