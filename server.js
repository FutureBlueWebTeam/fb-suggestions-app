// Node npm packages requires
var express     = require("express");
var bodyParser  = require("body-parser");
var http        = require("http");

// Server variables
var app         = express();
var httpPort    = process.env.PORT || 8080;

// Serve up the public folder to the site
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

// Set up view engine to be html - render html
app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Require the necessary express routes and use them
app.use("/", require("./routes/index.js"));
app.use("/login", require("./routes/login.js"));
app.use("/register", require("./routes/register.js"));
app.use("/profile", require("./routes/profile.js"));

// Start up the server
var httpServer      = http.createServer(app);
httpServer.listen(httpPort);

console.log("Magic happens on port " + httpPort);
