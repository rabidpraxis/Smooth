$ = jQuery

TRANFORM_TYPE = "3d"

# $.toss(): Algorithm and execution of iOS like throwing movement {{{1
$.fn.toss = (vel) ->
  $obj = this
  mag = do ->
    unless $obj.data("constraint")?
      if $obj.data("constraint") == "y"
        vel.y
      else if $obj.data("constraint") == "x"
        vel.x
    else
      Math.sqrt(vel.x * vel.x + vel.y * vel.y)

  mag = Math.abs(mag / 100)

  speed_add = mag * .21
  translate_delta =
    # x: ( vel.x * 10 + speed_add),
    # y: ( vel.y * 10 + speed_add)
    x: ( vel.x * 10.20),
    y: ( vel.y * 10.20)
    # x: ( vel.x * 7),
    # y: ( vel.y * 7)
  translateY = ($obj.position().top  + translate_delta.y)
  translateX = ($obj.position().left + translate_delta.x)
  time_cof   = (Math.abs(mag - 180) / 180) * 2.5

  if window.display_stats
    _oll "Initial Stats",
      'Velocity':          [vel.x, vel.y]
      'Maginitude':        mag
      'Translate Delta':   [translate_delta.x, translate_delta.y]
      'Translate':         [translateX, translateY]
      'Time Coeffecient':  time_cof
  
  time_add = ( mag * .7 )
  $obj.transition
    time: .8 + time_add
    # time: 1.5
  $obj.transform
    tX: translateX
    tY: translateY
# }}}
# $.move(): Relative movement from current position {{{1
$.fn.move = (obj) ->
  o_pos = @position()
  bounds_snap = 300
  if @data("container")
    if o_pos.left > @data("container_left")
      aff = (Math.max(.2, Math.abs((o_pos.left / bounds_snap) - 1)))
      obj.tX = obj.tX * aff
    if o_pos.left < (@data("container_width") - @outerWidth())
      l = o_pos.left - (@data("container_width") - @outerWidth())
      aff = (Math.max(.2, Math.abs((l / bounds_snap) + 1)))
      obj.tX = obj.tX * aff
  trans =
    tY: o_pos.top + obj.tY
    tX: o_pos.left + obj.tX
  @transform trans
  
  @
# }}}
# $.stop(): Stop transition animation {{{1
$.fn.stop = ->
  this[0].animating = false
  @transition(time: 0).transform
    tX: @offset().left
    tY: @offset().top
# }}}
# $.transition(): Helper Function for inputting CSS transitions {{{1
$.fn.transition = (options) ->
  cubic = "cubic-bezier(0.001, 0.001, 0.001, 1.000)"
  ease = (unless options["ease"]? then cubic else options["ease"])
  time = (unless options["time"]? then "2" else options["time"])
  t_str = "all #{time}s #{ease}"
  this[0].style.webkitTransition = t_str

  this
# }}}
# $.transform(): Helper function for tranforming elements via CSS {{{1
$.fn.transform = (options) ->
  $self = this
  tX = (if options["tX"]? then options["tX"] + "px" else "0px")
  tY = (if options["tY"]? then options["tY"] + "px" else "0px")
  tZ = (if options["tZ"]? then options["tZ"] + "px" else "0px")
  if @data("constraint")?
    if @data("constraint") == "y"
      tX = "0px"
    else tY = "0px"  if @data("constraint") == "x"
  t_str = "translate3d(" + tX + ", " + tY + ", " + tZ + ")"  if tX != "0px" or tY != "0px" or tZ != "0px"
  t_str += " rotate(" + options["rot"] + ")"  unless typeof (options["rot"]) == "undefined"
  t_str += " scale(" + options["scale"] + ")"  unless typeof (options["scale"]) == "undefined"
  this[0].style.webkitTransform = t_str

  # Allow for callback
  if options["callback"]?
    ani_ended = ->
      options["callback"]()
      $self[0].removeEventListener "webkitTransitionEnd", ani_ended, false
    $self[0].addEventListener "webkitTransitionEnd", ani_ended, false
  @
# }}}

# vim:fdm=marker
