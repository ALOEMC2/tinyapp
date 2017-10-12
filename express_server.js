var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");


function generateRandomString() {
return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
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
    username: req.cookies["username"]
  };

  res.render("urls_show", templateVars);
});


app.post("/login",(req,res)=>{
  let tobi =req.body.username ;
  // console.log(tobi);
  res.cookie('username', tobi );
  res.redirect("/urls");

});







app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});