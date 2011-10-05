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
    #---  touchdown event  ------------------------------------------------{{{2
    $(window).bind "touchdown", touch_down_call = ->
      _smg.tap_stopped_animation = true if self[0].animating
      self.stop()
    #-----------------------------------------------------------------------}}}
    #---  touchmoved event  -----------------------------------------------{{{2
    $(window).bind "touchmoved", touch_move_call = (e, vel) ->
      self.move
        tX: vel.x
        tY: vel.y
    #-----------------------------------------------------------------------}}}
    #---  touchthrow event  -----------------------------------------------{{{2
    $(window).bind "touchthrow", touch_throw_call = (e, vel) ->
      throw_me vel
    #-----------------------------------------------------------------------}}}
    #---  touchup event  --------------------------------------------------{{{2
    $(window).bind "touchup", touch_up_call = (e) ->
      if self.position().left > 0
        self.transition(time: .8).transform
          tX: -1
          tY: self.offset().top
      if self.offset().left < (self.data("container_width") - self.outerWidth())
        self.transition(time: .8).transform
          tX: self.data("container_width") - self.outerWidth()
          tY: self.position().top
    #-----------------------------------------------------------------------}}}
    #---  touchcomplete event  --------------------------------------------{{{2
    $(window).bind "touchcomplete", touch_complete_call = ->
      # Remove window bindings
      $(window).unbind "touchdown", touch_down_call
      $(window).unbind "touchmoved", touch_move_call
      $(window).unbind "touchthrow", touch_throw_call
      $(window).unbind "touchup", touch_up_call
      $(window).unbind "touchcomplete", touch_complete_call
    #-----------------------------------------------------------------------}}}
  
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
  # throw_me(): give me a throw around {{{2
  throw_me = (vel) ->
    self[0].animating = true
    self.toss vel
    start_pos = [self.position().left, self.position().top]
    start_time = (new Date).getTime()
    setTimeout (->
      end_pos = [self.position().left, self.position().top]
      after_speed = [end_pos[0]-start_pos[0], end_pos[1]-start_pos[1]]
      vel_diff = [Math.abs(after_speed[0] - vel.x), after_speed[1] - vel.y]
      stats =
        "Start Pos": start_pos,
        "End Pos": end_pos,
        "Orig Speed": [vel.x, vel.y]
        "Actual Speed": after_speed
        "Difference": vel_diff
        "Time": (new Date).getTime() - start_time
      if end_pos[0] != start_pos[0]
        window.vel_differences.push([Math.abs(vel_diff[0]), stats])
      if window.display_stats
        _oll "Post Throw Stats", stats
    ), 10
# }}}
  # Transition End {{{2
  self[0].addEventListener "webkitTransitionEnd", ((event) ->
    self[0].animating = false
  ), false
  # }}}
  # Speed Check {{{2
  do ->
    # TODO: Remove, just a speed check

    averager = do ->
      avg_val = avg_ct = 0
      {
        avg: (num) ->
          avg_ct++
          avg_val += num
        result: ->
          avg_val/avg_ct
        reset: ->
          avg_val = avg_ct = 0
      }

    calc_avg = ->
      for obj in window.vel_differences
        _o obj[0]
        _ol obj[1]
        averager.avg(obj[0])
      
      _o averager.result()

    awesome = (start, end, passed) ->
      self.stop()
      throw_me {x: passed, y:0}
      setTimeout ( ->
        if passed < end
          awesome(start, end, passed+1)
        else
          calc_avg()
      ), 10
    
    unless clickable
      awesome(20, 100, 20)
  # }}}
  
# }}} 
# $.tappable(): Endow tapping action on element {{{1
$.fn.tappable = (options) ->
  self = $(this)
  self.bind "mousedown", (mouse_event) ->
    # tap_start: (bubbled item, parent item)
    options.tap_start mouse_event.target, self if options.tap_start?

    # tapped callback
    $(window).bind "touchtap", touch_tap_call = (e, tap_time, win_e) ->
      return_obj =
        normal_parent_pos:
          x: mouse_event.offsetX / self.width()
          y: mouse_event.offsetY / self.height()
        target: mouse_event.target
        caller: self
        window_event: win_e
        mouse_event: mouse_event

      options.tapped return_obj if options.tapped?
      # stop triggering!!
      $(window).trigger "touchcomplete"

    $(window).bind "touchcomplete", touch_complete_call = ->
      options.tap_complete mouse_event.target, self if options.tap_complete?
      $(window).unbind "touchtap", touch_tap_call
      $(window).unbind "touchcomplete", touch_complete_call
# }}} 
# $.holdable(): Endow extended tap action on element {{{1
$.fn.holdable = (options) ->
  self = $(this)
  self.bind "mousedown", (e) ->
    unless _smg.did_move()
      console.log "held"
# }}} 
# $.strokeable(): grab your position while sliding across an item {{{1
$.fn.strokeable = (options) ->
  self = $(this)
  # use pos to calculate relative position change to layer
  pos = {x: 0, y: 0}
  width = self.width()
  height = self.height()
  self.bind "mousedown", (mouse_e) ->
    pos = {x: mouse_e.layerX, y: mouse_e.layerY}
    session_movement = {x: 0, y: 0}

    options.stroke_start self if options.stroke_start?

    # touchmoved callback
    $(window).bind "touchmoved", touch_stroke_call = (e, vel, win_e) ->
      pos.x += vel.x
      pos.y += vel.y
      session_movement.x += Math.abs(vel.x)
      session_movement.y += Math.abs(vel.y)
      return_obj =
        delta_pos: pos
        normal_parent_pos:
          x: pos.x / width
          y: pos.y / height
        parent_pos:
          x: mouse_e.layerX
          y: mouse_e.layerY
        target: win_e.target
        caller: mouse_e.target
        vel: vel
        session_movement: session_movement
        window_event: win_e
        mouse_event: mouse_e

      options.stroked return_obj if options.stroked?

    $(window).bind "touchcomplete", touch_complete_call = ->
      options.complete mouse_e if options.complete?
      $(window).unbind "touchmoved", touch_stroke_call
      $(window).unbind "touchcomplete", touch_complete_call
#}}}

class SmoothNotifier
  constructor: ->
    @mousedown = false
    @prevX = @prevY = -1
    @velocity = { x: 0, y: 0 }
    @session_move_time = 0
    @session_movement = @prev_session_movement = [ 0, 0 ]

    this.init()

  init: ->
    $(window).bind "mousedown",  this.touchdown
    $(window).bind 'mouseup',    this.touchup
    $(window).bind "mousemove",  this.touchmove

  did_move: ->
    _move = @prev_session_movement
    ( _move[0] > 22 ) or ( _move[1] > 22 )

  tapworthy: ->
    not this.did_move() and
    not @tap_stopped_animation

  touchdown: (event) =>
    $(window).trigger "touchdown", [event]
    @mousedown = true
    @session_move_time = @session_start_time = (new Date).getTime()
    @prevX = event.pageX
    @prevY = event.pageY

  touchup: (event) =>
    $(window).trigger "touchup", [event]
    @prev_session_movement = @session_movement
    @session_movement = [ 0, 0 ]
    time_now = (new Date).getTime()
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
      @session_move_time = (new Date).getTime()

window.smooth = new SmoothNotifier()

anim_check = ->
  setTimeout (->
    $(window).trigger "animcheck"
    anim_check()
  ), 80
anim_check()

# vim:fdm=marker
