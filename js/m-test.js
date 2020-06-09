
maths.test = (function() {
    let test = objectCreator(Operation.prototype);
    test.name = "test";
    test.container = $("#test");
    test.tooltips = false;
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
      this.answersIdxs = [];  // and indexes of answers
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
      maths.handlers.test(this);
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
      maths.playSound(score > 59);
    };

    test.displayResults = function(scores, secs) {
      this.processResults(scores, secs);
      maths.accordeon.unfold();
      maths.accordeon.scrollTo(this.modules.length + 1);
    };
    return test;
  }());


  maths.accordeon = {

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
      let content = header.next();
      if (content.is(':hidden')) {
        $('.accordeon-section-content').filter(':visible').slideUp();
        content.slideDown();
        header[0].scrollIntoView();
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
  };


  maths.timer = {
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

  };