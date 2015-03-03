var data,map,widthScale, opacityScale;
var drawMap = function () {
	var center =  [41.88515423727906, -87.65544891357422]
	var zoom = 12.5
	L.mapbox.accessToken = 'pk.eyJ1IjoibWljaGFlbGZyZWVtYW4iLCJhIjoibE5leG9MRSJ9.YHTl3OfWurGattFSUzwhag';
	
	var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/michaelfreeman.lc5jblfh/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
	});

	map = L.map('map')
		// .addLayer(mapboxTiles)
	    .setView(center, zoom);
	getScale()
	drawLines()

}


var getData = function(callback) {
	d3.csv('data/test_data.csv', function(error, dat){
		data = dat
		if(typeof callback == 'function') callback()
	})
}

var getScale = function() {
	var max = d3.max(data, function(d) {return Number(d.freq)})
	widthScale = d3.scale.linear().range([1,20]).domain([1,max])
	opacityScale = d3.scale.linear().range([.03,.2]).domain([1,max])
}

var drawLines = function() {
	data.map(function(d,i){
		// var weight = 2
		// var opacity = .03
		var opacity = opacityScale(Number(d.freq))
		var weight = widthScale(Number(d.freq))
		var pointList = JSON.parse("[" + data[i].route +"]")
		var polygon = L.polyline(pointList, {weight:weight, opacity:opacity, color:'gray'}).addTo(map);
	})	
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