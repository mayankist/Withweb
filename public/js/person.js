window.onscroll = function(){
  if ($(window).width() >= 479) {
    myFunction()
  }
};

var navbar = document.getElementById("navbar");
var navbar2 = document.getElementById("mainbox");
var sticky = navbar.offsetTop;

function myFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky");
    navbar2.classList.add("sticky2");
  } else {
    navbar.classList.remove("sticky");
    navbar2.classList.remove("sticky2");
  }
}

$(function () {
  $(document).scroll(function () {
    var $nav = $(".navbar");
    $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
  });
});

// $.fn.moveIt = function(){
//   var $window = $(window);
//   var instances = [];
  
//   $(this).each(function(){
//     instances.push(new moveItItem($(this)));
//   });
  
//   window.onscroll = function(){
//     var scrollTop = $window.scrollTop();
//     instances.forEach(function(inst){
//       inst.update(scrollTop);
//     });
//   }
// }

// var moveItItem = function(el){
//   this.el = $(el);
//   this.speed = parseInt(this.el.attr('data-scroll-speed'));
// };

// moveItItem.prototype.update = function(scrollTop){
//   this.el.css('transform', 'translateY(' + +(scrollTop / this.speed) + 'px)');
// };

// // Initialization

// jQuery(document).ready(function(){
//   if($(window).width() > 480){
//       $('[data-scroll-speed]').moveIt();
//   }
// });

// ========================OnScrollAnimate===================================

// function isVisible(elem) {

//   let coords = elem.getBoundingClientRect();

//   let windowHeight = document.documentElement.clientHeight;

//   // top elem edge is visible?
//   let topVisible = coords.top > 0 && coords.top < windowHeight;

//   // bottom elem edge is visible?
//   let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

//   return topVisible || bottomVisible;
// }

// function showVisible() {
//   for (let myobj of document.querySelectorAll('.mybox')) {
//     if (isVisible(myobj)) {
//       anime({
//         targets: myobj,
//         keyframes: [
//           {translateX: 250},
//           {translateX: 0}
//         ],
//         duration: 2000,
//         easing: 'easeOutElastic(1, .8)',
//       });
//     }
//   }
// }

// showVisible();
// window.onscroll = showVisible;

// ========================OnScrollAnimate===================================