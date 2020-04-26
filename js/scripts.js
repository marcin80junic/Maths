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
    e.preventDefault();
  });

  //define Operation class, a backbone of all mathematical operations
  function Operation() { };
  (function () {
    Operation.prototype.exerciseNum = 10;
    Operation.prototype.level = 0;
    Operation.prototype.levelDisplayed = null;
    Operation.prototype.randomized = true;
    Operation.prototype.numbers = [];
    Operation.prototype.results = [];
    Operation.prototype.answers = [];
    Operation.prototype.setLevel = function(newLevel) {
      this.level = newLevel;
      this.saveSettings({level: newLevel});
      this.init();
    };
    Operation.prototype.setExerciseNum = function(newNum) {
      this.exerciseNum = newNum;
      this.saveSettings({exerciseNum: newNum});
      this.init();
    };
    Operation.prototype.init = function () {
      if (this.levelDisplayed === null) { //true only when loading module first time
        this.loadSettings();
      }
      this.numbers = this.numbersCreator();
      this.results = []; // reset results array
      maths.layout.exercises(this); //  creates layout and assigns results property value
      maths.listeners.exercises(this); // attaching listeners to layout elements
    };
    Operation.prototype.numbersCreator = function(num, level) {
      num = num || this.exerciseNum;
      level = level || this.level;
      let operation = [],
          numbers = [],
          i;
      for (i = 0; i < num; i += 1) {
        while (true) {
          operation = this.getNumbers(level);
          if (areNumsUnique(operation, numbers)) {
            numbers.push(operation);
            break;
          }
        }
      }
      function areNumsUnique(nums, array) {
        let max = array.length, i;
        for (i = 0; i < max; i += 1) {
          if (JSON.stringify(nums) === JSON.stringify(array[i])) {
            return false;
          }
        }
        return true;
      }
      return numbers;
    };
    Operation.prototype.loadSettings = function () {
      try {
        if (typeof (Storage) !== "undefined") {
          let namespace = "maths." + this.name + ".";
          this.level = parseInt((localStorage.getItem(namespace + "level")), 10) || 0;
          this.exerciseNum = parseInt((localStorage.getItem(namespace + "exerciseNum")), 10) || 6;
          this.randomized = 
            (localStorage.getItem(namespace + "randomized") === 'false')? false: true;
          if (this.modules) { //check for existence of modules property which is contained only by test module
            let modsString = localStorage.getItem(namespace + "modules");
            this.modules =  (modsString)?
              modsString.split(",")
              : ["addition", "subtraction", "multiplication", "division"];
          }
        }
      } catch (error) {
        alert("can't access the local storage\nall settings will be restored to its default values");
      }
    };
    Operation.prototype.saveSettings = function (object) {
      try {
        if (typeof (Storage) !== "undefined") {
          let namespace = "maths." + this.name + ".",
              name;
          for (name in object) {
            if (object.hasOwnProperty(name)) {
              localStorage.setItem(namespace + name, object[name]);
            }
          }
        }
      } catch(error) {}
    };
  }());


  //utility function for creating objects which inherit from "obj"
  function objectCreator(obj) {
    function F() { }
    F.prototype = obj;
    return new F();
  }


  /*
  *define global application object which contains:
  @active property which is a currently displayed module,
  @switch function is switching active module and checking if it needs to be randomized
  @home, addition, subtraction, multiplying, division, test and settings module objects
  @layout object creating layout for exercises
  @timer object used in test module
  */

  var maths = {

    tick: "pics/correct.png",
    cross: "pics/wrong.png",
    questMark: "pics/question.png",
    difficulties: ["Fair", "Advanced", "Super Hard"],
    numOfExercises: ["6", "8", "10", "12", "16", "20", "24"],
    active: $("#home"),
    switch: function(id) {
      this.active = $(id);
      let moduleName = id.replace("#", "");
      let module = this[moduleName];
      if (Operation.prototype === Object.getPrototypeOf(module)) {
        if (module.level !== module.levelDisplayed) {
          module.init();
        }
      }
    },

    home: {

    },

    fractions: (function () {
      let fractions = objectCreator(Operation.prototype);
      fractions.name = "fractions";
      fractions.sign = "+";
      fractions.container = $("#fractions-exercises");
      fractions.reducer = (accArray, array) => [accArray[0] + array[0], accArray[1]];
      fractions.getNumbers = function (level) {
        const rand = maths.range;
        let numbers = [],
            base = rand(2, 10);
            fraction = () => [rand(1, base - 1), base];
        numbers = [fraction(), fraction()];
        numbers.push(numbers.reduce(this.reducer));
        return numbers;
      }
      return fractions;
    }()),

    addition: (function() {
      let addition = objectCreator(Operation.prototype);
      addition.name = "addition";
      addition.sign = "+";
      addition.container = $("#addition-exercises");
      addition.reducer = (accumulator, number) => accumulator + number;
      addition.getNumbers = function(level) {
        const rand = maths.range;
        let numbers = [];
        switch (level) {
          case 0:
            numbers = [rand(2, 9), rand(2, 9)];
            break;
          case 1:
            numbers = 
            (Math.random() < 0.5) ?
              (Math.random() < 0.5) ?
                [rand(10, 19), rand(2, 9)]
                : [rand(2, 9), rand(10, 19)]
              : [rand(2, 9), rand(2, 9), rand(2, 9)];
            break;
          case 2:
            numbers = 
            (Math.random() < 0.5) ?
              [rand(10, 99), rand(10, 19), rand(2, 9)]
              : [rand(10, 19), rand(2, 9), rand(10, 99)];
            break;
        }
        numbers.push(numbers.reduce(this.reducer)); //add result as the last number in array
        return numbers;
      };
      return addition;
    }()),

    subtraction: (function() {
      let subtraction = objectCreator(Operation.prototype);
      subtraction.name = "subtraction";
      subtraction.sign = "-";
      subtraction.container = $("#subtraction-exercises");
      subtraction.reducer = (accumulator, number) => accumulator - number;
      subtraction.getNumbers = function(level) {
        const rand = maths.range;
        let numbers = [];
        switch (level) {
          case 0:
            numbers = [rand(3, 9), rand(2, 8)];
            break;
          case 1:
            numbers = 
            (Math.random() < 0.5) ?
              [rand(10, 19), rand(2, 9)]
              : [rand(10, 19), rand(2, 9), rand(2, 5)];
            break;
          case 2:
            numbers = 
            (Math.random() < 0.5) ?
              [rand(10, 99), rand(10, 19), rand(2, 9)]
              : [rand(10, 99), rand(10, 97)];
            break;
        }
        let result = numbers.reduce(this.reducer);
        if (result > 0) {
          numbers.push(result) //add result as the last number in array
        } else {
          numbers = this.getNumbers(level);
        }
        return numbers;
      };
      return subtraction;
    }()),

    multiplication: (function() {
      let multiplication = objectCreator(Operation.prototype);
      multiplication.name = "multiplication";
      multiplication.sign = "&times";
      multiplication.container = $("#multiplication-exercises");
      multiplication.reducer = (accumulator, number) => accumulator * number;
      multiplication.getNumbers = function (level) {
        const rand = maths.range;
        let numbers = [];
        switch (level) {
          case 0:
            numbers = 
            (Math.random() < 0.5)?
              [rand(2, 5), rand(2, 6)]
              : [rand(2, 6), rand(2, 5)];
            break;
          case 1:
            numbers = [rand(2, 9), rand(2, 9)];
            break;
          case 2:
            numbers = 
            (Math.random() < 0.5) ?
              [rand(2, 5), rand(10, 19)]
              : (Math.random() < 0.5) ?
                [rand(2, 9), rand(2, 5), rand(2, 9)]
                : [rand(2, 9), rand(2, 9), rand(2, 5)];
            break;
        }
        numbers.push(numbers.reduce(this.reducer)); //add result as the last number in an array
        return numbers;
      };
      return multiplication;
    }()),

    division: (function() {
      let division = objectCreator(Operation.prototype);
      division.name = "division";
      division.sign = ":";
      division.container = $("#division-exercises");
      division.reducer = (accumulator, number) => accumulator / number;
      division.getNumbers = function (level) {
        const rand = maths.range;
        let numbers = [];
        switch (level) {
          case 0:
            numbers = [rand(4, 20), rand(2, 9)];
            break;
          case 1:
            numbers = [rand(12, 100), rand(3, 9)];
            break;
          case 2:
            numbers = 
            (Math.random() < 0.5) ?
              [rand(20, 200), rand(10, 19)]
              : [rand(20, 200), rand(2, 9), rand(2, 5)];
            break;
        }
        let result = numbers.reduce(this.reducer);
        if ((result % 1 === 0 && result > 1) && ((level !== 1) || (level === 1 && result < 10))) {
          numbers.push(result) //add result as the last number in array
        } else {
          numbers = this.getNumbers(level);
        }
        return numbers;
      };
      return division;
    }()),

    test: (function() {
      let test = objectCreator(Operation.prototype);
      test.name = "test";
      test.container = $("#test");
      test.modules = ["addition"];
      test.exerciseNum = 6;
      test.loaded = false;
      test.unlocked = 0;
      test.init = function() {
        if (!this.loaded) {
          this.loadSettings();
          this.loaded = true;
          let choiceButtons = $(".test-level-choice");
          choiceButtons.each(function (index) {
            if (index <= test.unlocked) {
              $(this).prop("disabled", false);
            }
          });
          choiceButtons.on("click", function (e) {
            test.level = choiceButtons.index(this);
            test.createTest();
          });
        }
      };
      test.createTest = function() {
        let module,
            content = {},
            html = "",
            max = this.modules.length,
            i;
        this.results = [];   // reset results array
        for (i = 0; i < max; i += 1) {
          module = maths[this.modules[i]];
          if (module) {
            this.numbers = module.numbersCreator(this.exerciseNum, this.level);
            this.sign = module.sign;  // sign and numbers properties to be used by layout object
            html = maths.layout.main(this, ); // string containing markup for operations
            if (i === 0) { // add bottom navigation depending on the position in test
              html += maths.layout.testNavigation(true, false);
            } else if (i === max - 1) {
              html += maths.layout.testNavigation(false, true);
            } else {
              html += maths.layout.testNavigation(false, false);
            }
            content[module.name] = html; // create property of content object and assign it the markup
          }
        }
        maths.accordeon.init($("#test .content"), this.name, content);
        maths.listeners.test(this);
        maths.timer.init($('.accordeon-titlebar-foo'), this.level, this.summary);
      };
      test.summary = function () {

      };
      return test;
    }()),

    settings: {
      
  
    },

    accordeon: {

      container: $('<div class="accordeon-container"></div>'),
      dimmer: $('.dim'),
    
      createTitleBar: function(title) {
        let bar = $('<div class="accordeon-titlebar"></div>'),
            foo = $('<div class="accordeon-titlebar-foo"></div>');
            barTitle = $('<h4 class="accordeon-titlebar-title">' + title + '</h4>'),
            closingBtn = $('<button class="accordeon-titlebar-close">&times;</button>');
        return bar.append(barTitle, foo, closingBtn);
      },

      createSection: function(head, cont) {
        let section = $('<div class="accordeon-section"></div>'),
            header = $('<h3 class="accordeon-section-header">' + head + '</h3>'),
            sectionContent = $('<div class="accordeon-section-content">' + cont + '</div>');
            sectionContent.hide();
        return section.append(header, sectionContent);
      },

      init: function(parent, title, contentObj) {
        let content = $('<div class="accordeon-content"></div>'),
            name;
        this.container.append(this.createTitleBar(title));
        for (name in contentObj) {
          if (contentObj.hasOwnProperty(name)) {
            content.append(this.createSection(name, contentObj[name]));
          }
        }
        parent.append(this.container);
        this.container.append(content).show();
        this.dimmer.show();
        this.attachListeners();
        $('.accordeon-section-content').eq(0).show();
        $('.accordeon-section-header').css("border-top", "none"); // nxt...
      },

      dispose: function () {
        this.container.empty().hide();
        this.dimmer.hide();
      },

      attachListeners: function () {
        $('.accordeon-titlebar-close').on("click", () => {
          this.dispose();  // erase the test and hide dialog container
          maths.timer.stop();
        });
        $('.accordeon-section-header').on("click", function() {
          maths.accordeon.accordeon(this);
        });
      },

      accordeon: function(context) {
        let content = $(context).next();
          if (content.is(':hidden')) {
            $('.accordeon-section-content').filter(':visible').slideUp();
            content.slideDown();
          }
      }
    },

    layout: {

      exercises: function(module) {  
        let num = module.exerciseNum,
            html = "",
            name,
            i;
       
        //user interface on top
        html += '<div class="flex flex-interface">';
        html +=   '<div><label for="level">Difficulty:</label><select class="level">';
        maths.difficulties.forEach((item, index) => {
          html += (module.level === index)?
                  '<option selected="selected">' + item + '</option>'
                  : '<option>' + item + '</option>';
        });
        html +=   '</select></div>';
        html +=   '<div><label for="exerciseNum">How many exercises?</label><select class="exerciseNum">';
        maths.numOfExercises.forEach((item, index) => {
            html += (module.exerciseNum === parseInt(item, 10))?
            '<option selected="selected">' + item + '</option>'
            : '<option>' + item + '</option>';
        });
        html +=   '</select></div>';
        html +=   '<div class="flex flex-score">';
        html +=     '<div>Your Score:</div>';
        html +=     '<div class="score">0</div>';
        html +=     '<div>/</div>';
        html +=     '<div>' + num + '</div>';
        html +=   '</div>';
        html += '</div>'; //end of interface

        html += this.main(module, num); //add main content and assign results to module's results property

        //bottom button group
        html += '<div class="flex flex-interface">';
        html +=   '<input type="reset" class="reset">';
        html +=   '<input type="submit" value="Reload" class="reload">';
        html +=   '<input type="submit" value="Check All" class="check-all">';
        html += '</div>';
        module.container.html(html);
        module.levelDisplayed = module.level;
      },

      main: function(module, num) {
        num = num || module.exerciseNum;
        let allNumbers = module.numbers, // numbers bank
            numbers, index, perc, len, random, i, j, isFraction, isAnswer,
            half = num / 2, //half of all operations
            sign = module.sign,
            isTest = module.name === "test",
            isRandomized = module.randomized,
            results = module.results,
            html = '<div class="flex flex-content">';
        html += '<div class="flex flex-content-column">';
  
        for (i = 0; i < num; i += 1) {
          numbers = allNumbers[i];  // numbers for single operation
          len = numbers.length;
          if (isRandomized) { // if true randomize placement of answer field
            perc = 1 / len; // a chance for number to be an answer field
            random = Math.random();
            index = Math.floor(random / perc); // index of answer field
          } else {  // answer field on the right of equality sign
            index = len - 1; // index of answer field
          }
          if (i === half) {  //start second column in the middle of iteration
            html += '</div><div class="flex flex-content-column">';
          }
          // single operation
          html += '<div class="flex flex-row">';
          for (j = 0; j < len; j += 1) {
            isFraction = (numbers[j].length === 2);
            isAnswer = (j === index);
            html += isFraction? 
              this.fraction(numbers[j], isAnswer, results)
              : this.integer(numbers[j], isAnswer, results);
            if (j === len - 1) {
              break;
            } 
            html += (j === len - 2)?
              '<div class="vertical-center"> = </div>'
              : '<div class="vertical-center">' + sign + '</div>';
          }
          html += '<div class="flex"><img src="' + maths.questMark + '" class="icon">';
          html += !isTest?  // insert a check button if not a test
            '<input type="submit" value="check" class="check">': "";
          html += '</div></div>';
          // end of single operation
        }
        html += '</div></div>';
        return html;
      },

      integer: function (number, isAnswer, results) {
        let html = '';
        html += isAnswer?
          '<div><input type="text" maxlength="3" class="answer"></div>'
          : '<div>' + number + '</div>';
        if (isAnswer) {
          results.push(number);
        }
        return html;
      },

      fraction: function (array, isAnswer, results) {
        let html = '<div class="fraction">';
        if (isAnswer) {
          html += '<div><input type="text" maxlength="3" class="answer"></div>';
          html += '<div class="dash">/</div>';
          html += '<div class="bottom"><input type="text" maxlength="3" class="answer"></div>';
          results.push(array);
        } else {
          html += '<div>' + array[0] + '</div>';
          html += '<div class="dash">/</div>';
          html += '<div class="bottom">' + array[1] + '</div>';
        }
        html += '</div>';
        return html;
      },

      testNavigation: function(isFirst, isLast) {
        let first = "Prev",
            last = (isLast)? "Finish": "Next",
            lastClass = (isLast)? "accordeon-button-finish": "accordeon-button-next",
            html = '<div class="test-navigation">';
        html += (!isFirst)? '<button class="accordeon-button-prev">' + first + '</button>': "";
        html += '<button class="' + lastClass + '">' + last + '</button></div>';
        return html;
      }

    },

    range: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),

    listeners: {
      exercises: function (module) {
        let answerFields = module.container.find(".answer"),
          icons = module.container.find(".icon"),
          checkButtons = module.container.find(".check"),
          checkAllButton = module.container.find(".check-all"),
          reloadButton = module.container.find(".reload"),
          resetButton = module.container.find(".reset"),
          levelChoice = module.container.find(".level"),
          exerciseNumChoice = module.container.find(".exerciseNum"),
          scoreField = module.container.find(".score"),
          score = 0;

        levelChoice.on("change", function () {              //options change
          let name = $(this).find("option:selected").text();
          module.setLevel(maths.difficulties.indexOf(name));
        });
        exerciseNumChoice.on("change", function () {
          let number = $(this).find("option:selected").text();
          module.setExerciseNum(parseInt(number, 10));
        });
        reloadButton.on("click", (e)=> {   // reload button
          e.preventDefault();
          module.init();
        });
        resetButton.on("click", ()=> {  // reset button
          score = 0;
          scoreField.text(score);
          answerFields.show().removeClass("warning").next().remove();
          icons.prop("src", maths.questMark);
          checkButtons.removeClass("invisible");
        });
        checkButtons.on("click", function (e) {   //listeners for all check buttons on page
          e.preventDefault();
          let index = checkButtons.index(this);
          let isCorrect = validateOperation(index);
          maths.listeners.playSound(isCorrect);
        });
        checkAllButton.on("click", (e) => {
          e.preventDefault();
          checkButtons.each(function(index) {
            validateOperation(index);
          });
        });
        const validateOperation = function (index) {   //validates single operation
          let answerField = answerFields.eq(index),
              answer = answerField.val(),
              result = module.results[index],
              icon = icons.eq(index);
              checkBtn = checkButtons.eq(index);
          if (answer === "") {
            icon.prop("src", maths.questMark);
            answerField.addClass("warning");
            return false;
          }
          answer = parseInt(answer, 10);
          if ((answer === result) && !checkBtn.is(".invisible")) {
            scoreField.text(++score);
            icon.prop("src", maths.tick);
            answerField.hide();
            answerField.after("<span>" + answer + "</span>");
            checkBtn.addClass("invisible");
            return true;
          }
          else if (answer !== result) {
            icon.prop("src", maths.cross);
            answerField.addClass("warning");
            return false;
          }
        };
        this.textInputs(answerFields, icons, validateOperation);  // add input fields filtering
      },

      playSound: function(isCorrect) {
        let cheer = new Audio("sounds/cheering.wav"),
            wrong = new Audio("sounds/fart.wav");
        if (isCorrect) {
          cheer.currentTime = 0.5;
          cheer.play();
          setTimeout(() => {
            cheer.pause();
          }, 2000);
        } else {
          wrong.play();
        }
      },

      test: function(module) {
        let answerFields = module.container.find(".answer"),
            icons = module.container.find(".icon"),
            prevBtn = module.container.find('.accordeon-button-prev'),
            nextBtn = module.container.find('.accordeon-button-next'),
            finishBtn = module.container.find('.accordeon-button-finish'),
            headers = module.container.find('.accordeon-section-header'),
            score = 0;
        this.textInputs(answerFields, icons);  // add input fields filtering
        prevBtn.on("click", function() {
          let index = prevBtn.index(this);
          maths.accordeon.accordeon(headers.eq(index));
        });
        nextBtn.on("click", function() {
          let index = nextBtn.index(this);
          maths.accordeon.accordeon(headers.eq(index + 1));
        });
      },

      textInputs: function(answerFields, icons, callback) { //input filtering for answer fields
        answerFields.on("paste", () => false);
        answerFields.on("blur", function () {
          let index = answerFields.index(this);
          if ($(this).val() === "") {
            $(this).removeClass("warning");
            if (icons) {  // only when not a test
              icons.eq(index).prop("src", maths.questMark);
            }
          }
        });
        answerFields.on("keydown", function (e) {
          let index = answerFields.index(this);
              char = String.fromCharCode(e.which),
              length = $(this).val().length;
          if ((window.getSelection().toString() !== "") && ($.isNumeric(char) ||
            (e.which > 95 && e.which < 106))) {
            return true; //allow replacing selection with numbers
          }
          if (e.which === 8 || e.which === 46 || e.which === 37 || e.which === 39) {
            return true; //allow backspace, delete, left and right arrow
          }
          if ((e.which > 95) && (e.which < 106) && (length < 3)) {
            return true; //allow numeric keyboard
          }
          if (e.which === 13 && typeof callback === "function") {
            let isCorrect = callback(index); // check line when "enter" pressed
            maths.listeners.playSound(isCorrect);
            return false;
          }
          if (!$.isNumeric(char) || (length === 3)) {
            return false;
          }
        });
      }
    },

    timer: {
      container: $('<div class="timer"></div>'),
      minutes: "00",
      seconds: "00",
      secondsElapsed: 0,
      init: function (parent, level, callback) {
        parent.append(this.container);
        this.start(level, callback);
      },
      state: function () {
        return "<b>" + this.minutes + ":" + this.seconds + "</b>"
      },
      show: function () {
        this.container.html(this.state());
      },
      setTimer: null,
      start: function (level, callback) {
        this.reset();
        var count = (level == 0) ? 480 : ((level == 1) ? 300 : 120);
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
            clearInterval(this.setTimer);
            callback(instance.secondsElapsed);
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
      },
    }
      
  };


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

  

});
