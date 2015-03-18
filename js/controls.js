var dateScale
var setControls = function () {
	var start = new Date('01-01-2014')
    var end = new Date('12-31-2014')
    dateScale = d3.time.scale().domain([1,365]).range([start,end])
    $('#slider').slider({
        min:1, 
        value:settings.dateNumber,
        max:365,
        change:function(event, ui){
            settings.stopDrawing = true
            d3.selectAll('#map .line').remove()
            clock.setMinute(0)
            settings.dateNumber = ui.value
            var date = new Date(dateScale(ui.value))
            settings.date = '2014-' + (1+date.getMonth()) + '-' + date.getDate()
            var dateLabel = (1+date.getMonth()) + '/' + date.getDate() + '/14'
            $(".ui-slider-handle").text(dateLabel)
            reset()
            d3.select('#label-date').style('display', 'block').style('opacity', 1).style('top', '48%').text('(' + dateLabel + ')')
            window.setTimeout(function() {getData(drawLinesByMinute)}, 250)
            window.setTimeout(function() {d3.selectAll('#label, #label-date').transition().duration(2000).style('opacity', 0).each('end', function() {d3.select(this).style('display', 'none')});}, 2000)
        }, 
        slide:function(event, ui){
            var date = new Date(dateScale(ui.value))
            var dateLabel = (1+date.getMonth()) + '/' + date.getDate() + '/14'
            $(".ui-slider-handle").text(dateLabel)
        }
    })
    $(".ui-slider-handle").text('4/22/14')

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