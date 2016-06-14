var express = require("express");
var router  = express.Router();

// Database config 
var sqlite3		= require("sqlite3").verbose();
var fs 			= require("fs");
var database 	= "data.db";
var exists 		= fs.existsSync(database);

if (!exists) {
	console.log("Creating a flat DB file");
	fs.openSync(database, "w");
}

var db 			= new sqlite3.Database(database);
var createUsers = "CREATE TABLE IF NOT EXISTS Users (USERNAME text PRIMARY KEY, PASSWORD text, LOCATION text);"; 

router.get("/", function(req, res, next) {
	db.serialize(function() {
		db.run(createUsers);
	});
	
	res.render("index", {
		data: null, 
		user: null
	});
});

module.exports = router;
