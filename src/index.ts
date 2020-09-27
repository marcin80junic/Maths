import './sass/index.scss';
import $ from 'jquery';
import { maths } from './ts/m02-maths';



$(function () {
  
  // find and hide all modules except for #home
  $('#main-menu a').each((index, el) => {
    let link = $(el),
        href = link.prop('href');
    href = href.substring(href.indexOf('#'));
    if (href !== '#home') {
      $(href).hide();
    }
  });

  // adjust app for touschscreen
  if (maths.isTouchscreen) {
    $('#settings-form > fieldset:first-child').remove();  // remove the volume adjustment
  } else {
    $(`.mobile-toggle-button,
      .sidenav a,
      .button-ladder,
      .dialog-head-close,
      .form-element,
      .custom-radio`)
        .addClass(maths.noTouchClass);  // add class allowing ':hover' effects on no-touch screens
  }
 


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
    if ($('.sidenav .mobile-toggle-button').is(':visible')) {
      $('.sidenav').toggleClass('is-open');
      $('body').toggleClass('body-hidden-overflow');
    }
    e.preventDefault();
  });

});
