(function() {
  var $, TRANFORM_TYPE;
  $ = jQuery;
  TRANFORM_TYPE = "3d";
  $.fn.toss = function(vel) {
    var $obj, mag, speed_add, time_add, time_cof, translateX, translateY, translate_delta;
    $obj = this;
    mag = (function() {
      if ($obj.data("constraint") === "y") {
        return vel.y;
      } else if ($obj.data("constraint") === "x") {
        return vel.x;
      } else {
        return Math.sqrt(vel.x * vel.x + vel.y * vel.y);
      }
    })();
    mag = Math.abs(mag / 100);
    speed_add = mag * .21;
    translate_delta = {
      x: vel.x * 10.20,
      y: vel.y * 10.20
    };
    translateY = $obj.position().top + translate_delta.y;
    translateX = $obj.position().left + translate_delta.x;
    time_cof = (Math.abs(mag - 180) / 180) * 2.5;
    if (window.display_stats) {
      _oll("Initial Stats", {
        'Velocity': [vel.x, vel.y],
        'Maginitude': mag,
        'Translate Delta': [translate_delta.x, translate_delta.y],
        'Translate': [translateX, translateY],
        'Time Coeffecient': time_cof
      });
    }
    time_add = mag * .7;
    console.log(time_add);
    $obj.transition({
      time: .8 + time_add
    });
    return $obj.transform({
      tX: translateX,
      tY: translateY
    });
  };
  $.fn.move = function(obj) {
    var aff, bounds_snap, l, o_pos, trans;
    o_pos = this.position();
    bounds_snap = 300;
    if (this.data("container")) {
      if (o_pos.left > this.data("container_left")) {
        aff = Math.max(.2, Math.abs((o_pos.left / bounds_snap) - 1));
        obj.tX = obj.tX * aff;
      }
      if (o_pos.left < (this.data("container_width") - this.outerWidth())) {
        l = o_pos.left - (this.data("container_width") - this.outerWidth());
        aff = Math.max(.2, Math.abs((l / bounds_snap) + 1));
        obj.tX = obj.tX * aff;
      }
    }
    trans = {
      tY: o_pos.top + obj.tY,
      tX: o_pos.left + obj.tX
    };
    this.transform(trans);
    return this;
  };
  $.fn.stop = function() {
    this[0].animating = false;
    return this.transition({
      time: 0
    }).transform({
      tX: this.offset().left,
      tY: this.offset().top
    });
  };
  $.fn.transition = function(options) {
    var cubic, ease, t_str, time;
    cubic = "cubic-bezier(0.001, 0.001, 0.001, 1.000)";
    ease = (options["ease"] == null ? cubic : options["ease"]);
    time = (options["time"] == null ? "2" : options["time"]);
    t_str = "all " + time + "s " + ease;
    this[0].style.webkitTransition = t_str;
    return this;
  };
  $.fn.transform = function(options) {
    var $self, ani_ended, tX, tY, tZ, t_str;
    $self = this;
    tX = (options["tX"] != null ? options["tX"] + "px" : "0px");
    tY = (options["tY"] != null ? options["tY"] + "px" : "0px");
    tZ = (options["tZ"] != null ? options["tZ"] + "px" : "0px");
    if (this.data("constraint") != null) {
      if (this.data("constraint") === "y") {
        tX = "0px";
      } else {
        if (this.data("constraint") === "x") {
          tY = "0px";
        }
      }
    }
    if (tX !== "0px" || tY !== "0px" || tZ !== "0px") {
      t_str = "translate3d(" + tX + ", " + tY + ", " + tZ + ")";
    }
    if (typeof options["rot"] !== "undefined") {
      t_str += " rotate(" + options["rot"] + ")";
    }
    if (typeof options["scale"] !== "undefined") {
      t_str += " scale(" + options["scale"] + ")";
    }
    this[0].style.webkitTransform = t_str;
    if (options["callback"] != null) {
      ani_ended = function() {
        options["callback"]();
        return $self[0].removeEventListener("webkitTransitionEnd", ani_ended, false);
      };
      $self[0].addEventListener("webkitTransitionEnd", ani_ended, false);
    }
    return this;
  };
}).call(this);
