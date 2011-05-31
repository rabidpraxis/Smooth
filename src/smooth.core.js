// Smooth: The ultimate html animation framework
(function( $, undefined ) {
	
	// Initialize smooth object
	var _smg = {
		mousedown: false,
		prevX: -1,
		prevY: -1,
		velocity: {x:0,y:0},

		// Touch Session
		session_move_time: 0,
		session_movement: [0,0],
		prev_session_movement: [0,0],
		did_move: function() {
			var _move = _smg.prev_session_movement;
			if(_move[0] > 2 || _move[1] > 2) return true;
			return false;
		}
	}

  $.fn.throwable = function(options) {
		var self = this;

		options = options || {};
		if (typeof(options['constraint']) != 'undefined') {
			self.data('constraint', options['constraint']);
		};
		// Explicit object container
		if (typeof(options['container']) != 'undefined') {
			self.data('container', options['container']);
			// Cache container dimentions, timeout required for correct dimentions
			setTimeout(function(){
				self.data('container_width', $(options['container']).outerWidth());
				self.data('container_left', $(options['container']).position().left);
				self.data('container_height', $(options['container']).outerHeight());
				self.data('container_top', $(options['container']).position().top);
			}, 30);
		};
		
		// For flickering
		// self[0].style.webkitBackfaceVisibility = "hidden";

		// Let the throwing begin!
		self.bind("mousedown", function(e){
			// Stop movement
			$(window).bind("touchdown", function(e){
				self.stop();
			});

			// Register for mouse move event
			$(window).bind("touchmoved", function(e, vel){
				self.move({tX: vel.x, tY: vel.y});
			});
			
			// Register for throw event
			$(window).bind("touchthrow", function(e, vel){
				console.log('touchthrow');
				self[0].animating = true;
				self.toss(vel);
			});

			$(window).bind("touchup", function(e){
				console.log('touchup');
				if(self.offset().left > 0) 
					self.transition({time: .8})
							.transform({tX:0, tY:self.offset().top});
				if(self.offset().left < (self.data('container_width')-self.outerWidth()))
					self.transition({time: .8})
							.transform({tX:self.data('container_width')-self.outerWidth(), tY:self.position().top});
			});
		})

		// Push back if outside bounds
		$(window).bind("animcheck", function(e){
			if (self[0].animating) {
				console.log('here we go!!', self);
			};
		});

		self[0].addEventListener('webkitTransitionEnd', 
			 function(event) { 
				 self[0].animating = false 
			 }, false );
	}


	$.fn.tappable = function(options) {
		return this.each(function(){
			this.style.webkitBackfaceVisibility = "hidden";

			$(this).bind("mousedown", function(e){
				$(window).bind("touchtap", function(e){
					options.tapped();
				});
			});
		});
	}

	$.fn.holdable = function(options){
		this.click(function(e) {
			if (!_smg.did_move()) { 
				console.log('held');
				callback();
			}
		})
	}

	function anim_check() {
		setTimeout(function(){
			$(window).trigger("animcheck");
			anim_check();
		}, 80);
	}

	function smooth_init() {
		// Global animation check binding
		anim_check();

		$(window).bind("mousedown", function(e){
			$(window).trigger('touchdown');
			_smg.mousedown = true;

			_smg.session_move_time = (new Date).getTime();
			_smg.session_start_time = (new Date).getTime();

			_smg.prevX = e.pageX;
			_smg.prevY = e.pageY;
		})

		$(window).bind("mouseup", function(e){
			$(window).trigger("touchup");

			_smg.prev_session_movement = _smg.session_movement;
			_smg.session_movement = [0,0];

			var time_now            = (new Date).getTime(),
					time_since_movement = time_now - _smg.session_move_time,
					total_tap_time      = time_now - _smg.session_start_time;
			
			// Tap
			if (!_smg.did_move() && total_tap_time < 200) {
				$(window).trigger("touchtap");
			};

			// Throw
			if (time_since_movement < 40) {
				$(window).trigger("touchthrow", [_smg.velocity]);
			};

			// Cleanup
			_smg.throwing = [];
			_smg.velocity = [0,0];
			_smg.mousedown = false;
			_smg.prevX = 0;
			_smg.prevY = 0;

			// Cleanup Bindings
			$.each(['touchmoved', 'touchthrow', 'touchdown', 'touchup', 'touchtap'], function(i, binding){
				$(window).unbind(binding);
			});
		})

		$(window).bind("mousemove", function(e){
			if (_smg.mousedown) {
				var eX = e.pageX, eY = e.pageY;
				// Calculate current velocity
				_smg.velocity = {x:eX-_smg.prevX, y:eY-_smg.prevY};

				// update session movement
				_smg.session_movement = [_smg.session_movement[0] + Math.abs(_smg.velocity.x),
																 _smg.session_movement[1] + Math.abs(_smg.velocity.y)];

				// update previous position
				_smg.prevX = eX; _smg.prevY = eY;

				$(window).trigger("touchmoved", [_smg.velocity]);

				// update move time
				_smg.session_move_time = (new Date).getTime();
			};
		})
	}
	smooth_init();

})( jQuery );
