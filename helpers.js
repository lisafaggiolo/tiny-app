const { DH_UNABLE_TO_CHECK_GENERATOR } = require("constants");
let crypto = require("crypto");

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

const urlsBelongsToUser = (urlId, user, urlDatabase) => {

  let result = false;
  //console.log(urlDatabase[urlId].userID);
  if (!urlDatabase[urlId].userID) {
    result = true;

  } else if (urlDatabase[urlId].userID === user.id) {
     result = true
   }
  

   return result;
}

function generateRandomString(num) {
  let newShortId = crypto.randomBytes(num).toString('hex');
  return newShortId;
}





module.exports = {urlsBelongsToUser, getUserInfoByValue , generateRandomString};