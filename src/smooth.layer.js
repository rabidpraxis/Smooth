(function( $, undefined ) {

  var TRANFORM_TYPE = '3d';

  $.fn.toss = function(vel) {
    var	$obj = this, 
        xVel = vel[0],
        yVel = vel[1],
        translateY = ($obj.position().top + yVel*8),
        translateX = ($obj.position().left + xVel*8);
        mag = Math.sqrt(xVel * xVel + yVel * yVel),
        time_cof = (Math.abs(mag - 180) / 180) * 2.5;

    // console.log('t_cof: ' + time_cof + "\nMag: " + mag + "\n" + "Pos: " + [translateY, translateX]);
    $obj.transition({time:1});
    $obj.transform({tX:translateX, tY:translateY});
  }

  $.fn.move = function(obj) {
    var o_pos = this.position(),
        bounds_snap = 300;

    // Deal with boundaries, add max pull and counterweight
    if(this.data('container')) {
      if(o_pos.left > this.data('container_left')) {
        var aff = (Math.max(.2, Math.abs((o_pos.left/bounds_snap)-1)));
        obj.tX = obj.tX * aff;
      }

      console.log('container_width', this.data('container_width'));
      if(o_pos.left < (this.data('container_width')-this.outerWidth())) {
        var l = o_pos.left - (this.data('container_width')-this.outerWidth())
        var aff = (Math.max(.2, Math.abs((l/bounds_snap)+1)));
        obj.tX = obj.tX * aff;
      }
    }

    this.transform({tY:o_pos.top + obj.tY,
                   tX:o_pos.left + obj.tX});
    return this;
  };

  $.fn.stop = function() {
    this[0].animating = false;
    this.transition({time:0})
        .transform({tX:this.position().left, tY:this.position().top});
  }

  $.fn.transition = function(options) {
    var ease  = (typeof(options['ease']) == 'undefined') 
                ? "cubic-bezier(0.001, 0.001, 0.001, 1.000)" : options['ease'],
        time  = (typeof(options['time']) == 'undefined') 
                ? "2" : options['time'],
        t_str = "all " + time + "s " + ease;
    
    this[0].style.webkitTransition = t_str;
    return this;
  }

  // Optional hash with key's: tX, tY, tZ, rot
  // Also reads data for directional constraints
  $.fn.transform = function(options){
    var t_str = "",
        left = this.position().left,
        top = this.position().top;
    // 2D Version
    // if (typeof(options['tX']) != 'undefined') 
    //   t_str += " translateX(" + options['tX'] + "px)";
    // if (typeof(options['tY']) != 'undefined') 
    //   t_str += " translateY(" + options['tY'] + "px)";

    // 3D Version
    var tX = (typeof(options['tX']) != 'undefined') 
              ? options['tX'] + "px" : "0px",
    tY = (typeof(options['tY']) != 'undefined') 
              ? options['tY'] + "px" : "0px", 
    tZ = (typeof(options['tZ']) != 'undefined') 
              ? options['tZ'] + "px" : "0px";
              
    // Deal with constraints
    if(this.data('constraint') != 'undefined') {
      if(this.data('constraint') == 'y') {
        tX = left;
      } else if (this.data('constraint') == 'x') {
        tY = top;
      }
    }

    if (tX != "0px" || tY != "0px" || tZ != "0px") 
      t_str = "translate3d(" + tX + ", " + tY + ", " + tZ + ")";
    if (typeof(options['rot']) != 'undefined') 
      t_str += " rotate(" + options['rot'] + ")";

    this[0].style.webkitTransform = t_str;
    return this;
  };

})( jQuery );
