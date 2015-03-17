// To do
/*
	- Add stations?
	- Date selector?
	- Put on chloropleth poverty map?
*/
var data,map,widthScale, opacityScale, routes, timeFactor, stations, stationScale;
var circles = {}
// var lines = {}
var lineGroup = L.layerGroup([]);
var circleGroup = L.layerGroup([]);
stationValues = {}
var drawMap = function () {
	var height = $('#container').innerHeight() - $('#header').height()
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
	lineGroup.addTo(map)
	circleGroup.addTo(map)
	var controls = {'Map': mapboxTiles, 'Riders':lineGroup, 'Stations':circleGroup}
	L.control.layers({},controls).addTo(map);
	if(settings.showMap == true) {
		map.addLayer(mapboxTiles)	
	}
	
	d3.select('#label-left').append('text').text('Chicago')
	d3.select('#label-middle').append('text').text('bikers')
	d3.select('#label-right').append('text').text('(6/28/2014)')
	window.setTimeout(function() {d3.select('#label').transition().duration(2000).style('opacity', 0).each('end', function() {drawLinesByMinute()})}, 2000)
	if(settings.drawStations == true) drawStations()
}

// Get stations
var getStations = function(callback) {
	d3.csv(settings.stationFile, function(error, dat){
		stations = dat
		if(typeof callback == 'function') callback()
	})
}

var getData = function(callback) {
	if(settings.dataSource == 'database') {
		$.ajax({
			url:'php/getData.php',
			type: "get",
			data:{
				  date:settings.date,
			}, 
			success:function(dat) {
				data = dat.data
				if(typeof(callback) == 'function') callback()
			}, 
			error:function(){
				console.log('error')
			},
			dataType:"json"
		})
	}
	else {
		d3.csv(settings.dataFile, function(error, dat){
			data = dat
			if(typeof callback == 'function') callback()
		})
	}
}

var getStationValues = function() {
	
	data.map(function(d) {
		var station = d.id.split('-')[1]
		if(stationValues[station] == undefined) stationValues[station] = 1
		else stationValues[station] += 1
	})
	var max = d3.max(d3.keys(stationValues), function(d) {return stationValues[d]})
	var min = d3.min(d3.keys(stationValues), function(d) {return stationValues[d]})
	stationScale = d3.scale.sqrt().range([settings.minRadius, settings.maxRadius]).domain([min,max])
}

var drawStations = function() {
	getStationValues()
	stations.map(function(d){
		var val = stationValues[d.id]
		if(val == undefined) return
		var size = settings.sizeStations == true ? stationScale(val):settings.defaultRadius
		var size = 1
		var text = '<b>' + d.name + ':</b> ' + val + ' riders'
		circles[d.id] = L.circle([d.latitude, d.longitude], size, {
		    color: 'black',
		    stroke:false,
		    weight:1,
		    fillColor: 'gray',
		    fillOpacity: .3, 
		    opacity:.3
		}).bindPopup(text).addTo(circleGroup);	
	})
	
}

// var getRoutes = function(callback) {
// 	d3.csv(settings.routeFile, function(error, dat){
// 		routes = dat
// 		if(typeof callback == 'function') callback()
// 	})
// }

var drawLinesByMinute= function() {
	var totalMinutes = settings.totalMinutes
	var minute = settings.startMinute
	timeFactor = settings.timeFactor
	settings.stopDrawing = false
	var startDrawing = function() {
		if(settings.stopDrawing == true) return
		data.filter(function(dd) {return Number(dd.startMinute) == Number(minute)}).map(function(d) {animateLine(d)})
		clock.setMinute(minute)
		minute += 1
		if(settings.speedUp == true) {
			if(timeFactor > settings.maxSpeed) timeFactor += settings.speedChange
		}
		if (minute < totalMinutes) {
			window.setTimeout(startDrawing, 1*timeFactor)
		}
	}
	window.setTimeout(startDrawing, 500)
}
var test;
var animateLine = function(dat, index) {
	test = dat;
	var opacity = settings.encodeOpacity == true ? opacityScale(Number(dat.freq)) : settings.defaultOpacity
	var weight = settings.encodeWidth == true ? widthScale(Number(dat.freq)) : settings.defaultWidth
	var polyline = L.polyline([], {weight:weight, opacity:settings.defaultOpacity, color:settings.color}).addTo(lineGroup);
	var txt = dat.route
	if(txt.slice(-1)==",")txt = txt.substring(0, txt.length - 1);
	if(txt.slice(-1)!="]")txt = txt + ']'
	var pointList = JSON.parse("[" + txt +"]")
	var points = pointList.length
	var time = (dat.stopMinute - dat.startMinute )*timeFactor
	var strokes = time >= points ? points : time
	var length = Math.ceil(points/time)
	var pointsAdded = length
	var delay = time<points ? 1 : Math.floor((time - points) / points)
	var add = function() {
		var latLongData =  pointList.slice(0, pointsAdded).map(function(d){return L.latLng(d)})
		polyline.setLatLngs(
	        latLongData
		)
		pointsAdded = pointsAdded + length > points ? points :  pointsAdded + length 
		if (pointsAdded < points ) window.setTimeout(add, delay);
		else {
			polyline.setStyle({opacity:settings.finalOpacity})
			if(settings.disappear == true) {
				// window.setTimeout(function() {map.removeLayer(polyline)}, settings.disappearTime)
				map.removeLayer(polyline)
			}
			if(settings.growCircles == true) {
				var id = dat.id.split('-')[1]
				var rad = circles[id].getRadius()
				var increment = rad > 200 ? 20 : 100
				// console.log('station ', id, ' rad ', rad)
				circles[id].setRadius(rad + increment)
			}
		}
	}
	add()
}
