var express = require("express");
var router  = express.Router();

// Database config
var fs 			= require("fs");
var database 	= "data.db";
var exists 		= fs.existsSync(database);

if (!exists) {
	console.log("Creating a flat DB file");
	fs.openSync(database, "w");
}

var createUsers = "CREATE TABLE IF NOT EXISTS Users (USERNAME text PRIMARY KEY, PASSWORD text, LOCATION text);";

router.get("/", function(req, res, next) {
	db.serialize(function() {
		db.run(createUsers);

		var selectQuery = "SELECT * FROM Users"
		db.all(selectQuery, function(err, rows) {
			res.render("login", {
				data: rows,
				user: true
			});
		});
	});
});

router.post("/newUser", function(req, res, next) {
	db.serialize(function() {
		var postQuery = "INSERT INTO Users (USERNAME, PASSWORD, LOCATION) VALUES(?, ?, ?)"
		db.all(postQuery, [req.body.username, req.body.password, "Markham"]);
		res.end();
	});
});

module.exports = router;
