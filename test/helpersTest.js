const { assert } = require('chai');

const { urlsBelongsToUser, getUserInfoByValue } = require('../helpers');

let urlDatabase = {

  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": {longURL: "http://www.google.com",        userID: "user2RandomID"},
  "9sm5x2": {longURL: "http://www.google.com",        userID: "userRandomID"},
};

const testUsers = {
  "userRandomID": {
    id      : "userRandomID", 
    email   : "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id      : "user2RandomID", 
    email   : "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByInfoValue', () => {
  it('should return a user with valid email', () => {
    const user = getUserInfoByValue(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";

    assert.equal(user.id, expectedOutput);
    
  });

  it("should return undefined if the email isn't associated with a user in our database", () => {
    const user = getUserInfoByValue(testUsers, "user@exampless.com");
    const expectedOutput = undefined;

    assert.equal(user.id, expectedOutput);
  })
});



describe('urlsBelongsToUser', () => {
  it('should return true if the url belongs to the user', () => {
    const belongsToUser =  urlsBelongsToUser("b2xVn2", "userRandomID", urlDatabase);
    const expectedOutput = true;

    assert.equal(belongsToUser, expectedOutput);
    
  });

  it("should return false if the url doesn't belongs to the user", () => {
    const belongsToUser =  urlsBelongsToUser("b2xVn2", "user2RandomID", urlDatabase);
    const expectedOutput = false;

    assert.equal(belongsToUser, expectedOutput);
  })
});