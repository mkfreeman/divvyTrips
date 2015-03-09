var settings = {
	encodeOpacity:false, 
	encodeWidth:true, 
	defaultOpacity:.5,
	defaultWidth:3,
	opacityRange:[.01, .1], 
	widthRange:[1,20],
	showMap:false, 
	dataFile:'data/data_Monday.csv',
	// color:'rgb(9, 240, 232)'
	color:'blue', 
	backgroundColor:'white'
}
var data,map,widthScale, opacityScale, routes;
var drawMap = function () {
	d3.select('#map').style('background-color', settings.backgroundColor)
	var center =  [41.88515423727906, -87.65544891357422]
	var zoom = 12
	L.mapbox.accessToken = 'pk.eyJ1IjoibWljaGFlbGZyZWVtYW4iLCJhIjoibE5leG9MRSJ9.YHTl3OfWurGattFSUzwhag';
	
	var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/michaelfreeman.lc5jblfh/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
	});

	map = L.map('map').setView(center, zoom);

	if(settings.showMap == true) map.addLayer(mapboxTiles)
	   

	getScale()
	drawLines()

}


var getData = function(callback) {
	// getRoutes(
		d3.csv(settings.dataFile, function(error, dat){
			data = dat
			if(typeof callback == 'function') callback()
		})
	// )
}

// var getRoutes = function(callback) {
// 	console.log('get routes')
// 	d3.csv('data/formatted_routes.csv', function(error, dat){
// 		routes = dat
// 		if(typeof callback == 'function') callback()
// 	})
// }

var getScale = function() {
	var max = d3.max(data, function(d) {return Number(d.freq)})
	widthScale = d3.scale.linear().range(settings.widthRange).domain([1,max])
	opacityScale = d3.scale.linear().range(settings.opacityRange).domain([1,max])
}

var drawLines = function() {
	// var mapData = data.filter(function(d){return d.month == 1})
	data.map(function(d,i){
		if(i>1000) return
		// var opacity = settings.encodeOpacity == true ? opacityScale(Number(d.freq)) : settings.defaultOpacity
		// var weight = settings.encodeWidth == true ? widthScale(Number(d.freq)) : settings.defaultWidth
		// var txt = data[i].route
		// if(txt.slice(-1)==",")txt = txt.substring(0, txt.length - 1);
		// var pointList = JSON.parse("[" + txt +"]")
		// var polygon = L.polyline(pointList, {weight:weight, opacity:opacity, color:'gray'}).addTo(map);
		animateLine(d,i)
	})	
}

var animateLine = function(dat, index) {
	var opacity = settings.encodeOpacity == true ? opacityScale(Number(dat.freq)) : settings.defaultOpacity
	var weight = settings.encodeWidth == true ? widthScale(Number(dat.freq)) : settings.defaultWidth
	var polyline = L.polyline([], {weight:weight, opacity:opacity, color:'gray'}).addTo(map);
	var pointsAdded = 0
	var txt = data[index].route
	if(txt.slice(-1)==",")txt = txt.substring(0, txt.length - 1);
	var pointList = JSON.parse("[" + txt +"]")
	var increment = 10
	var add = function() {
		// console.log('add function ', pointsAdded)
		polyline.addLatLng(
	        L.latLng(
	            pointList[pointsAdded],
	            pointsAdded)
	        )
		// var pointsAdded = pointsAdded + increment >= pointList.length ? pointList.length - 2 : pointsAdded + increment
		if (++pointsAdded < pointList.length) window.setTimeout(add, .1);
	}
	// console.log(++pointsAdded, pointList.length)
	add()
	// if (++pointsAdded < pointList.length) window.setTimeout(add, 10);
}
// var getSum = function() {
// 	var ret = {}
// 	data.map(function(d){
// 		if(ret[d.stationFromId] == undefined) ret[d.stationFromId] = Number(d.freq)
// 		else ret[d.stationFromId] += Number(d.freq)
// 	})
// 	return ret
// }
// var drawPoints = function() {
// 	var points = getSum()
// 	var circleMax = d3.max(d3.values(points), function(d) {return d.freq})
// 	var circleScale = d3.scale.squared().range([1,10]).domain([1,circleMax])
// 	d3.values(points).map(function(d) {
// 		var point = L.polyline(pointList, {weight:weight, opacity:opacity, color:'gray'}).addTo(map);
// 	})
// }