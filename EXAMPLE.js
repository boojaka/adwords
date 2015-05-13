/*
 * RUN SERVER:
 * 1. "grunt serve" at root directory of Adwords project
 * 2. "node server.js" at "./oauth2/"
 * TEST:
 * 1. Open http://localhost:3000/
 * 2. Log in.
 * 3. Open http://localhost:3000/ajax/
 * 4. Evaluate this example code:
 */

var req = new XMLHttpRequest();

req.open('POST', 'query', true);
req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');

req.onreadystatechange = function(){
    if(this.readyState === 4){
        document.body.innerHTML = '';
        var pre = document.createElement('pre');
        pre.appendChild(document.createTextNode(this.responseText));
        document.body.appendChild(pre);
        console.log(JSON.parse(this.responseText)); // you can use 'http://jsbeautifier.org/ to make JSON response more readable //
    }
};

req.send(JSON.stringify({
    searchQueries: [
		// list of keywords (string) //
		'buy flowers'
	],
	locations: [
		// type CriteriaId //
		// reference: https://developers.google.com/adwords/api/docs/appendix/geotargeting //
		'1006886' // London
	],
    languages: [
		// type CriteriaId //
		// reference: https://developers.google.com/adwords/api/docs/appendix/languagecodes //
		'1000' // English
    ],
    // reference: https://developers.google.com/adwords/api/docs/reference/v201502/TargetingIdeaService.AttributeType
    requestedAttributeTypes: ['KEYWORD_TEXT','COMPETITION','SEARCH_VOLUME','AVERAGE_CPC','TARGETED_MONTHLY_SEARCHES','CATEGORY_PRODUCTS_AND_SERVICES']
}));

/* ERRORS (errCode):
 * ERR_NOT_AUTHORIZED - You are not signed in or session is expired. You can change session live time at server.js:25
 * ERR_BAD_INPUT - Input you provided was not passed server rules. "key" holds a name of key with bad input value.
 * ERR_EXEC_FAILED - After request was sended to Google Adwords API, it got error message. It contains errorString, pathField, trigger of message or UNKNOWN if error message has different structure.
 * */

