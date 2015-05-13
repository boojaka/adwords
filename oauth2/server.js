
var express = require('express'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	soap = require('soap'),
	https = require('https'),
	httpProxy = require('http-proxy'),
	qs = require('querystring'),
	app = express(),
	jade = require('./lib/jade.js'),
	proxy = new httpProxy.createProxyServer();

proxy.on('error', function(err, req, res){
	res.statusCode = 500;
	res.end('Error occured while processing your request!');
	// whom should we send error message?
});

app.use(cookieParser());
app.use(session({
	secret: 'adwords api',
	unset: 'destroy',
	cookie: { maxAge: 360000 }
}));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

var credentials = global.credentials = JSON.parse(fs.readFileSync(__dirname + '/credentials.json').toString('utf8'));

var oauth_input_fields = Object.keys(credentials && credentials.oauth2 || {}).map(function(x){
	return {
		name: x,
		value: credentials.oauth2[x]
	};
});

app.get('/', function(req, res, next){
	if(!req.session.g_api_key)
		return res.redirect('/oauth2login');
	
	repl_context.g_api_key = req.session.g_api_key;
	
	
	next();
});

app.get('/dev-reset', function(req, res){
	Object.keys(req.cookies).forEach(function(x){
		res.cookie(x,'');
	});
	res.redirect('/');
});

app.get('/oauth2login', function(req, res){
	res.render('oauth.jade', {
		input_fields: oauth_input_fields		
	});
});

app.get('/oauth2callback', function (req, res) {
	
	if(req.query.code){
		
		var data = new Buffer(
			qs.encode({
				code: req.query.code,
				client_id:credentials.oauth2.client_id,
				client_secret:credentials.account_info.client_secret,
				redirect_uri:credentials.oauth2.redirect_uri,
				grant_type:"authorization_code"
			})
		);
		
		
		var in_headers = {
			"Host": "www.googleapis.com",
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": data.length
		};
		
		var auth_req = https.request({
			method: "POST",
			host: "www.googleapis.com",
			path: "/oauth2/v3/token",
			headers: in_headers
		}, function(auth_res){
			var response_buf = [];
			auth_res.on('data', function(chunk){
				response_buf.push(chunk);
			});
			
			auth_res.on('end', function(){
				var json = JSON.parse(Buffer.concat(response_buf).toString());
								
				// Here we have Google API Access key and we can use it for anything //
				//TODO: ???
				if(json.access_token)
					req.session.g_api_key = json;
				
				//res.end(JSON.stringify(json));
				res.redirect('/');
			});
			
		}).on('error', function(e){
			res.end(''+e);
		}).end(data);
		
		
		
	}
	
	//res.redirect('/');
});

app.use('/ajax/', function(req, res, next){
	// TODO: Send query to Google Adwords API communicator //
	res.setHeader('Content-Type', 'application/json;charset=utf-8'); // expecting JSON
	
	next();
});

app.use('/ajax/', require('./lib/targeting_ideas_service_api.js'));

app.use('/ajax/', function(req, res, next){
	res.end(JSON.stringify({
		err:'ERR_BAD_URL',
		url:req.originalUrl
	}), 'utf8');
});

app.use(function(req, res){
	res.setHeader('Cache-Control', 'max-age='+(60*60));
	// link with angular gui //
	proxy.web(req, res, {
		target: 'http://localhost:9000', // TODO: get that from configuration 
		xfwd: true
	});
});

app.listen(process.env.port || 3000)
.on('error', function(err){
	console.log(err);
})
.on('listening', function(){
	console.log('listening on port', this.address().port);
	repl_context = require('repl').start('> ').context;	
	
	repl_context.credentials = credentials;
});
