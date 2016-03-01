$(document).ready(function(){


  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var height = $(window).height();
    $('.header').css({
      'opacity': ((height - scrollTop) / height)
    });
  });

  $('.gallery__figure').hover(

    function(){
      $(this).find('.gallery_img').css('opacity', '0.3');
      $(this).find('.gallery__figure__info').css('opacity', '1');

    },
    function(){
      $(this).find('.gallery_img').css('opacity', '1');
      $(this).find('.gallery__figure__info').css('opacity', '0');
    }




  );


});

