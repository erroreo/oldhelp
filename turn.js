    var Turn = require('node-turn');  
	var server = new Turn({  
	  // set options  
	  authMech: 'long-term',  
	  credentials: {  
	    james: "0000"  
	  }  
	});  
	server.start();
