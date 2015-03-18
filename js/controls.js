var test
var setControls = function () {
	var start = new Date('01-01-2014')
    var end = new Date('12-31-2014')
    var dateScale = d3.time.scale().domain([1,365]).range([start,end])
    $('#slider').slider({
        min:1, 
        value:179,
        max:365,
        change:function(event, ui){
            console.log(ui.value)
            d3.selectAll('#map .line').remove()
            clock.setMinute(0)
            settings.stopDrawing = true
            var date = new Date(dateScale(ui.value))
            settings.date = '2014-' + (1+date.getMonth()) + '-' + date.getDate()
            console.log('date ', settings.date)
            reset()
            getData(drawLinesByMinute)
        }, 
        slide:function(event, ui){
            var date = new Date(dateScale(ui.value))
            var dateLabel = (1+date.getMonth()) + '/' + date.getDate() + '/14'
            $(".ui-slider-handle").text(dateLabel)
        }
    })
    $(".ui-slider-handle").text('6/28/14')

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