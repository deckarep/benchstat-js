initAnalytics();

function initAnalytics(){
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	//ga('create', 'UA-86578-22', 'auto');
	//ga('send', 'pageview');
}

$(function(){
	var emptyInputMsg = "Paste Benchmark data here";
	var emptyOutputMsg = "Benchstat results appear here";
	var formattedEmptyInputMsg = '<span style="color: #777;">'+emptyInputMsg+'</span>';
	var formattedEmptyOutputMsg = '<span style="color: #777;">'+emptyOutputMsg+'</span>';

	// Hides placeholder text
	$('#input').on('focus', function(){
		var val = $(this).text();
		if (!val){
			$(this).html(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}else if (val == emptyInputMsg){
			$(this).html("");
		}
	});

	// Shows placeholder text
	$('#input').on('blur', function(){
		var val = $(this).text();
		if (!val){
			$(this).html(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
	}).blur();

	// Automatically do the conversion
	$('#input').keyup(function(){
		var input = $(this).text();
		if (!input){
			$('#output').html(formattedEmptyOutputMsg);
			return;
		}

		// Create Go struct
		//var output = jsonToGo(input);
		
		// Do Benchstat magic.
		
		// 1. Create default settings, TODO allow tweaking via UI.
		var s = benchstatjs.Settings()
		var output = benchstatjs.Process(s, input);

		// Handle error scenario
		if (output.error) {
			$('#output').html('<span class="clr-red">'+output.error+'</span>');
			var parsedError = output.error.match(/Unexpected token .+ in JSON at position (\d+)/);
			if(parsedError) {
				try { 
					var faultyIndex = parsedError.length == 2 && parsedError[1] && parseInt(parsedError[1]);
					faultyIndex && $('#output').html(constructJSONErrorHTML(output.error, faultyIndex, input));
				} catch(e) {}
			}
		}else{
			// Do gofmt.
			$('#output').html(output);

			return
			// This does gofmt...which we don't need.
			var finalOutput = output.go;
			if (typeof gofmt === 'function')
				finalOutput = gofmt(output.go);
			var coloredOutput = hljs.highlight("go", finalOutput);
			$('#output').html(coloredOutput.value);
		}
	});

	// Highlights the output for the user
	$('#output').click(function(){
		if (document.selection){
			var range = document.body.createTextRange();
			range.moveToElementText(this);
			range.select();
		}else if (window.getSelection){
			var range = document.createRange();
			range.selectNode(this);
			var sel = window.getSelection();
			sel.removeAllRanges(); // required as of Chrome 60: https://www.chromestatus.com/features/6680566019653632
			sel.addRange(range);
		}
	});

	// Fill in sample Benchmark if the user wants to see an example
	$('#sample1').click(function(){
		$('#input').text(sampleBenchmark).keyup();
	});

	var dark = false;
	$("#dark").click(function(){
		if(!dark){
			$("head").append("<link rel='stylesheet' href='resources/css/dark.css' id='dark-css'>");
			$("#dark").html("light mode");
		} else{
			$("#dark-css").remove();
			$("#dark").html("dark mode");
		}
		dark = !dark;
	});
});

function constructJSONErrorHTML(rawErrorMessage, errorIndex, json) {
	var errorHeading = '<p><span class="clr-red">'+ rawErrorMessage +'</span><p>';
	var markedPart = '<span class="json-go-faulty-char">' + json[errorIndex] + '</span>';
	var markedJsonString = [json.slice(0, errorIndex), markedPart, json.slice(errorIndex+1)].join('');
	var jsonStringLines = markedJsonString.split(/\n/);
	for(var i = 0; i < jsonStringLines.length; i++) {

		if(jsonStringLines[i].indexOf('<span class="json-go-faulty-char">') > -1)  // faulty line
			var wrappedLine = '<div class="faulty-line">' + jsonStringLines[i] + '</div>';
		else 
			var wrappedLine = '<div>' + jsonStringLines[i] + '</div>';

		jsonStringLines[i] = wrappedLine;
	}
	return (errorHeading + jsonStringLines.join(''));
}

// Stringifies JSON in the preferred manner
function stringify(json)
{
	return JSON.stringify(json, null, "\t");
}


// From the SmartyStreets API
var sampleBenchmark = `BenchmarkGobEncode   	100	  13552735 ns/op	  56.63 MB/s
BenchmarkJSONEncode  	 50	  32395067 ns/op	  59.90 MB/s
BenchmarkGobEncode   	100	  13553943 ns/op	  56.63 MB/s
BenchmarkJSONEncode  	 50	  32334214 ns/op	  60.01 MB/s
BenchmarkGobEncode   	100	  13606356 ns/op	  56.41 MB/s
BenchmarkJSONEncode  	 50	  31992891 ns/op	  60.65 MB/s
BenchmarkGobEncode   	100	  13683198 ns/op	  56.09 MB/s
BenchmarkJSONEncode  	 50	  31735022 ns/op	  61.15 MB/s
`;