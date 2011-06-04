function Ani(object) {
  this.object = object;
}

Ani.prototype.translate3d = function(options) {
  console.log('t2d');
  return this;
}

Ani.prototype.translate2d = function(options) {
  console.log('t2d', this.object);
  return this;
}

Ani.prototype.run = function() {
  
}




// Translate String formatters
function get_translate3d(options) {
  return "translate3d(" + x + ", " + y + ", " + z + ")";
}



// var style = document.documentElement.appendChild(document.createElement("style")),
// rule = " run {\
//     0%   {\
//         -webkit-transform: translate3d(0, 0, 0); }\
//         transform: translate3d(0, 0, 0); }\
//     }\
//     100% {\
//         -webkit-transform: translate3d(0, " + your_value_here + "px, 0);\
//         transform: translate3d(0, " + your_value_here + "px, 0);\
//     }\
// }";
//     
// style.sheet.insertRule("@-webkit-keyframes" + rule, 1);
// 
// var stylesheet = document.styleSheets[0] // replace 0 with the number of the stylesheet that you want to modify
// , rules = stylesheet.rules
// , i = rules.length
// , keyframes
// , keyframe
// ;
// 
// while (i--) {
//   keyframes = rules.item(i);
//   if (
//       (
//        keyframes.type === keyframes.KEYFRAMES_RULE
//        || keyframes.type === keyframes.WEBKIT_KEYFRAMES_RULE
//       )
//       && keyframes.name === "run"
//      ) {
//     rules = keyframes.cssRules;
//     i = rules.length;
//     while (i--) {
//       keyframe = rules.item(i);
//       if (
//           (
//            keyframe.type === keyframe.KEYFRAME_RULE
//            || keyframe.type === keyframe.WEBKIT_KEYFRAME_RULE
//           )
//           && keyframe.keyText === "100%"
//          ) {
//         keyframe.style.webkitTransform =
//           keyframe.style.transform =
//           "translate3d(0, " + your_value_here + "px, 0)";
//         break;
//       }
//     }
//     break;
//   }
// }
