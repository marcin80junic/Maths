$(function () {

    
    //find and hide all modules except for #home
    $("#main-menu a").each((index, el) => {
      let link = $(el),
          href = link.prop("href");
      href = href.substring(href.indexOf("#"));
      if (href !== "#home") {
        $(href).hide();
      }
    });

    // event handler for 'hamburger' icon
    $(".menu-toggle").on("click", ()=> {
      $(".navigation-menu").toggleClass("is-open");
      $("body").toggleClass("body-hidden-overflow");
    });

  
    //add event handler to navigation menu
    $("#main-menu").on("click", (e) => {
      let link = $(e.target),
          href = link.prop("href");
      href = href.substring(href.indexOf("#"));
      $(".selected").removeClass("selected");
      link.addClass("selected");
      maths.active.fadeOut(() => {
        maths.switch(href);
        maths.active.fadeIn();
      });
      if ($(".menu-toggle").is(":visible")) {
        $(".navigation-menu").removeClass("is-open");
        $("body").removeClass("body-hidden-overflow");
      }
      e.preventDefault();
    });

});
  