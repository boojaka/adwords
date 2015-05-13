
var express = require('express');

var app = express();


app.use(function(req, res, next){
	res.setHeader('Content-Type', 'application/json; charset=utf8');
	next();
});


app.get("/test-json", require('./lib/test-json.js'));


app.use(function(req, res){
	res.statusCode = 404;
	res.end(JSON.stringify({
		errCode: "ERR_ENTRY_NOT_FOUND",
		path: req.url
	}));
});


var server = app.listen(9000);

server.on('error', function(err){
	throw err;
});



 
