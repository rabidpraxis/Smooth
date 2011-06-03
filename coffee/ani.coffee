debug = true

log = (msg...) ->
  console.log(msg) if debug

class Ani
  constructor: (@ele) ->
    @ani_o = {0:[]}
    @current_keyframe = 0
    @sheet = get_ani_sheet()

  keyframe: (frame) ->
    @current_keyframe = frame
    @ani_o[frame] = [] unless @ani_o[frame]?
    this

  translate3d: (opts) ->
    log 'Ani.translate3d executed', opts

    t_str = ""
    $.each ['tX', 'tY', 'tZ'], (i, ele) =>
      t_str += ", " unless i is 0
      t_str += if opts[ele]? then opts[ele] else 0
      
    f_str = "translate3d(#{t_str})"

    @ani_o["#{@current_keyframe}"].push(f_str)
    this

  translate2d: (opts) ->
    log 'Ani.translate2d executed', opts
    this

  run: (opts) ->
    log 'Ani.run executed', this
    log 'Ani - KeyframeObj', @ani_o
    log 'Ani - Sheet', @sheet
    this

  stop: ->
    log 'Ani.stop executed', this

  get_ani_sheet = ->
    if not sheet = document.querySelector('#ani_stylesheet')
      sheet = document.createElement("style")
      sheet.setAttribute("id","ani_stylesheet")
      document.documentElement.appendChild(sheet)
    sheet

a = new Ani('ani')
a.keyframe(0)
   .translate3d({tX:14})
 .keyframe(100)
   .translate3d({tX:12})
 .run()

b = new Ani()
