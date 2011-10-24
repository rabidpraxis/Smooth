$ = jQuery
clickable = true
window.display_stats = false
attract_timeout = 5000

# $.attractable(): Allow for attraction screen to be loaded when unused {{{1
$.fn.attractable = (options) ->
  self = this
  timer = null
  attract_video = $('video', self)[0]
  _o attract_video, $('video', self)
  
  reset_screen = ->
    clearTimeout timer
    timer = setTimeout (->
      options.timedout self if options.timedout?
      self.addClass('active')
      attract_video.play()
    ), options.timeout || attract_timeout

  $(window).bind "touchdown", (e) ->
    if self.hasClass('active')
      options.tapped self if options.tapped?

    self.removeClass('active')
    reset_screen()

    setTimeout (->
      attract_video.pause()
      attract_video.currentTime = 0
    ), 400

  reset_screen()
# $.throwable(): Endow throwing interaction on element {{{1
$.fn.throwable = (options) ->
  self = this

  # {options}: configure setup {{{2
  options = options or {}
  if options["constraint"]?
    self.data "constraint", options["constraint"]
  if options["container"]?
    self.data "container", options["container"]
    setTimeout (->
      self.data "container_width", $(options["container"]).outerWidth()
      self.data "container_left", $(options["container"]).position().left
      self.data "container_height", $(options["container"]).outerHeight()
      self.data "container_top", $(options["container"]).position().top
    ), 30
  # }}}
  
  # Mouse bindings window publishing setup
  self.bind "mousedown", (e) ->

    $(window).bind "touchdown", touch_down_call = ->
      smooth.tap_stopped_animation = true if self[0].animating
      self.stop()

    $(window).bind "touchmoved", touch_move_call = (e, vel) ->
      self.move { tX: vel.x, tY: vel.y }

    $(window).bind "touchthrow", touch_throw_call = (e, vel) ->
      self.toss vel

    $(window).bind "touchup", touch_up_call = (e) ->
      if self.position().left > 0
        self.transition(time: .8).transform
          tX: -1
          tY: self.offset().top
      if self.offset().left < (self.data("container_width") - self.outerWidth())
        self.transition(time: .8).transform
          tX: self.data("container_width") - self.outerWidth()
          tY: self.position().top

    $(window).bind "touchcomplete", touch_complete_call = ->
      # Remove window bindings
      $(window).unbind "touchdown", touch_down_call
      $(window).unbind "touchmoved", touch_move_call
      $(window).unbind "touchthrow", touch_throw_call
      $(window).unbind "touchup", touch_up_call
      $(window).unbind "touchcomplete", touch_complete_call
  
  # Check for boundry animation penetration {{{2
  do ->
    boundry_snap = (start, end, top) ->
      self[0].animating = false
      self.transform({})
      self.transition({
        time: .1
        ease: 'ease-out'
      }).transform({
        tX: start
        tY: top
        callback: ->
          self.transition({time: .4, ease: 'ease-in'}).transform {
            tX: end
            tY: top
          }
      })

    $(window).bind "animcheck", (e) ->
      if self[0].animating
        left_pos = self.position().left
        top_pos = self.position().top
        if left_pos > 0
          boundry_snap(left_pos + 40, -1, top_pos)
        if left_pos < (self.data("container_width") - self.outerWidth())
          boundry_snap(left_pos - 40,
                       self.data("container_width") - self.outerWidth(),
                       top_pos)
  # }}}
  # Transition End {{{2
  self[0].addEventListener "webkitTransitionEnd", ((event) ->
    self[0].animating = false
  ), false
  # }}}
  
# }}} 
# $.tappable(): Endow tapping action on element {{{1
$.fn.tappable = (options) ->
  self = $(this)

  self.bind "mousedown", (mouse_event) ->
    down_event = new SmoothTapEvent(mouse_event, self)

    # Check to see if there should only be one type of click
    if options.target_class? and not down_event.target.hasClass(options.target_class)
      $(window).trigger "touchcomplete"
      options.tap_missed down_event if options.tap_missed?
      return true

    # Initial touch
    options.tap_start down_event if options.tap_start?

    # Finger removed
    $(window).bind "touchtap", touch_tap_call = (e, tap_time) ->
      options.tapped new SmoothTapEvent(mouse_event, self) if options.tapped?
      $(window).trigger "touchcomplete"

    $(window).bind "touchcomplete", touch_complete_call = ->
      options.tap_complete mouse_event.target, self if options.tap_complete?
      $(window).unbind "touchtap", touch_tap_call
      $(window).unbind "touchcomplete", touch_complete_call
  
# }}} 
# $.strokeable(): grab your position while sliding across an item {{{1
$.fn.slideable = (options) ->
  self = $(this)

  self.bind "mousedown", (mouse_event) ->
    slide_event = new SmoothSlideEvent mouse_event, self

    options.slide_start slide_event if options.slide_start?

    # touchmoved callback
    $(window).bind "touchmoved", touch_stroke_call = (event, vel) ->
      slide_event.update_pos(vel)
      options.sliding slide_event if options.sliding?

    $(window).bind "touchcomplete", touch_complete_call = ->
      options.complete mouse_event if options.complete?
      $(window).unbind "touchmoved", touch_stroke_call
      $(window).unbind "touchcomplete", touch_complete_call
#}}}


class SmoothTapEvent
  constructor: (@mouse_event, @parent) ->
    @target = $(@mouse_event.target)

class SmoothSlideEvent
  constructor: (@mouse_event, @parent) ->
    @parent_width = @parent.width()
    @parent_height = @parent.height()
    @pos = { x: @mouse_event.layerX, y: @mouse_event.layerY }
    @session_movement = { x: 0, y: 0 }

  update_pos: (vel) ->
    @pos.x += vel.x
    @pos.y += vel.y
    @session_movement.x += Math.abs(vel.x)
    @session_movement.y += Math.abs(vel.y)

  parent_pos: ->
    x: @mouse_event.layerX
    y: @mouse_event.layerY

  normal_pos: ->
    x: @pos.x / @parent_width
    y: @pos.y / @parent_height


class SmoothNotifier
  constructor: ->
    @mousedown = false
    @prevX = @prevY = -1
    @velocity = { x: 0, y: 0 }
    @session_move_time = 0
    @session_movement = @prev_session_movement = [ 0, 0 ]

    this.init()

  init: ->
    $(document).bind "mousedown",  this.touchdown
    $(document).bind 'mouseup',    this.touchup
    $(document).bind "mousemove",  this.touchmove

  current_time: ->
    (new Date).getTime()

  did_move: ->
    _move = @prev_session_movement
    ( _move[0] > 22 ) or ( _move[1] > 22 )

  tapworthy: ->
    not this.did_move() and
    not @tap_stopped_animation

  touchdown: (event) =>
    $(window).trigger "touchdown", [event]
    @mousedown = true
    @session_move_time = @session_start_time = this.current_time()
    @prevX = event.pageX
    @prevY = event.pageY

  touchup: (event) =>
    $(self).trigger "touchup", [event]
    @prev_session_movement = @session_movement
    @session_movement = [ 0, 0 ]
    time_now = this.current_time()
    time_since_movement = time_now - @session_move_time
    total_tap_time = time_now - @session_start_time
    
    $(window).trigger "touchtap", [ total_tap_time, event ] if this.tapworthy()
    $(window).trigger "touchthrow", [ @velocity, event ] if time_since_movement < 40

    @tap_stopped_animation = false
    @throwing = []
    @velocity = [ 0, 0 ]
    @mousedown = false
    @prevX = @prevY = 0
    $(window).trigger "touchcomplete"

  touchmove: (event) =>
    if @mousedown
      eX = event.pageX
      eY = event.pageY
      @velocity =
        x: eX - @prevX
        y: eY - @prevY
      
      @session_movement = [
        @session_movement[0] + Math.abs(@velocity.x),
        @session_movement[1] + Math.abs(@velocity.y)
      ]
      @prevX = eX
      @prevY = eY
      $(window).trigger "touchmoved", [ @velocity, event ]
      @session_move_time = this.current_time()

window.smooth = new SmoothNotifier()

anim_check = ->
  setTimeout (->
    $(window).trigger "animcheck"
    anim_check()
  ), 80
anim_check()

# vim:fdm=marker
