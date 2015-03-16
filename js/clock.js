var Clock = function() {
	var self = this
	self.build()
}

Clock.prototype.build = function() {
	var self = this
	self.clock = d3.select('#container').append('div').attr('id', 'clock')
	self.hours = self.clock.append('div').attr('id', 'hours')
	self.minutes = self.clock.append('div').attr('id', 'minutes')
	self.meridian = self.clock.append('div').attr('id', 'meridian')
}

Clock.prototype.setMinute = function(minute) {
	var self = this
	var hour = Math.floor(minute/60) > 12 ? Math.floor(minute/60) - 12 : Math.floor(minute/60)
	if(hour == 0) hour = 12
	var meridian = Math.floor(minute/60) >= 12 ? 'pm' : 'am'
	self.hours.text(hour + ':')
	var min = (minute % 60) < 10 ? '0' + (minute % 60) : (minute % 60)
	self.minutes.text(min + ' ')
	self.meridian.text(meridian)
}