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

  //add event handler to navigation menu
  $("#main-menu").on("click", (e)=> {
    let link = $(e.target),
        href = link.prop("href");
    href = href.substring(href.indexOf("#"));
    $(".selected").removeClass("selected");
    link.addClass("selected");
    maths.active.fadeOut(()=>{
      maths.switch(href);
      maths.active.fadeIn();
    });
    e.preventDefault();
  });


  /*
  *define global application object which contains:
  @active property which is a currently displayed module,
  @switch function is switching active module and checking if it needs to be randomized
  @addition, subtraction, multiplying, division, test and settings module objects
  *it also defines helper functions for randomizing numbers
  @timer object used in test module
  */
 var maths = {
  active: $("#home"),
  switch: function(id) {
    this.active = $(id);
    let moduleName = id.replace("#", "");
    let module = this[moduleName];
    if (module["sign"] !== undefined) {
      module.initialize();
    }
  },
  home: {

  },
  addition: {
    name: "addition",
    sign: "+",
    level: 0,
    levelDisplayed: null,
    container: $("#addition-exercises"),
    isLayoutInit: false,
    isRandomized: false,
    initialize: function() {
      if(this.isRandomized && this.level === this.levelDisplayed) {
        return;
      }
      if(!this.isLayoutInit) {
        maths.randomizer.layoutCreator(maths.exerciseNum, this.container);
      }
      
    },
    getNumbers: function() {
      switch (this.level) {
        case 0:
          return [maths.randomSingleDigit(), maths.randomSingleDigit()];
        case 1:
          return (Math.random() < 0.5) ?
            (Math.random() < 0.5) ?
              [maths.randomSeveralDigit(), maths.randomSingleDigit()]
              : [maths.randomSingleDigit(), maths.randomSeveralDigit()]
            : [maths.randomSingleDigit(), maths.randomSingleDigit(), maths.randomSingleDigit()];
        case 2:
          return (Math.random() < 0.5) ?
            [maths.randomDoubleDigit(), maths.randomSeveralDigit(), maths.randomSingleDigit()]
            : [maths.randomSeveralDigit(), maths.randomSingleDigit(), maths.randomDoubleDigit()];
      }
    },
    numbers: [],
    results: [],
    answers: []
  },
  subtraction: {

  },
  multiplication: {

  },
  division: {

  },
  test: {

  },
  settings: {

  },
  randomizer: {
    layoutCreator: (num, container)=> {
      let html = "",
          i;
      for (i = 0; i < num; i += 1) {

      }
    },
    randomSingleDigit: () => {
      let number;
      while (true) {
        number = Math.floor(Math.random() * 10);
        if (number !== 0) {
          return number;
        }
      }
    },
    randomSeveralDigit: () => {
      return Math.floor(Math.random() * 10) + 10;
    },
    randomDoubleDigit: () => {
      let number = Math.floor(Math.random() * 100);
      return (number === 0 || number < 9) ? number + 10 : number;
    },
    isUnique: (nums, array) => {
      let max = array.length,
        i;
      for (i = 0; i < max; i += 1) {
        if (nums === array[i]) {
          return false;
        }
      }
      return true;
    }
  },
  
  exerciseNum: 20,
  testNum: 6,
  timer: {
    container: $("#timer"),
    minutes: "00",
    seconds: "00",
    secondsElapsed: 0,
    state: function () {
      return "<b>" + this.minutes + ":" + this.seconds + "</b>"
    },
    show: function () {
      this.container.html(this.state());
    },
    setTimer: null,
    start: function (level) {
      this.reset();
      var count = (level == 0) ? 500 : ((level == 1) ? 300 : 120);
      var minutes = Math.floor(count / 60);
      var seconds = count % 60;
      this.minutes = (minutes < 10) ? "0" + minutes : "" + minutes;
      this.seconds = (seconds < 10) ? "0" + seconds : "" + seconds;
      this.show();
      var instance = this;
      var start = Date.now();
      this.setTimer = setInterval(function () {
        var elapsed = Math.floor((Date.now() - start) / 1000) - 1;
        instance.secondsElapsed = elapsed;
        if (elapsed >= count + 1) {
          $("#test").submit();
          clearInterval(this.setTimer);
          return;
        }
        var secsElapsed = (elapsed + 60) % 60;
        var secs = (seconds < secsElapsed) ? 60 - (secsElapsed - seconds) : seconds - secsElapsed;
        var minsElapsed = Math.floor(elapsed / 60);
        var mins = (secsElapsed < seconds + 1) ? minutes - minsElapsed : minutes - minsElapsed - 1;
        instance.minutes = (mins < 10) ? "0" + mins : "" + mins;
        instance.seconds = (secs < 10) ? "0" + secs : "" + secs;
        instance.show();
      }, 1000);
    },
    stop: function () {
      clearInterval(this.setTimer);
      this.container.html("");
    },
    reset: function () {
      this.minutes = "00";
      this.seconds = "00";
    }
  }
};


  var creator = (isTest) => {
    let operation = [],
      numbers = [],
      results = [],
      max = isTest ? maths.testNum : maths.exerciseNum,
      i;
    for (i = 0; i < max; i += 1) {
      while (true) {
        operation = this.getNumbers();
        if (maths.isUnique(operation, numbers)) {
          numbers.push(operation);
          results.push(operation.reduce((accumulator, num) => {
            return accumulator + num;
          }));
          break;
        }
      }
    }
    if (!isTest) {
      this.numbers = numbers;
      this.results = results;
    } else {
      maths.test.numbers.push(numbers);
      maths.test.results.push(results);
    }
    return numbers;
  }


  function createSummary() {
    var results = [],
      score = 0,
      rewardText = "";
    for (var i = 0; i < maths.modules.length; i++) {
      var name = maths.modules[i][0];
      results.push(checkResults(true, true, name));
      score += results[i];
    }
    var $summary = $(".summary");
    $summary.empty();
    $summary.filter(":lt(4)").each(function (index) {
      var txt = results[index] + " of 6 (" + Math.round(results[index] / 6 * 100) + "%)";
      $(this).text(txt);
    });
    var percent = Math.round(score / 24 * 100);
    $summary.eq(4).text(score + " of 24  (" + percent + "%)");
    var minutes = (timer.secondsElapsed > 59) ? Math.floor(timer.secondsElapsed / 60) : 0;
    var seconds = (timer.secondsElapsed > 59) ? timer.secondsElapsed % 60 : timer.secondsElapsed;
    var time = (minutes > 0) ? minutes + ((minutes === 1) ? " minute " : " minutes ") + seconds + " second(s)" : seconds + " second(s)";
    $summary.eq(5).text(time);
    if (percent < 66) {
      rewardText = "test failed, you need to practise a little more<br>don't give up and try again!";
    }
    else if (percent > 65 && percent < 86) {
      rewardText = "Well done you passed!"
      rewardText += ((maths.unlocked < 2) && (maths.unlocked === maths.difficulty.test)) ?
        "<br>(to unlock next level your score needs to be at least 90%)" : "";
    }
    else {
      rewardText = "Well done you passed!";
      rewardText += ((maths.unlocked < 2) && (maths.unlocked === maths.difficulty.test)) ?
        "<br>Next level unlocked: " + maths.difficulty.map[maths.unlocked + 1][0] : "";
      maths.unlocked = maths.difficulty.test + 1;
      $(".test-difficulty-button[value=" + maths.unlocked + "]").removeAttr("disabled");
      localStorage.setItem("unlocked", maths.unlocked);
    }
    $summary.eq(6).html(rewardText);
  }

  function toggleClass($activeDiv) {
    $(".accordeon-selected").removeClass("accordeon-selected");
    $activeDiv.addClass("accordeon-selected");
  }




  function validateInput(element, e) {
    var char = String.fromCharCode(e.which);
    var length = $(element).val().length;
    if ((window.getSelection().toString() !== "") && ($.isNumeric(char))) {
      return true;
    };
    if (!$.isNumeric(char) || (length === 3)) {
      return false;
    }
  }


});
