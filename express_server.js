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

  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"},
  "9sm5x2": {longURL: "http://www.google.com", userID: "userRandomID"},
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
  //console.log(req.cookies);  
  let templateVars = {
    email: getUserInfoByValue(userObj, req.cookies['user_id']).email


  };

  
  if (templateVars.email === undefined) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }

  
})


app.get('/', (req, res) => {
  
  res.redirect('/urls');
});


/**** ADDING A NEW URL****/ 

app.get("/urls/:id", (req, res) => {
// if the user isnt connected, send him back to login page

  //console.log(req.cookies);
  //console.log(req.params.id);

  const shortURL = req.params.id;
  const user = getUserInfoByValue(userObj, req.cookies['user_id']);
  let templateVars = {
    email: user.email,
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL]['longURL'],
    user: user
  };

 // console.log(req.cookies['user_id'])
  const allowedOrNot = urlDatabase[shortURL].userID === user.id;
  
  if (templateVars.email === undefined) {
    res.redirect("/login");
  
  } else if (!allowedOrNot){ 
    
    res.redirect("/urls");
  } else {

    res.render("urls_show", templateVars);
  }

})

app.post("/urls/:id", (req, res) => {
  
  const shortURL = req.params.id;
  const longURL = req.body.longURL; 
  console.log(req.body);
  //console.log(req.params);
  urlDatabase[shortURL].longURL = longURL 
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  
  res.redirect(urlDatabase[req.params.id].longURL);
});




app.get('/urls', (req, res) => {
  const user = getUserInfoByValue(userObj, req.cookies['user_id']);
  const urls = urlDatabase;
   userURL = {}
  //console.log('user is:', user);
  //console.log("urls are:", urls);

  console.log(userURL);
  let templateVars = { 
    email: user.email,
    id: user.id,
    urls: userURL,
    user: user 
  };

  if (!user) {
    
    res.render('urls_index', templateVars);
  } else {
    
    for (let shortURL in urls){
      
      if (urlsBelongsToUser(shortURL, user.id)){
        userURL[shortURL] = urls[shortURL];
      }
    }
  }


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

  const shortURL = req.params.shortURL;
  const user = getUserInfoByValue(userObj, req.cookies['user_id']);
  
  const isAllowed = urlsBelongsToUser(shortURL, user.id);
  

  //console.log(urlsBelongsToUser(shortURL, user));
  if (!isAllowed) {

    res.redirect('/urls');
  } else {
    
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }

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


/**** AWESOME HELPER FUNCTIONS ****/

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

const urlsBelongsToUser = (urlId, user) => {
  
  let result = false;
  
  if (urlDatabase[urlId].userID === getUserInfoByValue(userObj, user).id) {
     result = true
   }
  

   return result;
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