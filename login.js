var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");

// connect to database
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodelogin"
});

var app = express();

app.set ("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/login", function(request, response){
   response.sendFile(path.join(__dirname + "/login.html")); 
});

app.post("/auth", function(request, response) {
    var username = request.body.username;
    var password = request.body.password;

    if (username && password) {
        connection.query(
            "SELECT * FROM accounts WHERE username = ? AND password = ?",
            [username, password],
            function(error, results, fields) {
                //console.log(username);
                if (results.lenght > 0) {
                    request.session.loggedin = true;
                    request.session.username = username;
                    // respone.redirect("/home");
                    response.redirect("/webboard");
                } else {
                    response.send("Incorrect Username and/or Password!");
                }
                response.end();
            }
        );
    } else {
        response.send("Please enter Username and Password!");
        response.end();
    }
});

app.get("/home", function(request, respone) {
    if (request.session.loggedin) {
        respone.send("Welcome back," + request.session.username + "!");
        //respone redirect("/webboard");
    } else {
        respone.send("Please login to view this page!");
    }
    respone.end();
});

app.get("/signout", function(request, respone) {
    request.session.destroy(function (err) {
        respone.send("Signout ready!");
        respone.end();
    });
});

app.get("/webboard", (req, res) => {
    if (req.session.loggedin)
    connection.query("SELECT * FROM accounts", (err, result) => {
              res.render("index.ejs", {
                  posts: result
              });
              console.log(result);
          });
          else
            res.send("You must to login First!!!");
            console.log("You must to login First!!!");
    });

    app.get("/add", (req, res) => {
        res.render("add");
    });

    app.post("/add", (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const post = {
            username: username,
            password: password,
            email: email,
        };
        if (req.session.loggedin)
          connection.query("INSERT INTO accounts SET ?", post, (err) => {
              console.log("Data Inserted");
              return res.redirect("/webboard");
          });
        else res.send("You must to login First!!!");
        console.log("You must to login First!!!");
        // res.end();
    });

    app.listen(9000);
    console.log("running on port 9000...");