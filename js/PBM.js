/*
		PBM.js by Benjamin Baedorf
		www.benjaminbaedorf.com
*/
(function(){
	'use strict';

	var config = {
		useIMGClass: true, //Boolean imgclass
		class: '', // String class
		useIMGId: true, // Boolean imgid
		autorun: true, //Boolean Autorun
		observe: true, //Boolean Observe
		observeContainer: document,
		alwaysRender: true //ignores corrupt pixels by rendering them white instead of throwing an error
	};

	var timeout,
		imageData = {};

	var hardWareGlitch = document.createElement("div");
	hardWareGlitch.setAttribute("style", "transform: translateZ(0);");
	document.getElementsByTagName("body")[0].appendChild(hardWareGlitch);


	function sendRequest(url,callback,postData) {
		var req = createXMLHTTPObject();
		if (!req) return;
		var method = (postData) ? "POST" : "GET";
		req.open(method,url,true);
		if (postData)
			req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		req.onreadystatechange = function () {
			if (req.readyState != 4) return;
			if (req.status != 200 && req.status != 304) {
				console.log('HTTP error ' + req.status);
				return;
			}
			callback(req);
		}
		if (req.readyState == 4) return;
		req.send(postData);
	}

	var XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var i=0;i<XMLHttpFactories.length;i++) {
			try {
				xmlhttp = XMLHttpFactories[i]();
			}
			catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	}




	var checkIfPBM = function(mutations){
		if(!mutations){return;}

		//check if a mutation is an image
		var imgs = []
		mutations.forEach(function(mutation, index, array){
			var l = mutation.addedNodes.length;
			for(var i=0; i<l; i++){
				var node = mutation.addedNodes[i];
				if(node.tagName==="IMG"){
					imgs.push(node);
				}
			}
		});

		//for each image, check if the source is a PBM
		imgs.forEach(function(img, index, array){
			var x = new XMLHttpRequest();
			sendRequest(img.src, function(req){
				switch(req.getResponseHeader("Content-Type")){
					case 'image/x-portable-bitmap':
						var type="P1";
					break;
					case 'image/x-portable-graymap':
						var type="P2";
					break;
					case 'image/x-portable-pixmap':
						var type="P3";
					break;
				}
				if(type!==undefined){
						render(req.responseText, img, type);
				}
			});
		});
	}

	var render = function(pbm, target, type)	{
		//remove comments
		pbm = pbm.replace(/^#.*$/gmi,"").replace(/^\s+/,"");
		
		var i=1;

		//slice all non-pixel data off
		if(type==='P1'){
			//convert all whitespace to a single space
			var hwdata = pbm.replace(/\s+/g, " ");

			//convert the file into an array
			hwdata = hwdata.split(" ");
			
			var w = hwdata[i++];
			var h = hwdata[i++];

			//fallback for P1 matrixes without whitespace
			pbm = hwdata.slice(i).join("").split("").map(function(val){
				return parseInt(val);
			});
		}
		else
		{
			//convert all whitespace to a single space
			pbm = pbm.replace(/\s+/g, " ");

			//convert the file into an array
			pbm = pbm.split(" ").map(function(val){
				return parseInt(val);
			});

			var w = pbm[i++];
			var h = pbm[i++];
			var maxVal = pbm[i++];
			pbm = pbm.slice(i);
		}

		//create the canvas element
		var canvas = document.createElement('canvas');

		//set ID
		if(typeof(config.imgid)==='string'){
			canvas.setAttribute('id', config.imgid);
		}
		else if(config.imgid===true){
			canvas.setAttribute('id', target.getAttribute("id"));
		}

		//set Class
		if(typeof(config.class)==='string'){
			canvas.setAttribute('class', config.class);
		}
		if(config.takeIMGClass===true&&target.hasAttribute('class')){
			canvas.setAttribute('class', target.getAttribute("class")+' '+canvas.getAttribute('class'));
		}

		var title = typeof(target.getAttribute("title"))==="string" ? target.getAttribute("title") : "";
		if(title){canvas.setAttribute('title', title);}

		var parent = target.parentNode;

		var cw = target.clientWidth === 0 ? w : target.clientWidth;
		var ch = target.clientHeight === 0 ? h : target.clientHeight;
		canvas.setAttribute('width', w);
		canvas.setAttribute('height', h);

		var ctx = canvas.getContext('2d');
		imageData[target.src] = ctx.createImageData(w,h);
		
		target.style.display = "none";
		parent.insertBefore(canvas, target);

		//declare the method to render the pixel depending on the version
		switch(type){
			case 'P1':
				var getNextPixel = function(c){
					if(pbm[c]===0){
						var colour = [255,255,255];
					}
					else if(pbm[c]===1){
						var colour = [0,0,0];
					}
					else{
						if(config.alwaysRender){
							var colour = [255,255,255];
						}
						else{
							throw "Exception: Image corrupted: pixel index: "+c+", value: "+pbm[c];
						}
					}
					c++;
					return {index: c, colour: colour, pixelnr: c};
				}
			break;
			case 'P2':
				var getNextPixel = function(c){
					try{
						var val = pbm[c];
						val = val/maxVal*255;
					}
					catch(e){
						if(config.alwaysRender){
							var val = 255;
						}
						else{
							throw "Exception: Image corrupted: pixel index: "+c+", value: "+pbm[c];
						}
					}
					c++
					return {index: c, colour: [val,val,val], pixelnr: c};
				}
			break;
			case 'P3':
				var getNextPixel = function(c){
					try{
						var valr = pbm[c];
						valr = valr/maxVal*255;

						var valg = pbm[c+1];
						valg = valg/maxVal*255;

						var valb = pbm[c+2];
						valb = valb/maxVal*255;
					}
					catch(e){
						if(config.alwaysRender){
							var valr = 255;
							var valg = 255;
							var valb = 255;
						}
						else{
							throw "Exception: Image corrupted: pixel index: "+((c)/3);
						}
					}
					c = c+3;
					return {index: c, colour: [valr,valg,valb], pixelnr: (c)/3};
				}
			break;
		}

		//render the pixels to the canvas
		var c = 0,
			succeeded = true,
			data = [],
			pixelRounds = pbm.length,
			imageRounds = 0,
			roundsPerIteration = 0;
		function getPixelColours(img){
			for(var i=0;i<pixelRounds;i++){
				try{
					var px = getNextPixel(c);
					data.push(px);
					c = px.index;
				}
				catch(e){ //The image is corrupted and alwaysRender is not enabled. Skip this image and continue to the next one. 
					console.log(e);
					c = rounds;
					succeeded = false;
				}
			}
			if(succeeded){
				//render the canvas to the dom, but only if there were no errors.
				c = 0;
				imageRounds = px.pixelnr;
				timeout = setTimeout(function(){writeColoursToImage(img)}, 0);
			}
		}

		function writeColoursToImage(img){
			var idata = imageData[img.src];
			for(var i=0;i<imageRounds;i++){
				var datac = data[c].colour;
				var d = c*4
				idata.data[d] = datac[0];
				idata.data[d+1] = datac[1];
				idata.data[d+2] = datac[2];
				idata.data[d+3] = 255;
				c++;
			}
			//Render image to canvas
			ctx.putImageData(imageData[img.src], 0, 0 );
			ctx.scale(canvas.clientWidth/w, canvas.clientHeight/h);
			parent.removeChild(target);
			//Clean up after ourselves
			imageData[img.src] = null;
		}

		//Ensure js doesn't block the page rendering
		timeout = setTimeout(function(){getPixelColours(target)}, 0);

	}

	if(config.autorun){
		checkIfPBM([{addedNodes:config.observeContainer.getElementsByTagName('img')}]);
	}

	if(config.observe){
		//start observing the dom for mutations
		MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var observer = new MutationObserver(function(mutations, observer) {
		    checkIfPBM(mutations);
		});
		observer.observe(config.observeContainer, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['src']
		});
	}
})();