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
    Operation.prototype.levelDisplayed = null;
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
      if (!this.levelDisplayed) { //true only when loading module first time
        this.loadSettings();
      }
      this.numbers = this.numbersCreator();
      this.results = []; // reset results array
      maths.layout.exercises(this); //  creates layout and assigns results property value
      maths.listeners.exercises(this); // attaching listeners to layout elements
    };
    Operation.prototype.numbersCreator = function(num, level) {
      num = num || this.exerciseNum;
      if (typeof level === "undefined") {
        level = this.level;
      } 
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
          this.randomized = (localStorage.getItem(namespace + "randomized") === 'true')? true: false;
          if (this.modules) { //check for existence of modules property which is contained only by test module
            let str;
            this.unlocked = parseInt(localStorage.getItem(namespace + "unlocked"), 10) || 0;
            str = localStorage.getItem(namespace + "modules");
            this.modules =  str? str.split(",")
              : ["addition", "subtraction", "multiplication", "division", "fractions"];
            str = localStorage.getItem(namespace + "time");
            if (str) {
              this.time = str.split(", ").map(function(value) {
                return parseInt(value, 10);
              });
            } else {
              this.time = [10, 6, 5];
            }
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
    
    fractions: (function () {
      let fractions = objectCreator(Operation.prototype);
      fractions.name = "fractions";
      fractions.sign = "+";
      fractions.container = $("#fractions-exercises");
      fractions.reducer = (accArray, array) => {
        return [accArray[0] * array[1] + array[0] * accArray[1], accArray[1] * array[1]];
      }
      fractions.getNumbers = function (level) {
        const rand = maths.range,
              fraction = (base, max) => [rand(1, max), base];
        let numbers = [], base1, base2;
        switch(level) {
          case 0:
            base1 = rand(2, 4);
            numbers = [fraction(base1, base1 - 1), fraction(base1, base1 - 1)];
            break;
          case 1:
            base1 = rand(2, 4);
            base2 = rand(2, 5);
            if (base1 === base2) {
              numbers = [fraction(base1, base1 - 1), fraction(base2, base2 - 1)];
            } else {
              numbers = [fraction(base1, Math.floor(base1 / 2)), fraction(base2, Math.floor(base2 / 2))];
            }
            break;
          case 2:
            base1 = rand(2, 9);
            base2 = rand(2, 9);
            numbers = [fraction(base1, 2 * base1 - 1), fraction(base2, 2 * base2 - 1)];
            break;
        }
        numbers.push(numbers.reduce(this.reducer));
        return numbers;
      }
      return fractions;
    }()),

    test: (function() {
      let test = objectCreator(Operation.prototype);
      test.name = "test";
      test.container = $("#test");
      test.loaded = false;
      test.modules = [];
      test.time = [10, 6, 5];  //#
      test.unlocked = 0;  //#
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
        content["test info"] = this.info();
        this.results = [];   // reset results array
        for (i = 0; i < max; i += 1) {
          module = maths[this.modules[i]];
          if (module) {
            this.numbers = module.numbersCreator(this.exerciseNum, this.level);
            this.sign = module.sign;  // sign and numbers properties to be used by layout object
            html = maths.layout.main(this); // string containing markup for operations
            if (i === max - 1) {  // add bottom navigation depending on the position in test
              html += maths.layout.testNavigation(false, true);
            } else {
              html += maths.layout.testNavigation(false, false);
            }
            content[module.name] = html; // create property of content object and assign it the markup
          }
        }
        content["summary"] = this.summary;
        maths.accordeon.init($("#test .content"), this.name, content);
        maths.listeners.test(this);
      };

      test.info = function () {
        let html = '<div class="test-interface">';
        html += '<h3 class="center">Level: ' + maths.difficulties[this.level] + '</h3>';
        html += '<h3 class="center">Number of questions: ' + this.modules.length * this.exerciseNum + '</h3>';
        html += '<h3 class="center">Questions per module: ' + this.exerciseNum + '</h3>';
        html += '<h3 class="center">Modules: ';
        this.modules.forEach(function(module) {
          html += maths[module].name + ", ";
        });
        html = html.replace(/,\s$/, "") + '</h3>';
        html += '<h3 class="center">Time to complete: ' + this.time[this.level] + ' minutes</h3>';
        html += '<h2 class="center">GOOD LUCK!</h2>';
        html += maths.layout.testNavigation(true, false);
        html += '</div>';
        return html;
      }

      test.summary = '<div id="test-summary" class="test-interface">' +
        '<div class="test-navigation"><button id="test-close">Close</button></div></div>';

      test.processResults = function(scores, secs) {
        let mods = this.modules, exNums = this.exerciseNum,
            results = [], percs = [],
            sum = points = score = 0,
            minutes, seconds, minutesStr, secondsStr, i,
            unlockMessage = html = '';  
        scores.forEach(function(value, idx) { //calculate results and percentages for each module
          i = (idx + 1) / exNums;
          sum += value;
          if (Number.isInteger(i)) {
            percs[i - 1] = Math.round(sum / exNums * 100);
            results[i - 1] = sum;
            points += sum;
            sum = 0;
          }
        });
        score = Math.round(points / (exNums * mods.length) * 100);
        if (score > 59 && this.unlocked < 2 && this.unlocked === this.level) {
          if (score > 74) {
            unlockMessage = 'Congratulations, You have unlocked next level!';
            this.unlocked = this.level + 1;
            $(".test-level-choice").eq(this.unlocked).prop("disabled", false);
          } else {
            unlockMessage = 'To unlock next level you need to score at least 75%.. Try again';
          }
        }
        seconds = secs % 60;
        minutes = Math.floor(secs / 60);
        minutesStr = (minutes < 1)? "": (minutes === 1)? minutes + ' minute': minutes + ' minutes';
        secondsStr = (seconds === 1)? seconds + ' second': seconds + ' seconds';
        html += (score > 59)?
          '<h2 class="center">Congratulations You Passed!</h2>'
          : '<h2 class="center">You need to practice a bit more!</h2>';
        html += '<h3 class="center">Your score: ' + score + '%</h3>';
        html += '<h3 class="center">Your time: ' + minutesStr + ' ' + secondsStr + '</h3>';
        for (i = 0; i < mods.length; i += 1) {
          html += '<h3 class="center">' + mods[i] + ' score: ' + results[i] + '/' + exNums;
          html += ' (' + percs[i] + '%)</h3>';
        }
        html += '<h3 class="center">Total points: ' + points + '/' + exNums * mods.length + '</h3>';
        html += '<h3 class="center">' + unlockMessage + '</h3>';
        $("#test-summary").prepend(html).css("height", "73vh");;
        maths.listeners.playSound(score > 59);
      };

      test.displayResults = function(scores, secs) {
        this.processResults(scores, secs);
        maths.accordeon.unfold();
        maths.accordeon.scrollTo(this.modules.length + 1);
      };
      return test;
    }()),

    settings: {
      
  
    },

    accordeon: {

      container: $('<div class="accordeon-container"></div>'),
      content: $('<div class="accordeon-content"></div>'),
      dimmer: $('<div class="dim"></div>'),
      closeBtn: null,
      headers: [],
      contents: [],
      first: function() {
        return this.headers[0];
      },
      last: function () {
        return this.headers[this.headers.length - 1];
      },
  
      init: function(parent, title, contentObj) {
        let name;
        this.container.append(this.createTitleBar(title));
        for (name in contentObj) {
          if (contentObj.hasOwnProperty(name)) {
            this.content.append(this.createSection(name, contentObj[name]));
          }
        }
        parent.append(this.container);
        this.container.append(this.content).show();
        this.dimmer.appendTo("body");
        $('.accordeon-section-content').eq(0).show();
        $('.accordeon-section-header').css("border-top", "none"); // nxt...
      },
      createTitleBar: function(title) {
        let bar = $('<div class="accordeon-titlebar"></div>'),
            foo = $('<div class="accordeon-titlebar-foo"></div>');
            barTitle = $('<h4 class="accordeon-titlebar-title">' + title + '</h4>');
        this.closeBtn = $('<button class="accordeon-titlebar-close">&times;</button>');
        this.closeBtn.on("click", () => this.dispose());
        return bar.append(barTitle, foo, this.closeBtn);
      },
      createSection: function(head, cont) {
        let section = $('<div class="accordeon-section"></div>'),
            header = $('<h3 class="accordeon-section-header">' + head + '</h3>'),
            sectionContent = $('<div class="accordeon-section-content">' + cont + '</div>');
        sectionContent.hide();
        this.headers.push(header);
        this.contents.push(sectionContent);
        return section.append(header, sectionContent);
      },
      dispose: function () {
        this.container.empty().hide();
        this.content.empty();
        this.dimmer.remove();
        this.headers = [];
      },
      attachListeners: function () {
        $('.accordeon-section-header').on("click", function() {
          if (!$(this).is(maths.accordeon.last())) {
            maths.accordeon.show(this);
          }
        });
      },
      show: function(header) {
        let content = $(header).next();
        if (content.is(':hidden')) {
          $('.accordeon-section-content').filter(':visible').slideUp();
          content.slideDown();
          header.scrollIntoView();
        }
      },
      unfold: function() {
        this.contents.forEach(function(content){
          content.show();
        });
      },
      scrollTo: function(index) {
        if (!index) {
          throw new Error("couldn't find the header");
        }
        this.headers[index][0].scrollIntoView();
      }
    },

    layout: {

      exercises: function(module) {  
        let num = module.exerciseNum,
            html = "";

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
        module.levelDisplayed = module.level;
        module.container.html(html);
      },

      main: function(module) {
        let num = module.exerciseNum,
            allNumbers = module.numbers, // numbers bank
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
            isFraction = (numbers[j].length > 1);
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
        let number = array[0] / array[1],
            isInteger = Number.isInteger(number),
            modulus = [array[0], array[1]],
            html = '';
        number = Math.floor(number);
        if (number >= 1) {
          html += isAnswer?
            '<div class="close"><input type="text" maxlength="1" class="answer"></div>'
            : '<div class="close">' + number + '</div>';
          if (isInteger) {
            if (isAnswer) {
              results.push(array);
            }
            return html;
          }
          modulus = [array[0] - number * array[1], array[1]];
        } 

        html += '<div class="fraction">'; 
        if (isAnswer) { 
          html += '<div><input type="text" maxlength="3" class="answer"></div>';
          html += '<div class="dash">/</div>';
          html += '<div class="bottom"><input type="text" maxlength="3" class="answer"></div>';
          results.push(array);
        } else {
          html += '<div>' + modulus[0] + '</div>';
          html += '<div class="dash">/</div>';
          html += '<div class="bottom">' + modulus[1] + '</div>';
        }
        html += '</div>';
        return html;
      },

      testNavigation: function(isFirst, isLast) {
        let first = isFirst? "Start": "Prev",
            last = isLast? "Finish": "Next",
            firstClass = isFirst? "accordeon-button-start": "accordeon-button-prev"
            lastClass = isLast? "accordeon-button-finish": "accordeon-button-next",
            html = '<div class="test-navigation">';
        html += '<button class="' + firstClass + '">' + first + '</button>';
        html += isFirst? ""
          : '<button class="' + lastClass + '">' + last + '</button></div>';
        return html;
      }

    },

    range: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),

    listeners: {
      exercises: function (module) {
        let levelChoice = module.container.find(".level"),
            exerciseNumChoice = module.container.find(".exerciseNum"),
            scoreField = module.container.find(".score"),
            score = 0,
            rows = module.container.find(".flex-row"),
            answerFields = module.container.find(".answer"),
            icons = module.container.find(".icon"),
            checkButtons = module.container.find(".check"),
            resetButton = module.container.find(".reset"),
            reloadButton = module.container.find(".reload"),
            checkAllButton = module.container.find(".check-all"),
            answerField, result, icon, checkBtn, answers;
        const goodAnswer = function() {
                scoreField.text(++score);
                answerField.each(function(idx) {
                  $(this).hide().after("<span>" + answers[idx] + "</span>");
                });
                icon.prop("src", maths.tick);
                checkBtn.addClass("invisible");
                return true;
              },
              wrongAnswer = function () {
                icon.prop("src", maths.cross);
                answerField.addClass("warning");
                return false;
              },
              processOperation = function(index) {
                answerField = rows.eq(index).find(".answer");
                icon = icons.eq(index);
                checkBtn = checkButtons.eq(index);
                result = module.results[index];
                answers = [];
                let isCorrect = maths.listeners.validateOperation(answerField, result, answers);
                return isCorrect? goodAnswer(): wrongAnswer();
              };
        levelChoice.on("change", function () {    //options change
          let name = $(this).find("option:selected").text();
          module.setLevel(maths.difficulties.indexOf(name));
        });
        exerciseNumChoice.on("change", function () {
          let number = $(this).find("option:selected").text();
          module.setExerciseNum(parseInt(number, 10));
        });
        checkButtons.on("click", function (e) {   //listeners for all check buttons on page
          e.preventDefault();
          let index = checkButtons.index(this),
              isCorrect = processOperation(index);
          maths.listeners.playSound(isCorrect);
        });
        resetButton.on("click", ()=> {    //reset button
          score = 0;
          scoreField.text(score);
          answerFields.show().removeClass("warning").next().remove();
          icons.prop("src", maths.questMark);
          checkButtons.removeClass("invisible");
        });
        reloadButton.on("click", (e)=> {   //reload button
          e.preventDefault();
          module.init();
        });
        checkAllButton.on("click", (e) => {
          e.preventDefault();
          checkButtons.each(function(index, btn) {
            if (!$(btn).is(".invisible")) {
              processOperation(index);
            }
          });
        });
        this.textInputs(rows, answerFields, processOperation);  //add input fields filtering
      },

      validateOperation: function (answerFields, result, answers) {   //validates single operation
        let fraction = [],
            input;
        answers = answers || [];
        answerFields.each(function(idx) {  //collect answer(s) and check if they're not empty
          input = $(this).val();
          if (input === "") {
            return false;
          }
          answers.push(parseInt(input, 10));
        });
        if (result.length) {  //if dealing with fractions convert answers to simple fractions
          if (answers.length === 1) {
            fraction = [answers[0], 1]; 
          }
          if (answers.length === 2) {
            fraction = answers;
          }
          if (answers.length === 3) { 
            fraction = [answers[0] * answers[2] + answers[1], answers[2]];
          }
        }
        if (fraction.length === 0) {  // if not a fraction
          return (answers[0] === result)? true: false;
        } else {  // if a fraction
          return (fraction[0] / fraction[1] === result[0] / result[1])? true: false;
        }
      },

      playSound: function(isCorrect) {
        let cheer = new Audio("sounds/cheering.wav"),
            wrong = new Audio("sounds/fart.wav");
        if (isCorrect) {
          cheer.currentTime = 0.5;
          cheer.volume = 0.2;
          cheer.play();
          setTimeout(() => {
            cheer.pause();
          }, 2000);
        } else {
          wrong.play();
        }
      },

      test: function(module) {
        let rows = module.container.find(".flex-row"),
            answerFields = module.container.find(".answer"),
            prevBtn = module.container.find('.accordeon-button-prev'),
            nextBtn = module.container.find('.accordeon-button-next'),
            startBtn = module.container.find('.accordeon-button-start'),
            finishBtn = module.container.find('.accordeon-button-finish'),
            headers = module.container.find('.accordeon-section-header'),
            closeBtn = maths.accordeon.closeBtn;
            closeBtn2 = $("#test-close");
            lastFocusableElements = $(startBtn).add(nextBtn).add(finishBtn).add(closeBtn).add(closeBtn2);

        const processTest = function() {
          let scores = []
              icons = module.container.find(".icon"),
              results = module.results;
          const wrongAnswer = function(index) {
            scores[index] = 0;
            rows.eq(index).find(".answer").addClass("warning");
            icons.eq(index).prop("src", maths.cross);
          };
          const correctAnswer = function(index) {
            scores[index] = 1;
            rows.eq(index).find(".answer").addClass("correct");
            icons.eq(index).prop("src", maths.tick);
          };
          rows.each(function(idx, row) {
            let fields = $(row).find(".answer"),
                result = module.results[idx];
                isCorrect = maths.listeners.validateOperation(fields, result);
            if (isCorrect) {
              correctAnswer(idx);
            } else {
              wrongAnswer(idx);
            }
          });
          return scores;
        };
        startBtn.on("click", function() {
          if ($(this).text() === "Start") {
            let ns = maths.test;
            maths.timer.init($('.accordeon-titlebar-foo'), ns.time[ns.level], ns.summary);
            maths.accordeon.attachListeners();
            $(this).text("Next");
          }
          maths.accordeon.show(headers.eq(1));
        });
        prevBtn.on("click", function() {
          let index = prevBtn.index(this);
          maths.accordeon.show(headers.eq(index));
        });
        nextBtn.on("click", function() {
          let index = nextBtn.index(this);
          maths.accordeon.show(headers.eq(index + 2));
        });
        finishBtn.on("click", function() {
          let scores = processTest();
          answerFields.prop("disabled", "true");
          $(startBtn).add(prevBtn).add(nextBtn).add(finishBtn).hide();
          maths.test.displayResults(scores, maths.timer.stop());
        });
        closeBtn2.on("click", ()=> maths.accordeon.dispose());
        lastFocusableElements.on("keydown", function(e) { // keep focus inside the dialog container
          if (e.which === 9) {
            if (e.shiftKey) {
              if ($(this).is(closeBtn)) {
                lastFocusableElements.filter(":visible").focus();
                e.preventDefault();
              }
            } else if (!$(this).is(closeBtn)) {
              closeBtn.focus();
              e.preventDefault();
            }
          }
        });
        this.textInputs(rows, answerFields);  // add input fields filtering
      },

      textInputs: function(rows, answerFields, callback) { //input filtering for answer fields
        answerFields.on("paste", () => false);
        answerFields.on("blur", function() {
          field = $(this);
          if (field.val() === "") {
            let parent = field.removeClass("warning").parents(".flex-row");
            let fields = parent.find(".answer");
            if (fields.length > 1) {  // only if a fraction
              if (fields.not(field).val() !== "") {
                return;
              }
            }
            parent.find(".icon").prop("src", maths.questMark);
          }
        });
        answerFields.on("keydown", function (e) {
          let row = $(this).parents(".flex-row"),
              index = rows.index(row),
              isFraction = row.find(".answer").length > 1;
              char = String.fromCharCode(e.which),
              length = $(this).val().length;
              limit = 3;
          if (isFraction) { // adjust variables if fraction
            limit = 2;
          }
          if ((window.getSelection().toString() !== "") && ($.isNumeric(char) ||
            (e.which > 95 && e.which < 106))) {
            return true; //allow replacing selection with numbers
          }
          if (e.which === 8 || e.which === 9 || e.which === 46 || e.which === 37 || e.which === 39) {
            return true; //allow backspace, tab, delete, left and right arrow
          }
          if ((e.which > 95) && (e.which < 106) && (length < limit)) {
            return true; //allow numeric keyboard
          }
          if (e.which === 13 && typeof callback === "function") {
            let isCorrect = callback(index); // check line when "enter" pressed
            maths.listeners.playSound(isCorrect);
            return false;
          }
          if (!$.isNumeric(char) || (length === limit)) {
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
      init: function (parent, time, callback) {
        parent.append(this.container);
        if (this.setTimer !== null) {
          this.stop();
        }
        this.start(time, callback);
      },
      state: function () {
        return "<b>" + this.minutes + ":" + this.seconds + "</b>"
      },
      show: function () {
        this.container.html(this.state());
      },
      setTimer: null,
      start: function (minutes, callback) {
        var count = minutes * 60;
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
        return this.secondsElapsed;
      }

    }
      
  };

});
