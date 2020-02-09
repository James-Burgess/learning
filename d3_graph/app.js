/*******************************************************************************
Author: James Burgess
Project: Canary Console
Version: 0.1

Known Issues:
	- Bar Colors only rendered in chrome and safari (Line: 260)
				- intToARGB() works but
				- d3 doesnt add a fill property from a function?
	- Arrow keys dont work in edge
	- Sizing issues when height of viewport is small
	- Numbers overflow on yAxis when over 3 digits

Todo: - 
 - month view
 - year view
 - change acknowledged state on click
 - update update to take in a data filter
 - filter out data for the week to save computes

*******************************************************************************/

var getAlerts = function(alerts){
	/**
	 * Calculates unakcnowledged threats and makes banner.
	 * @param {Object} alerts
	 * @return Threat Banner
	 */

	var count = 0;

	//find unacknowledged
	alerts.forEach(function(d){
		if (d.acknowledged == "False"){
			count ++;
		}
	});

	//display unseen threats
	if (count > 0 ){
	d3.select(".threatbox")
		.classed("active alert",true)
		.append("h3")
		.text("There are " + count + " new threats!");
	}
	else{
		d3.select(".threatbox")
		.classed("active safe",true)
		.append("h3")
		.text("There are no new threats");
	};

	//display total threat count
	d3.select("main")
		.append("h3")
		.attr("class","tcount")
		.text("" + alerts.length + " total threats dectected");
};

var makeFilters = function(data){
	/**
	 * find filters and append to doc
	 * @param {Object} data
	 * @return Filter Buttons
	 */

	//get canarys and append
	var buttonLength = data.device_list.length;
	for (var i = 0; i < buttonLength; i++) {
    	d3.select(".btn")
		    .append('button')
		    .text([data.device_list[i].description]);
    };

    //add all option if more than one canary
    if (buttonLength > 1){
    	d3.select(".btn")
			.append('button')
			.classed("active",true)
			.text("All");
	};

	//Get threat types and append
	var threats = [];
	data.alerts.forEach(function(d){
		if (threats.indexOf(d.description) == -1){
			threats.push(d.description)
			d3.select('.threatType')
			.append("button")
			.text(d.description)
		};
	});	
};

var getData = function (alerts, jumpBack) {
	/**
	 * collect data for current week view
	 * @param {Object} alerts
	 * @param {int} jumpBack
	 * @return {object} dayData
	 */	

	//get current time
	var currentTime = new Date()
		//this is changed to load on the first event in the json
		currentTimeSeconds = 1460104131, //Math.round((currentTime) / 1000),
		weekInSeconds = 604800,
		dayInSeconds = 86400,
		currentTimeSeconds = currentTimeSeconds-(jumpBack*dayInSeconds),
		lastWeek = currentTimeSeconds - weekInSeconds, 
		formatTime = d3.timeFormat("%a %d %b"),
		dayData = {};

	//TODO - filter out data for the week to save computes

	//iterate through each day of the week
	for (var x = currentTimeSeconds; x > lastWeek; x-=dayInSeconds){
		//format day to something d3 can understand
		var thisDay = new Date();
		thisDay.setTime(x*1000);
		thisDay.toUTCString();
		thisDay.getDay(); 
		thisDay = formatTime(thisDay);

		//append date to each day as key
		dayData[thisDay] = [];
		var y0 = 0;
		
		//find events that match each day and add to day data obj
		alerts.forEach(function(d){
			var age = +d.created
			if (x > age && age > x-dayInSeconds){
				dayData[thisDay].push({x:thisDay, y:+d.events_count, y0:y0, ip:d.src_host, key:d.key});
				y0 += +d.events_count
			};
		});
	};
	return(dayData);
};

var intToARGB = function (ip) {
	/**
	 * turns any ip address into a random color code
	 * defaults to black if null
	 * @param {string} ip
	 * @return {string} hex
	 */	

	//convert ip to number
	var i = ip.split('.').join("");

	//convert number to hex
    var	hex = ((i>>24)&0xFF).toString(16) +
            ((i>>16)&0xFF).toString(16) +
            ((i>>8)&0xFF).toString(16) +
            (i&0xFF).toString(16);
    hex += '000000';
    return hex.substring(0, 6);
};

var getMax = function(data){
	/**
	 * Max Day Value Extraxction	
	 * @param {Array} data
	 * @return {int} maxDay
	 */	

	var maxDay = 9, //default yAxisHeight
		dayMax = 0; 

	//get last element in each array and calc y+y0
	for(var x in data){
		if (data[x].length > 0){
			dayMax = data[x][data[x].length-1].y0 + data[x][data[x].length-1].y
		};
		if(dayMax > maxDay){maxDay = dayMax};
	};
	return(maxDay+(maxDay*.1));
}

var drawGrap = function(dayData){
	/**
	 * draws the svg graph	
	 * @param {Object} Daydata
	 * @return {svg} Graph
	 */	

	//svg size vars
	var margin = {top: 20, right: 40, bottom: 30, left: 20},
	width = 1000 - margin.left - margin.right,
	height = 650 - margin.top - margin.bottom,
	barWidth = Math.floor(width / 10) - 1;

	//sort data into something d3 understands
	var intermediateData = [];
	for(var key in dayData){
		intermediateData.push(dayData[key])
	};

	//make list of days from keys
	var dayList = Object.keys(dayData).reverse();

	//append title showing which view 
	var title = d3.select(".titleBar")
		.append("h3")
	    .attr("class", "title")
	    .text("Incidents From " + dayList[dayList.length-1].substring(0,7) + " - " + dayList[0]);

	//draw svg container
	var svg = d3.select(".graph").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g");

	//set x and y scale
	var xScale = d3.scaleBand()
		.domain(Object.keys(dayData).reverse())
		.rangeRound([0, width*.91]);

	//set y scale
	var yScale = d3.scaleLinear()
		.domain([0,getMax(intermediateData)])
		.range([height, 0]);

	//set xaxis ticks
	var xAxis = d3.axisBottom(xScale)
		.ticks(0);

	//draw x axis
	svg.append("g")
		.attr("transform", "translate(70,615)")
		.attr("class", "xAxis")
		.call(xAxis);

	//set yaxis ticks
	var yAxis = d3.axisRight(yScale)
    	.ticks(10)
    	.tickPadding(15)
    	.tickSize(-width*.9);

	//draw y axis
	svg.append("g")
	.attr( "transform", "translate("+(width+10)+",10)")
	.attr("class", "yAxis")
	.call(yAxis);		

	//create columns for each day
	var layer = svg.selectAll(".stack")
        .data(intermediateData)
        .enter().append("g")
        .attr("class", "stack")
        .attr("transform", "translate(90,11)");

    //draw rects for layers
	layer.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return xScale(d.x);
        })
        .attr("y", function (d) {
            return yScale(d.y + d.y0);
        })
        .attr("height", function (d) {
            return yScale(d.y0) - yScale(d.y + d.y0);
        })
        .attr("width", barWidth)
        .style("fill", function (d) {
        	return(intToARGB(d.ip)); // not working in firefox
       	})
        .style("stroke", "white");
        
    //tooltips kinda
    layer.selectAll("rect")
        .on("mouseover", function(d) {
        	d3.select("svg")
        	.append("text")
        	.attr("class", "tooltip")
        	.attr("transform", "translate(150, 30)")
        	.attr("fill", "darkgrey")
        	.text("key: " + d.key)
	    })
     	.on("mouseout", function(d) {
 			d3.select(".tooltip").remove()
       	});

     //TODO - change acknowledged state on click
};


window.onload = function(){
	/**
	 * Fires on window load	
	 */

	//better than pasting in the JSON
	var url = 'https://raw.githubusercontent.com/James-Burgess/studious-goggles/master/input.json';

	d3.json(url, function (e, data){
		/**
		 * loads JSON and calls main functions	
		 * @param {Object} data
		 * @param {string} e
		 */	

		 //error handling
		 if (e){	
			console.log("Oh no! load error: ", e);
			d3.select(".graph h3").remove();
			d3.select(".graph")
				.append("h3")
				.text("Oh no! load error: " + e)
		}

		//save valuable typing time here ;)
		var alerts = data.alerts

		var init = function(){
			/**
			 * lets start her up and see how she chooches	
			 */	

			//add alerts and filter buttons
			getAlerts(alerts);
			makeFilters(data);

			//get dataset and use it to draw graph
			var graphData = getData(alerts, 0);
			drawGrap(graphData);

			//remove loading splash
			d3.select(".graph h3").remove();

			//focous on window
			window.focus();
		};

		var update = function(jumpBack){
			/**
			 * redraws graph when we click a button	
			 * @param {int} jumpBack
			 * @return {null} new Graph
			 */	

			//clean the slate
			d3.select("svg").remove();//graph
			d3.select(".title").remove();//title

			//add new graph
			var graphData = getData(alerts, jumpBack)
			drawGrap(graphData);

			//focous on window
			window.focus();
		};

		var watchButtons = function (){
			/**
			 * all the event listners live here
			 */	

			//////////////////
			//Filter Section//
			//////////////////

			//filter buttons
			var canaryButtons = document.querySelectorAll(".btn button"),
				threatButtons = document.querySelectorAll(".threatType button");

			//
			var clickCall = function(){
				/**
				 * removes filtermodal and calls update()
				 */	

				//highlight selected btn and lowlight others
				[].map.call(canaryButtons, function(elem) { elem.classList.remove("active") });
		    	this.classList.add("active");
		    	d3.select(".filters").
				classed("active", false);
				console.log(e.target.textContent)

				//TODO - update update to take in a data filter
		    };

		    //add listeners to canary buttons
			[].map.call(canaryButtons, function(elem) {
	    			elem.addEventListener("click", clickCall, false);
				});

			//add listeners to threat buttons
			[].map.call(threatButtons, function(elem) {
	    			elem.addEventListener("click", clickCall, false);
				});

			//add hamburger
			d3.select("main")
				.append('button')
				.attr("id", "canary")
				.text("⛃")
				.on("click", function(e){
						d3.select(".filters").classed("active", true)
					});

			//add close button
			d3.select(".filters")
				.on("click", function(){
					d3.select(".filters").classed("active", false);
				});

			/////////////////////
			//timeframe section//
			/////////////////////

			//TODO - month view
			//TODO - year view

			// Allow the arrow keys to change the display week.
			var weeksBack = 0;

			//append left arrow
			d3.select(".titleBar")
				.append("button")
				.attr("id", "dayDown")
				.text("➜")
				.on("click", function(){
					weeksBack++;
					update(weeksBack)
				})
				.on("mouseover", function(){
					d3.select("svg")
        				.append("text")
        				.attr("class", "tooltip")
        				.attr("transform", "translate(150, 30)")
        				.attr("fill", "darkgrey")
        				.style("font-size", ".75em")
        				.text("Use the arrow keys for faster navigation")
	    		})
     			.on("mouseout", function(d) {
 					d3.select(".tooltip").remove()
       			});

     		//append right arrow
			d3.select(".titleBar")
				.append("button")
				.attr("id", "dayUp")
				.text("➜")
				.on("click", function(){
					if(weeksBack == 0){weeksBack = 0}
					else{weeksBack--};
					update(weeksBack);
				});

			//wait for keyboard press
			d3.select(window).on("keydown", function() {
				switch (d3.event.keyCode) {
					case 37: 
						weeksBack++  //possibly limit this
					break;
					case 39: 
					if(weeksBack == 0){weeksBack = 0}
						else{weeksBack--}
					break;
				}
				update(weeksBack);
			})
		};

		//The final callers
		console.log("loaded JSON");
		init();
		watchButtons();
	});
}