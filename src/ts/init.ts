import { maths } from './m2-resources';

$('document').ready(function () {
    
    //find and hide all modules except for #home
    $('#main-menu a').each((index, el) => {
      let link = $(el),
          href = link.prop('href');
      href = href.substring(href.indexOf('#'));
      if (href !== '#home') {
        $(href).hide();
      }
    });

    //event handler for navigation menu
    $('#main-menu').on('click', (e) => {
      let link = $(e.target),
          href = link.prop('href');
      if (href !== undefined) {
        href = href.substring(href.indexOf('#'));
        $('.selected').removeClass('selected');
        link.addClass('selected');
        maths.active.fadeOut(() => {
          maths.switch(href);
          maths.active.fadeIn();
          // assigns padding to all lines and defines handler for window resize
       //   maths.handlers.centerColumns(maths.active.find('.columns-line')); 
        });
      }
      if ($('.mobile-toggle-button').is(':visible')) {
        $('.sidenav').toggleClass('is-open');
        $('body').toggleClass('body-hidden-overflow');
      }
      e.preventDefault();
    });

    //adjust exercises columns padding if window resizes*/
    $(window).resize( ()=> {
      let column = $('.columns:visible');
      if (column.length > 0) {
        maths.handlers.adjustLinesPadding(column.children());
      }
    } ); 

});