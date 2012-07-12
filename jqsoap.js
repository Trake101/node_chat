/*********************************************************************
jQuery.jSOAPClient 
@version: 0.2
@author: Alexandre Almeida Ferreira (alexandrealmeidaferreira@ibest.com.br)
@desc: A Simple Soap Client for JavaScript
@usage:

jQuery.jSOAPClient.consume(URL_WEBSERVICE, URN_WEBSERVICE, METHOD_WEBSERVICE, JSON_DATA, SUCCESS_FUNCTION, ERROR_FUNCTION);

OR

jQuery.jSOAPClient.setLocation(URL_WEBSERVICE);
jQuery.jSOAPClient.setUrn(URN_WEBSERVICE);
jQuery.jSOAPClient.setSuccess(function(data){
	//MY RESULT
	$('#result').html(data);
});
jQuery.jSOAPClient.setError(function(data){
	//OOPS
	$('#result').html('error : '+data);
});
jQuery.jSOAPClient.call(METHOD_WEBSERVICE, JSON_DATA);

1) EXAMPLE 1
mydata = '{"data":[{"type":"xsd:string", "value":"HELLO WORLD!"}, {"type":"xsd:string", "value":"SECOND PARAMETER OF MY WEBSERVICE"}]}'
jQuery.jSOAPClient.consume('http://localhost/webservice/index.php', 'MYWBS.webservice', 'service', mydata, 
	function(data){ //success
		$('#result').html(data);
	},
	function(data){ //error
		$('#result').html("error : "+data);
	}
);

2) EXAMPLE 2
jQuery.jSOAPClient.setLocation('http://localhost/ws/index.php');
jQuery.jSOAPClient.setUrn('MYWBS.webservice');
jQuery.jSOAPClient.setSuccess(function(data){
	$('#result').html(data);
});

jQuery.jSOAPClient.setError(function(data){
	$('#result').html('error : '+data);
});
jQuery.jSOAPClient.call('service', mydata);

*********************************************************************/


(function($) {
	jQuery.jSOAPClient = Object();
	jQuery.jSOAPClient.location = "http://localhost/webservice/",
	jQuery.jSOAPClient.urn = "http://localhost/webservice/",
	jQuery.jSOAPClient.success = function(data){},
	jQuery.jSOAPClient.error = function(data){},
	jQuery.jSOAPClient.setLocation = function(location){
		this.location = location;
	},
	jQuery.jSOAPClient.setUrn = function(urn){
		this.urn = urn;
	},
	jQuery.jSOAPClient.setSuccess = function(success){
		this.success = success;
	},
	jQuery.jSOAPClient.setError = function(error){
		this.error = error;
	},
	jQuery.jSOAPClient.call = function(method, data){
		d = jQuery.parseJSON(data);
		sm  = '<?xml version="1.0" encoding="UTF-8"?>';
		sm += '<SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" ';
		sm += 'xmlns:tns="urn:'+this.urn+'">';
		sm += '<SOAP-ENV:Body>';
		sm += '<tns:'+method+' xmlns:tns="urn:'+this.urn+'">';
		jQuery.each(d.data, function(){
			sm += '<'+method+' xsi:type="'+this.type+'">'+this.value+'</'+method+'>';
		});
		sm += '</tns:'+method+'>';
		sm += '</SOAP-ENV:Body>';
		sm += '</SOAP-ENV:Envelope>';
		jQuery.ajax({
				url: this.location,
				type: 'POST',
				data: sm,
				contentType: "text/xml",
				crossDomain: true,
				dataType: "text",
				success: jQuery.jSOAPClient.success,
				error: jQuery.jSOAPClient.error
		});
	},
	jQuery.jSOAPClient.consume = function(location, urn, method, data, success, error){
		this.setLocation(location);
		this.setUrn(urn);
		this.setSuccess(success);
		this.setError(error);
		this.call(method, data);
	};
})(jQuery);
