
let crypto = require("crypto");


const getUserInfoByValue = (userObj, value) => {
  
  for (let user in userObj) {
    if (userObj[user].email === value) {
      return userObj[user];
   
    } else if (userObj[user].id === value) {
      return (userObj[user]);
    }
  }
  return false;
};


const urlsBelongsToUser = (urlId, user, urlDatabase) => {

  let result = false;
  
  if (!urlDatabase[urlId].userID) {
    result = true;

  } else if (urlDatabase[urlId].userID === user.id) {
    result = true;
  }
  return result;
};

const generateRandomString = (num) => {
  let newShortId = crypto.randomBytes(num).toString('hex');
  return newShortId;
};


module.exports = {urlsBelongsToUser, getUserInfoByValue , generateRandomString};