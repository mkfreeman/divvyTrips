// To do
/*
	- Add stations?
	- Date selector?
	- Put on chloropleth poverty map?
*/
var data,map,widthScale, opacityScale, routes;
var lines = {}
var drawMap = function () {
	var height = $('#container').innerHeight()*.9
	d3.select('#' + settings.container).append('div').attr('id', settings.id).style('height', height + 'px')
	d3.select('#map').style('background-color', settings.backgroundColor)
	d3.select('body').style('background-color', settings.backgroundColor)

	L.mapbox.accessToken = 'pk.eyJ1IjoibWljaGFlbGZyZWVtYW4iLCJhIjoibE5leG9MRSJ9.YHTl3OfWurGattFSUzwhag';
	
	var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/michaelfreeman.lc5jblfh/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
	});

	map = L.map('map', {
	    center: settings.center,
	    zoom: settings.zoom,
	})

	var controls = {'Show map': mapboxTiles}
	L.control.layers({},controls).addTo(map);
	if(settings.showMap == true) {
		map.addLayer(mapboxTiles)	
	}
	drawLinesByMinute()

}


var getData = function(callback) {
		d3.csv(settings.dataFile, function(error, dat){
			data = dat
			if(typeof callback == 'function') callback()
		})
}



var drawLinesByMinute= function() {
	var totalMinutes = settings.totalMinutes
	var minute = settings.startMinute
	console.log(totalMinutes, minute)
	var startDrawing = function() {
		data.filter(function(dd) {return Number(dd.startMinute) == Number(minute)}).map(function(d) {animateLine(d)})
		clock.setMinute(minute)
		minute += 1
		if (minute < totalMinutes) {
			window.setTimeout(startDrawing, 1*settings.timeFactor)
		}
	}
	window.setTimeout(startDrawing, 500)
}

var animateLine = function(dat, index) {
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
			if(settings.disappear == true) window.setTimeout(function() {
				polyline.setStyle({opacity:.05})
				window.setTimeout(function() {map.removeLayer(polyline)}, 100)
			}, settings.disappearTime)
		}
	}
	add()
}
