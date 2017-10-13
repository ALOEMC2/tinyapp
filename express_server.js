var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");


function generateRandomString(){
  const alphabet =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let output = '';
  for(let i = 0; i < 6; i +=1){
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return output
}


// function generateRandomString() {
// return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
// }

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "alo@gmail.com",
    password: "goofy"
  },
}

app.get("/login",(req,res)=>{

  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
    errors: {
      email: '',
      password: ''
    }
  };
  // let tobi =req.body.username ;
  // // console.log(tobi);
  // res.cookie('username', tobi );

  res.render("urls_login", templateVars);

});
app.post("/login",(req,res)=>{
  let email = req.body.email;
  let password = req.body.password;// loop over user database
  // find email == this email
  for(var x in users){
    if ((users[x].email == email)&&(users[x].password == password)){
      res.cookie('user_id',users[x].id);
      res.redirect('/urls');

    } else{console.log("error")}
   }res.redirect('/login');
})
  // check if pw == this pw
  // if then redirect to urls
  // not error





app.get("/urls/new", (req, res) => {
  if(!req.cookies.user_id){
    res.redirect("/login");
    return;
  }
  var templateVars = {user: users[req.cookies['user_id']]}
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  let shortURL = req.params.shortURL
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {

    delete(urlDatabase[req.params.id])

  res.redirect("/urls")
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL =  generateRandomString()
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {
  if(!req.cookies.user_id){
    res.redirect("/login");
    return;
  }
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.end({urls:urlDatabase});
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.post("/logout",(req,res) => {

    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', {expires: new Date(0)});
    }
    res.redirect('/urls');
});

app.get("/register",(req,res)=>{

  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']],
    errors: {
      email: '',
      password: ''
    }
  };
  res.render("urls_register", templateVars);

});
app.post("/register",(req,res)=>{
  let email = req.body.email;
  let newEmail = email;
  let password = req.body.password;
  let id = generateRandomString();
  var templateVars = {
      urls: urlDatabase,
      user: users[req.cookies['user_id']],
      errors: {
        email: '',
        password: ''
      }
    }
  let hasErrors = false

  if (!hasErrors) {
    for(var x in users){

      if (users[x].email === email){//should be newUser.email
        hasErrors = true
        templateVars.errors.email = "Email address already exists"
        console.log(`${users[x].email},${newEmail}, 404`)// this one
        console.log("404");
       }
    }
  }

  let newUser = {"id":id,"email":email,"password":password};
  users[id] = newUser;

  if (newUser.email === '') {
    templateVars.errors.email = "Email can't be blank"
    hasErrors = true
  }
  if (newUser.password.length <= 0) {
    templateVars.errors.password = 'Password invalid'
    hasErrors = true
  }
  // if (!hasErrors) {
  //   for(var x in users){

  //     if (users[x].email === newUser.email){
  //       hasErrors = true
  //       templateVars.errors.email = "Already exists"
  //       console.log(`${users[x].email},${newUser.email},${newEmail}, 404`)// this one
  //       console.log("404");
  //      }
  //   }
  // }

  if (hasErrors) {
    res.render('urls_register', templateVars);
  } else {
    hasErrors = false;
    let newUser = {"id":id,"email":email,"password":password};// this one
    res.cookie('user_id',newUser.id);
    console.log(newUser);
    res.redirect("/urls");// redirect will not work with templateVars
  }
      //console.log(users[x].email)
  // res.cookie('password',newUser.password);
  // res.cookie('email',newUser.email);




});

app.post("/urls/edit/:id",(req,res)=>{
  let id = req.params.id;
  // console.log(req.body); // = {longURL : 'blah' }
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect(`/urls/${id}/`);
});

app.get("/urls/:id", (req, res) => {
  // TODO: Get longurl from urls database for a given short url
  let longURL = urlDatabase[req.params.id]

  let templateVars = {
    shortURL: req.params.id,
    longURL: longURL,
    user: users[req.cookies['user_id']]
  };

  res.render("urls_show", templateVars);
});










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});