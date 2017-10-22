var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["/* secret keys */"],
  secret:'secret',
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.set("view engine", "ejs");

const bcrypt = require('bcrypt');

var urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    user_id: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    user_id: "user2RandomID"
  },
  "MB7ca1": {
    url: "http:www.sleep.com",
    user_id: "user3RandomID"
  },
  "KTb40Q": {
    url: "http:www.beer.com",
    user_id: "user3RandomID"
  },
  "3ocUjV": {
    url: "http:www.canoe.ca",
    user_id: "user3RandomID"
  }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$XuUBm87VXVyfY8brV1b0NOaR/rrWjhPMsI9B3CUYRftED2o8wYleC",

  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$.ZQ9/oZb6dDc9ke9WfvmsOQitQY4lqsVgHXy/AUFOPrxyS88Ho.jO"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "alo@gmail.com",
    password: "$2a$10$e.TLOipGofZrVL2EJEu68.U0x2hQ3H0i4pOxuY.aemUIYVHx9aUe2"
  },
};

function generateRandomString(){
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let output = '';
  for (let i = 0; i < 6; i +=1){
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
};

app.get("/login", (req, res) =>{
  console.log(req.session.user_id)
  let templateVars = {
    urls: urlDatabase,
    user:"", //users[req.session.user_id['user_id']],
    errors: {
      email: '',
      password: ''
  }
};
  res.render("urls_login", templateVars);
});


//bcrypt.compareSync(users[user_id].password, hashedPassword);

app.post("/login", (req, res)=>{
  let email = req.body.email;
  let password = req.body.password;// loop over user database
  // find email == this email
  for (var user_id in users){
    if (users[user_id].email === email && bcrypt.compareSync(password, users[user_id].password)) {
      req.session.user_id=users[user_id].id;
      res.redirect('/urls');
      return;
    }else{
     console.log("error")
    }
  }
     res.redirect('/login');

});


app.post("urls_new", (req, res)=>{
  res.render("urls_new", templateVars);
})

app.get("/urls/new", (req, res) => {
  if(!req.session.user_id){
    res.redirect("/login");
    return;
  }
  var templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  }
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
app.get("/urls/short",(req,res)=>{
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_short", templateVars)

});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL =  generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].url = longURL;
  urlDatabase[shortURL].user_id = req.session.user_id;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls", (req, res) => {

  if(!req.session.user_id){
    res.redirect("/login");
    return;
  }
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
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
  res.end("Hello! this one");
});

app.post("/logout", (req, res)  => {
  req.session.user_id = null
    res.redirect('/login');
});

app.get("/register", (req, res) =>{
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    errors: {
      email: '',
      password: ''
    }
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) =>{
  let email = req.body.email;
    for(var key in users){
      if (users[key].email === email){//should be newUser.email
        res.status(403).render('urls_register', {
          errors: {
            email: 'This email is already taken',
            password: ''
          }
        })
        return
      }
    }

    const id = generateRandomString()
    const password = bcrypt.hashSync(req.body.password,10)

    const user = {
      id,
      email,
      password
    }

    users[id] = user
    req.session.user_id = id
    res.redirect("/urls")



  /*let email = req.body.email;
  let newEmail = email;

  let passwordFirst = req.body.password;
  const password = bcrypt.hashSync(passwordFirst, 10);
  let id = generateRandomString();




  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id['user_id']],
    errors: {
        email: '',
        password: ''
    }
  }
  let hasErrors = false;

  if (!hasErrors) {
    for(var x in users){
      if (users[x].email === email){//should be newUser.email
        hasErrors = true
        templateVars.errors.email = "Email address already exists"
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

  if (hasErrors) {
    res.render('urls_register', templateVars);
  } else {
    hasErrors = false;
    let newUser = {"id":id, "email":email, "password":password};// this one
    req.session.user_id=('user_id', newUser.id);
    res.redirect("/urls");// redirect will not work with templateVars
  }*/
});

app.post("/urls/edit/:id", (req, res) =>{
  let shortURL = req.params.id;
  // 1) Save to database
  if(urlDatabase[shortURL]){
    urlDatabase[shortURL].url = req.body.longURL;
  }
  // 2) Retrieve from databse; store in longURL
  let longURL = urlDatabase[shortURL].url;//added .url
  console.log(longURL)
  console.log(shortURL)

  let templateVars = {
    shortURL: shortURL,
    longURL: longURL,

    user: users[req.session.user_id],//['user_id']
    urls: urlDatabase
  }
  res.render("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // TODO: Get url from urls database for a given short url
  let longURL = urlDatabase[req.params.id].url;//[req.params.id].url
  let shortURL = req.params.id;
  let user = users[req.session.user_id];
  let templateVars = {
    shortURL: shortURL,
    longURL: longURL, // object
    user: user,
    urls: urlDatabase
  }
   console.log(longURL)
   console.log(shortURL)
  // console.log(user)
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});