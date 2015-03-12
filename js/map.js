var settings = {
	encodeOpacity:false, 
	encodeWidth:true, 
	defaultOpacity:.5,
	defaultWidth:3,
	opacityRange:[.01, .1], 
	widthRange:[1,20],
	showMap:false, 
	dataFile:'data/data_by_hour.csv',
	color:'blue', 
	backgroundColor:'black', 
	interval:4000, 
	disappear:false,
	disappearTime:6000,
}
var data,map,widthScale, opacityScale, routes;
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
	drawLinesByHour()

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
	console.log('draw lines with ', dat)
	dat.map(function(d,i){
		if(i>1000) return
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
	// d3.range(0,25).map(function(d){
		// var dat = data.filter(function(dd) {return Number(dd.hour) == Number(hour)})

	// })
}
var test
var animateLine = function(dat, index) {
	var opacity = settings.encodeOpacity == true ? opacityScale(Number(dat.freq)) : settings.defaultOpacity
	var weight = settings.encodeWidth == true ? widthScale(Number(dat.freq)) : settings.defaultWidth
	var polyline = L.polyline([], {weight:weight, opacity:1, color:settings.color}).addTo(map);
	var pointsAdded = 1
	var txt = data[index].route
	if(txt.slice(-1)==",")txt = txt.substring(0, txt.length - 1);
	var pointList = JSON.parse("[" + txt +"]")
	test = pointList
	var delay = 10
	var increment = Math.ceil(pointList.length/settings.interval)*delay
	// console.log(' length ', pointList.length, 'increment ', increment, ' delay ', delay)
	var add = function() {
		var latLongData =  pointList.slice(0, pointsAdded).map(function(d){return L.latLng(d)})
		polyline.setLatLngs(
	        latLongData
		)
		pointsAdded = pointsAdded + increment > pointList.length ? pointList.length :  pointsAdded + increment 
		if (pointsAdded < pointList.length) window.setTimeout(add, delay);
		else {
			polyline.setStyle({opacity:.1})
			if(settings.disappear == true) window.setTimeout(function() {map.removeLayer(polyline)}, settings.disappearTime)
		}
	}
	add()
}
