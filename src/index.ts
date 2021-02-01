import './sass/index.scss';
import $ from 'jquery';
import { ModuleRegistry } from './ts/registry';
import { Container } from './ts/container/container';
import { Configuration } from './ts/config/configuration';



$(function () {

  let prevModule = ModuleRegistry.getModule(document.getElementById('home'));
  

  /* adjust app for touschscreen devices */

  if (Configuration.isTouchscreen) {
    $('#settings-form > fieldset:first-child').remove();  // remove the volume adjustment
    $('main').on('click', () => {
      $('.showtip').removeClass('showtip');               // hide tooltip on 'anywhere' tap
    });  
  } else {
    $(`.mobile-toggle-button,
      .sidenav a,
      .button-ladder,
      .dialog-head-close,
      .form-element,
      .custom-radio`)
        .addClass(Configuration.noTouchClass);      // add class allowing ':hover' effects on no-touch screens
  }
 
  /* event handler for navigation menu */

  $('#main-menu').on('click', (e) => {
    const link = $(e.target);
    let href = link.prop('href'),
        module: Container;
          
    if (href !== undefined) {
      $('.selected').removeClass('selected');
      link.addClass('selected');
      href = href.substring(href.indexOf('#') + 1);
      module = ModuleRegistry.getModule(document.getElementById(href));
      prevModule.hide(() => module.show());
      prevModule = module;
    }
    if ($('.sidenav .mobile-toggle-button').is(':visible')) {
      $('.sidenav').toggleClass('is-open');
      $('body').toggleClass('body-hidden-overflow');
    }
    e.preventDefault();
  });

});
