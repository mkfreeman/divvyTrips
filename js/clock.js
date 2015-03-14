var Clock = function() {
	var self = this
	self.build()
}

Clock.prototype.build = function() {
	var self = this
	self.clock = d3.select('#container').append('div').attr('id', 'clock')
	self.hours = self.clock.append('div').attr('id', 'hours')
	
	self.minutes = self.clock.append('div').attr('id', 'minutes')
	
}

Clock.prototype.setMinute = function(minute) {
	var self = this
	self.hours.text(Math.floor(minute/60) + ':')
	var min = (minute % 60) < 10 ? '0' + (minute % 60) : (minute % 60)
	self.minutes.text(min)
}