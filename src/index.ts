import './sass/index.scss';
import $ from 'jquery';
import { maths } from './ts/m02-maths';



$(function () {

    const toggleButton = $('.mobile-toggle-button');
  
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
        });
      }
      if (toggleButton.is(':visible')) {
        toggleButton.trigger('click');
      }
      e.preventDefault();
    });

    toggleButton.on('click', function() {
      $(this).toggleClass('pressed');
      $('.sidenav').toggleClass('is-open');
      $('body').toggleClass('body-hidden-overflow');
    });

});
