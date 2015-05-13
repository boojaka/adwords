
var router = require('express').Router();
var jade = require('./jade.js');
var parser = require('xml2json');
var util = require('util');
var https = require('https');


var soap_request_template = jade.compileFile(__dirname + '/targeting_ideas_service.jade');


router.use(function(req, res, next){
		
	if(!req.session.g_api_key) {
		return res.end(JSON.stringify({
			errCode: 'ERR_NOT_AUTHORIZED',
			url: req.originalUrl
		}));
	}
	
	next();
});

var ti_data_fields = {
	'CATEGORY_PRODUCTS_AND_SERVICES': {
		description: [
			'Represents a category ID in the "Products and Services" taxonomy.',
			'Resulting attribute is IntegerSetAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD.'
		].join('\n\n'),
		getter: function(data){
			if(data.key == 'CATEGORY_PRODUCTS_AND_SERVICES'){
				return data.value.value;
			}
		},
		isValid: function(request){
			return request.ideaType === 'KEYWORD';
		}
	},
	'COMPETITION':  {
		description: [
			'Represents the relative amount of competition associated with the given keyword idea, relative to other keywords. This value will be between 0 and 1 (inclusive).',
			'Resulting attribute is DoubleAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD.'
		].join('\n\n'),
		getter: function(data){
			if(data.key == 'COMPETITION'){
				return data.value.value;
			}
		},
		isValid: function(request){
			return request.ideaType === 'KEYWORD';
		}
	},
	'CRITERION':  {
		description: [
			'Represents a keyword or placement, depending on request type. Starting at version v201206, only placement requests can retrieve this attribute.',
			'This element is supported by following IdeaTypes: KEYWORD, PLACEMENT.'
		].join('\n\n'),
		getter: function(data){
			console.warn('Warning! CRITERION is not implemented!');
		},
		isValid: function(request){
			return request.ideaType === 'PLACEMENT';
		}
	},
	'EXTRACTED_FROM_WEBPAGE':  {
		description: [
			'Represents the webpage from which this keyword idea was extracted (if applicable.)',
			'Resulting attribute is WebpageDescriptorAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD.'
		].join('\n\n'),
		getter: function(data){
			console.warn('Warning! EXTRACTED_FROM_WEBPAGE is not implemented!');
		},
		isValid: function(request){
			return request.ideaType === 'KEYWORD';
		}
	},
	'IDEA_TYPE':  {
		description: [
			'Represents the type of the given idea.',
			'Resulting attribute is IdeaTypeAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD, PLACEMENT.'
		].join('\n\n'),
		getter: function(data){
			console.warn('Warning! IDEA_TYPE is not implemented!');
		},
		isValid: function(request){
			return true;
		}
	},
	'KEYWORD_TEXT':  {
		description: [
			'Represents the keyword text for the given keyword idea.',
			'Resulting attribute is StringAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD.'
		].join('\n\n'),
		getter: function(data){
			if(data.key == 'KEYWORD_TEXT'){
				return data.value.value;
			}
		},
		isValid: function(request){
			return request.ideaType === 'KEYWORD';
		}
	},
	'SEARCH_VOLUME':  {
		description: [
			"Represents either the (approximate) number of searches for the given keyword idea on google.com or google.com and partners, depending on the user's targeting.",
			'Resulting attribute is LongAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD.'
		].join('\n\n'),
		getter: function(data){
			if(data.key == 'SEARCH_VOLUME'){
				return data.value.value;
			}
		},
		isValid: function(request){
			return request.ideaType === 'KEYWORD';
		}
	},
	'AVERAGE_CPC':  {
		description: [
			'Represents the average cost per click historically paid for the keyword.',
			'Resulting attribute is MoneyAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD.'
		].join('\n\n'),
		getter: function(data){
			if(data.key == 'AVERAGE_CPC'){
				return data.value.value['ns2:microAmount'];
			}
		},
		isValid: function(request){
			return request.ideaType === 'KEYWORD';
		}
	},
	'TARGETED_MONTHLY_SEARCHES':  {
		description: [
			'Represents the (approximated) number of searches on this keyword idea (as available for the past twelve months), targeted to the specified geographies.',
			'Resulting attribute is MonthlySearchVolumeAttribute.',
			'This element is supported by following IdeaTypes: KEYWORD.'
		].join('\n\n'),
		getter: function(data){
			if(data.key == 'TARGETED_MONTHLY_SEARCHES'){
				return util.isArray(data.value.value) ? data.value.value : [data.value.value];
			}
		},
		isValid: function(request){
			return request.ideaType === 'KEYWORD';
		}
	}
};

router.get('/', function(req, res){
	res.end(JSON.stringify({		
		requestedAttributeTypes: ti_data_fields
	}));
});

router.post('/query', function(req, res){
	
	//console.log(req.body);
	
	if(!req.body)
		return res.end(JSON.stringify({
			errCode: 'ERR_NO_JSON_DATA',
			url: req.originalUrl
		}));

	// set default values for missing fields //
	
	req.body.ideaType = req.body.ideaType || 'KEYWORD';
	req.body.startIndex = 0;
	req.body.numberResults = 30;
		
	
	///////////////////////////////////////////
		
	// validate input data //
	
	if(req.body.pageIndex != null){
		if(typeof(req.body.pageIndex) != 'number')
		return res.end(JSON.stringify({
			errCode: 'ERR_BAD_INPUT',
			key: 'pageIndex',
			url: req.originalUrl
		}));
		
		req.body.startIndex = req.body.pageIndex * req.body.numberResults;
	}
	
	switch(req.body.ideaType){
		case 'KEYWORD':
		case 'PLACEMENT':
		break;
		default:
		return res.end(JSON.stringify({
			errCode: 'ERR_BAD_INPUT',
			key: 'ideaType',
			url: req.originalUrl
		}));
	}
	
	
	if(!util.isArray(req.body.searchQueries) ||
		!req.body.searchQueries.length ||
		!req.body.searchQueries.every(function(x){
			return typeof(x) == 'string';
		}))
		return res.end(JSON.stringify({
			errCode: 'ERR_BAD_INPUT',
			key: 'searchQueries',
			url: req.originalUrl
		}));
		
	var attributeTypes = Object.keys(ti_data_fields), attributeTypes_list = [].concat(attributeTypes);
		
	if(!util.isArray(req.body.requestedAttributeTypes) ||
		!req.body.requestedAttributeTypes.length ||
		!req.body.requestedAttributeTypes.every(function(x){			
			if(typeof(x) == 'string'){
				var index = attributeTypes.indexOf(x);
				if(index != -1 && ti_data_fields[x].isValid(req.body)) {					
					attributeTypes.splice(index, 1); // names must be unique
					return true;
				}
			}
			return false;
		}))
		return res.end(JSON.stringify({
			errCode: 'ERR_BAD_INPUT',
			key: 'requestedAttributeTypes',
			url: req.originalUrl
		}));
		
	if((util.isArray(req.body.locations) || req.body.locations != null) &&
		(!req.body.locations.length ||
		!req.body.locations.every(function(x){
			return typeof(x) == 'string';
		})))
		return res.end(JSON.stringify({
			errCode: 'ERR_BAD_INPUT',
			key: 'locations',
			url: req.originalUrl
		}));
		
	
	////////////////////////
	// append credentials //
	req.body.costumerId = global.credentials.account_info.customer_id;
	req.body.developerToken = global.credentials.account_info.developer_token;
	req.body.userAgent = credentials.account_info.application_name;
	////////////////////////
	
	var soap_request = soap_request_template(req.body);
	
	//console.log(soap_request);
	
	SendRequestToAdwordsAPI(soap_request, req.session.g_api_key.access_token, onApiResponse);
	
	
	function onApiResponse(socketError, response){
		//return res.end(parser.toJson(response));
		// extract sensitive information from xml-based document //
		var json = JSON.parse((function(){
			try {
				return parser.toJson(response);
			} catch(e) {
				return null;
			}
		})());
		
		var rval = SafeGet(json, ['soap:Envelope','soap:Body','getResponse','rval']);
		
		if(rval){
			res.end(JSON.stringify({
				num_entries: rval.totalNumEntries,
				num_entries_per_page: req.body.numberResults,
				entries: (util.isArray(rval.entries) ? rval.entries : [rval.entries]).map(mapEachEntry)
			}));
		}
		else {
			
			var errObject = SafeGet(json, ['soap:Envelope','soap:Body','soap:Fault','detail','ApiExceptionFault','ns2:errors']);
			
			if(errObject){
				res.end(JSON.stringify({
					errCode: 'ERR_EXEC_FAILED',
					message: errObject['ns2:errorString'],
					fieldPath: errObject['ns2:fieldPath'],
					trigger: errObject['ns2:trigger'],
					url: req.originalUrl
				}));
			}
			else {
				res.end(JSON.stringify({
					errCode: 'ERR_EXEC_FAILED',
					message: 'UKNOWN', 
					url: req.originalUrl
				}));
			}
			
			//res.end(parser.toJson(response));
		}		
		///////////////////////////////////////////////////////////
		
		
	}
	
	function mapEachEntry(entry){
		var output = {};
		(util.isArray(entry.data) ? entry.data : [entry.data]).forEach(forEachDataItem, output);
		return output;		
	}
	
	function forEachDataItem(data){
		attributeTypes_list.some(processRequestedAttributeObject, {
			output: this,
			data: data
		});
	}
	
	function processRequestedAttributeObject(attr){		
		var ret = ti_data_fields[attr].getter(this.data);
		if(ret != null){
			this.output[attr] = ret;
			return true;
		}
		return false;
	}
});


module.exports = router;


function SendRequestToAdwordsAPI(input, bearer_token, cb){
	
	var input_buf = new Buffer(input);
	
	var req = https.request({
		method: 'POST',
		host: 'adwords.google.com',
		path: '/api/adwords/o/v201502/TargetingIdeaService',
		headers: {
			'Host': 'adwords.google.com',
			'Authorization' : 'Bearer ' + bearer_token,
			'Content-Type': 'application/soap+xml; charset=utf-8',
			'Content-Length': input_buf.length
		}
	}, function(res){
		var response_buf = [];
		res.on('data', function(chunk){
			response_buf.push(chunk);
		});
			
		res.on('end', function(){
			cb(null, Buffer.concat(response_buf).toString());
		});
	}).on('error', cb);
	
	req.end(input_buf);
	
}

function SafeGet(data, keys){
	var obj, i;
	for(obj = data, i = 0; obj && i < keys.length; obj = obj.hasOwnProperty(keys[i]) && obj[keys[i]] || null, i++);
	return obj;
}



 
