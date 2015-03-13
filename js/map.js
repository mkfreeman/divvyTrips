// To do
/*
	- Compute scales based on # to and from (not just # by minute)
	- Add hovers?
	- Somehow remove lines that are already there.... or add to them.  
	- Put on chloropleth poverty map?
*/
var totalRiders
var settings = {
	encodeOpacity:false, 
	encodeWidth:false, 
	defaultOpacity:.5,
	finalOpacity:.2,
	defaultWidth:2,
	opacityRange:[.01, .1], 
	widthRange:[1,20],
	showMap:false, 
	dataFile:'data/data_start_stop.csv',
	color:'white', 
	backgroundColor:'black', 
	timeFactor:5,
	interval:10000, 
	disappear:true,
	disappearTime:1000,
}
var data,map,widthScale, opacityScale, routes;
var lines = {}
var drawMap = function () {
	d3.select('#map').style('background-color', settings.backgroundColor)
	d3.select('body').style('background-color', settings.backgroundColor)
	var center =  [41.88515423727906, -87.65544891357422]
	var zoom = 12
	L.mapbox.accessToken = 'pk.eyJ1IjoibWljaGFlbGZyZWVtYW4iLCJhIjoibE5leG9MRSJ9.YHTl3OfWurGattFSUzwhag';
	
	var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/michaelfreeman.lc5jblfh/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
	});

	map = L.map('map').setView(center, zoom);

	if(settings.showMap == true) map.addLayer(mapboxTiles)
	   

	getScale()
	drawLinesByMinute()

}


var getData = function(callback) {
		d3.csv(settings.dataFile, function(error, dat){
			data = dat
			if(typeof callback == 'function') callback()
		})
}


var getScale = function() {
	var max = d3.max(data, function(d) {return Number(d.freq)})
	widthScale = d3.scale.linear().range(settings.widthRange).domain([1,max])
	opacityScale = d3.scale.linear().range(settings.opacityRange).domain([1,max])
}

var drawLines = function(dat) {
	dat.map(function(d,i){
		animateLine(d,i)
	})	
}

var drawLinesByHour= function() {
	var hour = 6
	var startDrawing = function() {
		var dat = data.filter(function(dd) {return Number(dd.hour) == Number(hour)})
		drawLines(dat)
		if (++hour < 24) {
			window.setTimeout(startDrawing, settings.interval)
		}
	}
	window.setTimeout(startDrawing, 500)
}


var drawLinesByMinute= function() {
	var totalMinutes = 60*24
	var minute = 0
	var startDrawing = function() {
		var dat = data.filter(function(dd) {return Number(dd.startMinute) == Number(minute)})
		totalRiders += dat.length
		drawLines(dat)
		minute += 1
		if (minute < totalMinutes) {
			window.setTimeout(startDrawing, 1*settings.timeFactor)
		}
	}
	window.setTimeout(startDrawing, 500)
}

var test
var animateLine = function(dat, index) {
	// console.log(dat)
	var opacity = settings.encodeOpacity == true ? opacityScale(Number(dat.freq)) : settings.defaultOpacity
	var weight = settings.encodeWidth == true ? widthScale(Number(dat.freq)) : settings.defaultWidth
	var polyline = L.polyline([], {weight:weight, opacity:settings.defaultOpacity, color:settings.color}).addTo(map);
	var txt = dat.route
	if(txt.slice(-1)==",")txt = txt.substring(0, txt.length - 1);
	var pointList = JSON.parse("[" + txt +"]")
	var points = pointList.length
	var time = (dat.stopMinute - dat.startMinute )*settings.timeFactor
	var strokes = time >= points ? points : time
	var length = Math.ceil(points/time)
	var pointsAdded = length
	var delay = time<points ? 1 : Math.floor((time - points) / points)
	var add = function() {
		// console.log(' totalPoints ', points,  ' totalTime ', time, ' delay ', delay, ' stroke length ', length, ' current length ', pointsAdded)
		var latLongData =  pointList.slice(0, pointsAdded).map(function(d){return L.latLng(d)})
		polyline.setLatLngs(
	        latLongData
		)
		pointsAdded = pointsAdded + length > points ? points :  pointsAdded + length 
		if (pointsAdded < points ) window.setTimeout(add, delay);
		else {
			polyline.setStyle({opacity:settings.finalOpacity})
			if(settings.disappear == true) window.setTimeout(function() {map.removeLayer(polyline)}, settings.disappearTime)
		}
	}
	add()
}
