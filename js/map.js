// Map drawing file -- should be refactored as an inhereted object
var data,map,widthScale, opacityScale, routes, timeFactor, stations, stationScale, mapboxTiles;
var circles = {}
var lineGroup = L.layerGroup([]);
var circleGroup = L.layerGroup([]);
stationValues = {}
var test;

// Resize height
$(window).resize(function() {setHeight()})

// Height setting function
var setHeight = function() {
	var height = $('#container').innerHeight() - $('#header').height()
	d3.select('#' + self.settings.id).style('height', height + 'px')
}
var drawMap = function () {
	d3.select('#' + settings.container).append('div').attr('id', settings.id)
	d3.select('#map').style('background-color', settings.backgroundColor)
	d3.select('body').style('background-color', settings.backgroundColor)

	setHeight()
	L.mapbox.accessToken = settings.accessToken;
	
	mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/michaelfreeman.lc5jblfh/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
	});


	map = L.map('map', {
	    center: settings.center,
	    zoom: settings.zoom,
	})
	
	if(settings.showMap == true) {
		map.addLayer(mapboxTiles)	
	}
	
	lineGroup.addTo(map)
	circleGroup.addTo(map)
	
	// Write label
	d3.select('#label-left').append('text').text('CHICAGO')
	d3.select('#label-middle').append('text').text('BIKERS')
	d3.select('#label-date').append('text').text('(4/22/2014)')
	window.setTimeout(function() {d3.selectAll('#label, #label-date').transition().duration(2000).style('opacity', 0).each('end', function() {d3.select(this).style('display', 'none');})}, 2000)
	window.setTimeout(function() {drawLinesByMinute()}, 2000)
	if(settings.drawStations == true) drawStations()
}

// Get stations
var getStations = function(callback) {
	d3.json(settings.stationFile, function(error, dat){
		stations = dat.filter(function(d){return d.quarters = 'second'})
		if(typeof callback == 'function') callback()
	})
}

var getData = function(callback) {
	if(settings.data[settings.date] != undefined) {
		data = settings.data[settings.date]
		if(typeof(callback) == 'function') callback()
		return
	}
	$('#loader').show()
// load first one from csv to limit database hits
	if(d3.keys(settings.data).length == 0 ){
		d3.json(settings.dataFile, function(error, dat){
			$('#loader').hide()
			data = settings.data[settings.date] = dat
			if(typeof callback == 'function') callback()
		})
	}
	else {
		$.ajax({
			url:'php/getData.php',
			type: "get",
			data:{
				  date:settings.date,
			}, 
			success:function(dat) {
				$('#loader').hide()
				data = settings.data[settings.date] = dat.data
				if(typeof(callback) == 'function') callback()
			}, 
			error:function(){
				console.log('error')
			},
			dataType:"json"
		})

	}
	
}


var getStationValues = function() {
	
	data.map(function(d) {
		var station = d.id.split('-')[1]
		if(stationValues[station] == undefined) stationValues[station] = 1
		else stationValues[station] += 1
	})
}

var drawStations = function() {
	getStationValues()
	stations.map(function(d){
		var val = stationValues[d.id]
		if(val == undefined | circles[d.id] != undefined) return
		var size = settings.startRadius
		var text = '<b>' + d.name + ':</b> ' + val + ' riders'
		circles[d.id] = L.circle([d.latitude, d.longitude], size, {
		    color: 'white',
		    stroke:true,
		    weight:1,
		    fillColor: 'white',
		    fillOpacity: .25, 
		    opacity:.25
		}).bindPopup(text).addTo(circleGroup);	
	})
	
}


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

		// Go to next day 
		else {
			settings.dateNumber = settings.dateNumber == 365 ? 0 : settings.dateNumber +  1
			setTimeout(function() {$('#slider').slider('value', settings.dateNumber)}, 3000)
		}
	}
	window.setTimeout(startDrawing, 500)
}

var animateLine = function(dat, index) {
	var opacity = settings.encodeOpacity == true ? opacityScale(Number(dat.freq)) : settings.defaultOpacity
	var weight = settings.encodeWidth == true ? widthScale(Number(dat.freq)) : settings.defaultWidth
	var polyline = L.polyline([], {weight:weight, opacity:settings.defaultOpacity, color:settings.color, className:'line'}).addTo(lineGroup);
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
		if(settings.stopDrawing == true) return
		var latLongData =  pointList.slice(0, pointsAdded).map(function(d){return L.latLng(d)})
		polyline.setLatLngs(
	        latLongData
		)
		pointsAdded = pointsAdded + length > points ? points :  pointsAdded + length 
		if (pointsAdded != points ) window.setTimeout(add, delay);
		else {
			if(settings.disappear == true) {
				lineGroup.removeLayer(polyline)
			}
			if(settings.growCircles == true) {
				var id = dat.id.split('-')[1]
				test = dat
				var rad = circles[id].getRadius()
				var increase = rad > 200 ? 5000 : 10000
				var area = Math.pow(rad,2)
				var newArea = area + increase
				var newRadius = Math.pow(newArea, .5)
				var increment = rad > 200 ? 20 : 100
				circles[id].setRadius(newRadius)
			}
		}
	}
	add()
}
