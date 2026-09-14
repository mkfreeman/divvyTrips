var setControls = function () {
    $('button').on('click', function(a) {
	 	var id = $(this).attr('id')
	 	$(this).blur()
	 	var klass = $(this).attr('class') == 'active' ? 'passive' : 'active'
	 	$(this).attr('class', klass)
	 	switch(id) {
	 		case 'riders':
	 			if(klass == 'active') map.addLayer(lineGroup)
	 			else map.removeLayer(lineGroup)
	 			break;
	 		case 'stations':
	 			if(klass == 'active') map.addLayer(circleGroup)
	 			else map.removeLayer(circleGroup)
	 			break;
	 		case 'maptiles':
	 			if(klass == 'active') map.addLayer(mapboxTiles)
	 			else map.removeLayer(mapboxTiles)
	 			break;
	 	}
	})
}


var reset = function() {
	d3.values(circles).map(function(d){
		d.setRadius(settings.startRadius)
	})
}