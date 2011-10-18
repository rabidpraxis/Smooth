(function() {
  var SmoothNotifier, SmoothSlideEvent, SmoothTapEvent, anim_check, attract_timeout, clickable;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  clickable = true;
  window.display_stats = false;
  attract_timeout = 5000;
  $.fn.attractable = function(options) {
    var attract_video, reset_screen, self, timer;
    self = this;
    timer = null;
    attract_video = $('video', self)[0];
    _o(attract_video, $('video', self));
    reset_screen = function() {
      clearTimeout(timer);
      return timer = setTimeout((function() {
        if (options.timedout != null) {
          options.timedout(self);
        }
        self.addClass('active');
        return attract_video.play();
      }), options.timeout || attract_timeout);
    };
    $(window).bind("touchdown", function(e) {
      if (self.hasClass('active')) {
        if (options.tapped != null) {
          options.tapped(self);
        }
      }
      self.removeClass('active');
      reset_screen();
      return setTimeout((function() {
        attract_video.pause();
        return attract_video.currentTime = 0;
      }), 400);
    });
    return reset_screen();
  };
  $.fn.throwable = function(options) {
    var self;
    self = this;
    options = options || {};
    if (options["constraint"] != null) {
      self.data("constraint", options["constraint"]);
    }
    if (options["container"] != null) {
      self.data("container", options["container"]);
      setTimeout((function() {
        self.data("container_width", $(options["container"]).outerWidth());
        self.data("container_left", $(options["container"]).position().left);
        self.data("container_height", $(options["container"]).outerHeight());
        return self.data("container_top", $(options["container"]).position().top);
      }), 30);
    }
    self.bind("mousedown", function(e) {
      var touch_complete_call, touch_down_call, touch_move_call, touch_throw_call, touch_up_call;
      $(window).bind("touchdown", touch_down_call = function() {
        if (self[0].animating) {
          smooth.tap_stopped_animation = true;
        }
        return self.stop();
      });
      $(window).bind("touchmoved", touch_move_call = function(e, vel) {
        return self.move({
          tX: vel.x,
          tY: vel.y
        });
      });
      $(window).bind("touchthrow", touch_throw_call = function(e, vel) {
        return self.toss(vel);
      });
      $(window).bind("touchup", touch_up_call = function(e) {
        if (self.position().left > 0) {
          self.transition({
            time: .8
          }).transform({
            tX: -1,
            tY: self.offset().top
          });
        }
        if (self.offset().left < (self.data("container_width") - self.outerWidth())) {
          return self.transition({
            time: .8
          }).transform({
            tX: self.data("container_width") - self.outerWidth(),
            tY: self.position().top
          });
        }
      });
      return $(window).bind("touchcomplete", touch_complete_call = function() {
        $(window).unbind("touchdown", touch_down_call);
        $(window).unbind("touchmoved", touch_move_call);
        $(window).unbind("touchthrow", touch_throw_call);
        $(window).unbind("touchup", touch_up_call);
        return $(window).unbind("touchcomplete", touch_complete_call);
      });
    });
    (function() {
      var boundry_snap;
      boundry_snap = function(start, end, top) {
        self[0].animating = false;
        self.transform({});
        return self.transition({
          time: .1,
          ease: 'ease-out'
        }).transform({
          tX: start,
          tY: top,
          callback: function() {
            return self.transition({
              time: .4,
              ease: 'ease-in'
            }).transform({
              tX: end,
              tY: top
            });
          }
        });
      };
      return $(window).bind("animcheck", function(e) {
        var left_pos, top_pos;
        if (self[0].animating) {
          left_pos = self.position().left;
          top_pos = self.position().top;
          if (left_pos > 0) {
            boundry_snap(left_pos + 40, -1, top_pos);
          }
          if (left_pos < (self.data("container_width") - self.outerWidth())) {
            return boundry_snap(left_pos - 40, self.data("container_width") - self.outerWidth(), top_pos);
          }
        }
      });
    })();
    return self[0].addEventListener("webkitTransitionEnd", (function(event) {
      return self[0].animating = false;
    }), false);
  };
  $.fn.tappable = function(options) {
    var self;
    self = $(this);
    return self.bind("mousedown", function(mouse_event) {
      var down_event, touch_complete_call, touch_tap_call;
      down_event = new SmoothTapEvent(mouse_event, self);
      if ((options.target_class != null) && !down_event.target.hasClass(options.target_class)) {
        $(window).trigger("touchcomplete");
        if (options.tap_missed != null) {
          options.tap_missed(down_event);
        }
        return true;
      }
      if (options.tap_start != null) {
        options.tap_start(down_event);
      }
      $(window).bind("touchtap", touch_tap_call = function(e, tap_time) {
        if (options.tapped != null) {
          options.tapped(new SmoothTapEvent(mouse_event, self));
        }
        return $(window).trigger("touchcomplete");
      });
      return $(window).bind("touchcomplete", touch_complete_call = function() {
        if (options.tap_complete != null) {
          options.tap_complete(mouse_event.target, self);
        }
        $(window).unbind("touchtap", touch_tap_call);
        return $(window).unbind("touchcomplete", touch_complete_call);
      });
    });
  };
  $.fn.slideable = function(options) {
    var self;
    self = $(this);
    return self.bind("mousedown", function(mouse_event) {
      var slide_event, touch_complete_call, touch_stroke_call;
      slide_event = new SmoothSlideEvent(mouse_event, self);
      if (options.slide_start != null) {
        options.slide_start(slide_event);
      }
      $(window).bind("touchmoved", touch_stroke_call = function(event, vel) {
        slide_event.update_pos(vel);
        if (options.sliding != null) {
          return options.sliding(slide_event);
        }
      });
      return $(window).bind("touchcomplete", touch_complete_call = function() {
        if (options.complete != null) {
          options.complete(mouse_event);
        }
        $(window).unbind("touchmoved", touch_stroke_call);
        return $(window).unbind("touchcomplete", touch_complete_call);
      });
    });
  };
  SmoothTapEvent = (function() {
    function SmoothTapEvent(mouse_event, parent) {
      this.mouse_event = mouse_event;
      this.parent = parent;
      this.target = $(this.mouse_event.target);
    }
    return SmoothTapEvent;
  })();
  SmoothSlideEvent = (function() {
    function SmoothSlideEvent(mouse_event, parent) {
      this.mouse_event = mouse_event;
      this.parent = parent;
      this.parent_width = this.parent.width();
      this.parent_height = this.parent.height();
      this.pos = {
        x: this.mouse_event.layerX,
        y: this.mouse_event.layerY
      };
      this.session_movement = {
        x: 0,
        y: 0
      };
    }
    SmoothSlideEvent.prototype.update_pos = function(vel) {
      this.pos.x += vel.x;
      this.pos.y += vel.y;
      this.session_movement.x += Math.abs(vel.x);
      return this.session_movement.y += Math.abs(vel.y);
    };
    SmoothSlideEvent.prototype.parent_pos = function() {
      return {
        x: this.mouse_event.layerX,
        y: this.mouse_event.layerY
      };
    };
    SmoothSlideEvent.prototype.normal_pos = function() {
      return {
        x: this.pos.x / this.parent_width,
        y: this.pos.y / this.parent_height
      };
    };
    return SmoothSlideEvent;
  })();
  SmoothNotifier = (function() {
    function SmoothNotifier() {
      this.touchmove = __bind(this.touchmove, this);
      this.touchup = __bind(this.touchup, this);
      this.touchdown = __bind(this.touchdown, this);      this.mousedown = false;
      this.prevX = this.prevY = -1;
      this.velocity = {
        x: 0,
        y: 0
      };
      this.session_move_time = 0;
      this.session_movement = this.prev_session_movement = [0, 0];
      this.init();
    }
    SmoothNotifier.prototype.init = function() {
      $(document).bind("mousedown", this.touchdown);
      $(document).bind('mouseup', this.touchup);
      return $(document).bind("mousemove", this.touchmove);
    };
    SmoothNotifier.prototype.current_time = function() {
      return (new Date).getTime();
    };
    SmoothNotifier.prototype.did_move = function() {
      var _move;
      _move = this.prev_session_movement;
      return (_move[0] > 22) || (_move[1] > 22);
    };
    SmoothNotifier.prototype.tapworthy = function() {
      return !this.did_move() && !this.tap_stopped_animation;
    };
    SmoothNotifier.prototype.touchdown = function(event) {
      $(window).trigger("touchdown", [event]);
      this.mousedown = true;
      this.session_move_time = this.session_start_time = this.current_time();
      this.prevX = event.pageX;
      return this.prevY = event.pageY;
    };
    SmoothNotifier.prototype.touchup = function(event) {
      var time_now, time_since_movement, total_tap_time;
      $(self).trigger("touchup", [event]);
      this.prev_session_movement = this.session_movement;
      this.session_movement = [0, 0];
      time_now = this.current_time();
      time_since_movement = time_now - this.session_move_time;
      total_tap_time = time_now - this.session_start_time;
      if (this.tapworthy()) {
        $(window).trigger("touchtap", [total_tap_time, event]);
      }
      if (time_since_movement < 40) {
        $(window).trigger("touchthrow", [this.velocity, event]);
      }
      this.tap_stopped_animation = false;
      this.throwing = [];
      this.velocity = [0, 0];
      this.mousedown = false;
      this.prevX = this.prevY = 0;
      return $(window).trigger("touchcomplete");
    };
    SmoothNotifier.prototype.touchmove = function(event) {
      var eX, eY;
      if (this.mousedown) {
        eX = event.pageX;
        eY = event.pageY;
        this.velocity = {
          x: eX - this.prevX,
          y: eY - this.prevY
        };
        this.session_movement = [this.session_movement[0] + Math.abs(this.velocity.x), this.session_movement[1] + Math.abs(this.velocity.y)];
        this.prevX = eX;
        this.prevY = eY;
        $(window).trigger("touchmoved", [this.velocity, event]);
        return this.session_move_time = this.current_time();
      }
    };
    return SmoothNotifier;
  })();
  window.smooth = new SmoothNotifier();
  anim_check = function() {
    return setTimeout((function() {
      $(window).trigger("animcheck");
      return anim_check();
    }), 80);
  };
  anim_check();
}).call(this);
