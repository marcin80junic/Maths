import * as $ from 'jquery';
import { Operation, objectCreator } from './m1-prototype';
import { maths } from './m2-resources';
import type { mainObject, mathOperation, content } from './types';


export const test = (function() {

    let test: mathOperation = objectCreator(Operation.prototype);

    test.container = $("#test");

    test.name = "test";

    /* following properties will be initialized during module init below */
    test.modules = [];
    test.times = [];
    test.exerciseNum = 0;
    test.unlocked = 0;

    test.init = function() {  // override prototype's init property
      let choiceButtons = $(".test-level-choice");

      this.modules = maths.settings.test.modules.split(",");
      this.times = maths.settings.test.times.split(",");
      this.exerciseNum = parseInt(maths.settings.test.exerciseNum);
      this.unlocked = parseInt(maths.settings.test.unlocked);
      
      choiceButtons.each(function (index) {   // initialize level choice buttons
        if (index <= maths.test.unlocked) $(this).prop("disabled", false);
        else $(this).prop("disabled", true);
      });

      if (this.levelDisplayed === -1) {
        choiceButtons.on("click", function (e) {
          maths.test.level = choiceButtons.index(this);
          test.createTest();
          });
        this.levelDisplayed = this.level;
      }
    };

    test.createTest = function() {
      let module: mathOperation,
          max = this.modules.length,
          content: content = {
            info: this.info()
          },
          html = "";

      this.results = [];   // reset results array
      this.answersIdxs = [];  // and indexes of answers
      for (let i = 0; i < max; i += 1) {
        module = maths[this.modules[i].name as keyof mainObject];
        if (module) {
          this.numbers = module.numbersCreator(this.exerciseNum, this.level);
          this.sign = module.sign;  // sign and numbers properties to be used by layout object
          html = maths.layout.main(this); // string containing markup for operations
          if (i === max - 1) {  // add bottom navigation depending on the position in test
            html += maths.layout.testNavigation(false, true);
          } else {
            html += maths.layout.testNavigation(false, false);
          }
          content[module.name as keyof content] = html; // create property of content object and assign it the markup
        }
      }
      content["summary" as keyof content] = this.summary;
      maths.accordion.init($("#test .content"), this.name, content);
      maths.handlers.test(this);
    };

    test.info = function () {
      let html = `<div class="test-interface">';
                    <h3 class="center">Level: ${maths.difficulties[this.level]}</h3>
                    <h3 class="center">Number of questions: ${this.modules.length * this.exerciseNum}</h3>
                    <h3 class="center">Questions per module: ${this.exerciseNum}</h3>
                    <h3 class="center">Modules: `;
      this.modules.forEach(function(module: mathOperation) {
        html += module.name + ", ";
      });
      html = html.replace(/,\s$/, "") + '</h3>';  // remove last coma
      html += `<h3 class="center">Time to complete: ${this.times[this.level]} minutes</h3>
               <h2 class="center">GOOD LUCK!</h2>
               ${maths.layout.testNavigation(true, false)}
              </div>`;
      return html;
    };
    test.summary = '<div id="test-summary" class="test-interface">' +
      '<div class="test-navigation"><button id="test-close">Close</button></div></div>';

    test.displayResults = function(scores: Array<number>, secs: number) {
      let mods = this.modules,
          exNums: number = this.exerciseNum,
          results: Array<number> = [],
          percs: Array<number> = [],
          sum = 0,
          points = 0,
          score = 0,
          minutes: number,
          seconds: number,
          minutesStr: string,
          secondsStr: string,
          i: number,
          unlockMessage = '',
          html = '';

      const processResults = ()=> {
          scores.forEach(function(value: number, idx: number) { //calculate results and percentages for each module
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
              maths.settings.accessStorage({unlocked: this.level + 1}, "maths.settings.test.", true);
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
          html += `<h3 class="center">Your score: ${score}%</h3>
                   <h3 class="center">Your time: ${minutesStr} ${secondsStr}</h3>`;
          for (i = 0; i < mods.length; i += 1) {
            html += `<h3 class="center">${mods[i]} score: ${results[i]}/${exNums} (${percs[i]}%)</h3>`;
          }
          html += `<h3 class="center">Total points: ${points}/${exNums * mods.length}</h3>
                   <h3 class="center">${unlockMessage}</h3>`;
          $("#test-summary").prepend(html).css("height", "73vh");;
          maths.playSound(score > 59);
        };

      processResults();
      maths.accordion.unfold();
      maths.accordion.scrollTo(this.modules.length + 1);
    };

    return test;

  }());


  export const accordion = {

    container: $('.accordion'),
    content: $('<div class="test-accordeon-content"></div>'),
    dimmer: $('#dim'),
    closeBtn: null as JQuery,
    headers: [] as Array<JQuery>,
    contents: [] as Array<JQuery>,
    first: function() {
      return this.headers[0];
    },
    last: function () {
      return this.headers[this.headers.length - 1];
    },

    init: function(parent: JQuery, title: string, contentObj: content) {
      this.container.append(this.createTitleBar(title));
      for (const name in contentObj) {
        if (contentObj.hasOwnProperty(name)) {
          this.content.append(this.createSection(name, contentObj[name as keyof content]));
        }
      }
      parent.append(this.container);
      this.container.append(this.content).show();
      this.dimmer.addClass('active');
      this.headers[0].addClass("selected");
      $('.test-accordeon-section-content').eq(0).show();
      $('.test-accordeon-section-header').css("border-top", "none");
    },
    createTitleBar: function(title: string) {
      let bar = $('<div class="test-accordeon-titlebar"></div>'),
          foo = $('<div class="test-accordeon-titlebar-foo"></div>'),
          barTitle = $('<h4 class="test-accordeon-titlebar-title">' + title + '</h4>');
      this.closeBtn = $('<button class="test-accordeon-titlebar-close">&times;</button>');
      this.closeBtn.on("click", () => this.dispose());
      return bar.append(barTitle, foo, this.closeBtn);
    },
    createSection: function(head: string, cont: string) {
      let section = $('<div class="test-accordeon-section"></div>'),
          header = $('<button class="test-accordeon-section-header">' + head + '</button>'),
          sectionContent = $('<div class="test-accordeon-section-content">' + cont + '</div>');
      sectionContent.hide();
      this.headers.push(header);
      this.contents.push(sectionContent);
      return section.append(header, sectionContent);
    },
    dispose: function () {
      this.container.empty().hide();
      this.content.empty();
      this.dimmer.removeClass('active');
      this.headers = [];
    },
    attachListeners: function () {
      $('.test-accordeon-section-header').on("click", function() {
        if (!$(this).is(maths.accordion.last())) {
          maths.accordion.show(this);
        }
      });
    },
    show: function(header: HTMLElement, index: number) {
      let $header = $(header),
          $content = $header.next();
      if ($content.is(':hidden')) {
        this.headers.forEach((val: JQuery)=> val.removeClass("selected"));
        $('.test-accordeon-section-content:visible').slideUp();
        $content.slideDown();
        $header.addClass("selected");
        if (index > this.headers.length / 2) this.content.scrollTop(99)
        else this.content.scrollTop(0);
      }
    },
    unfold: function() {
      this.contents.forEach(function(content: JQuery){
        content.show();
      });
    },
    scrollTo: function(index: number) {
      if (!index) {
        throw new Error("couldn't find the header");
      }
      this.headers.forEach((val: JQuery) => val.removeClass("selected"));
      this.headers[index].addClass("selected");
      this.headers[index][0].scrollIntoView();
    }
  };


  export const timer = {
    container: $('<div class="timer"></div>'),
    minutes: "00",
    seconds: "00",
    secondsElapsed: 0,
    init: function (parent: JQuery, time: number, callback: Function) {
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
    setTimer: null as any,
    start: function (minutes: number, callback: Function) {
      let count = minutes * 60,
          seconds = count % 60;
      minutes = Math.floor(count / 60);
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