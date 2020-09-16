import $ from 'jquery';
import { maths } from './m02-maths';
import type { mathOperation, content } from './types';


export const test = {

  container: $("#test"),
  name: "test",
  isLoaded: false,
  results: [],

  /* following properties will be initialized during module init below */
  modules: [],
  times: [],
  numOfQuest: 0,
  unlocked: 0,
  level: 0,

  init: function () { 
    let choiceButtons = $(".test-level-choice"),
        ns = maths.settings.test;
  
    this.modules = ns.modules.split(",");
    this.times = ns.times.split(",");
    this.numOfQuest = parseInt(ns.numOfQuest);
    this.unlocked = parseInt(ns.unlocked);
    
    choiceButtons
      .each(function (index) {   // enable level choice buttons
        $(this).prop("disabled", (index <= maths.test.unlocked)? false: true);
      })
      .off()
      .on("click", function (e) {  // handler for level choice buttons
        maths.test.level = choiceButtons.index(this);
        maths.test.createTest();
      });
    this.isLoaded = true;
  },

  createTest: function () {
    let module: mathOperation,
        max = this.modules.length,
        testContent: content = {
          info: this.info()
        },
        testContainer: any,
        html = "";

    this.results = [];      // reset results array
    this.answersIdxs = [];  // and indexes of answers

    for (let i = 0; i < max; i += 1) {
      module = maths[this.modules[i]];
      if (module) {
        this.numbers = module.numbersCreator(this.numOfQuest, this.level);
        this.sign = module.sign;        // sign and numbers properties to be used by layout object
        html = maths.layout.main(this); // string containing markup for operations
        if (i === max - 1) {            // add bottom navigation depending on the position in test
          html += maths.layout.testNavigation(false, true);
        } else {
          html += maths.layout.testNavigation(false, false);
        }
        testContent[module.name as keyof content] = html; // create property of content object 
      }                                                       // and assign the markup
    }
    testContent["summary" as keyof content] = this.summary;
    testContainer = maths.accordion.init(testContent);
    maths.dialog.init(testContainer, {
      title: "test",
      custom: maths.timer.getTimer(parseInt(this.times[this.level], 10)),
      callback: () => maths.accordion.dispose()
    });
    maths.handlers.test(testContainer);
  },

  info: function () {
    let html = `<div class="test-interface">
                  <h3 class="center">Level: ${maths.difficulties[this.level]}</h3>
                  <h3 class="center">Number of questions: ${this.modules.length * this.numOfQuest}</h3>
                  <h3 class="center">Questions per module: ${this.numOfQuest}</h3>
                  <h3 class="center">Modules: `;
    this.modules.forEach(function (module: mathOperation) {
      html += module.name + ", ";
    });
    html = html.replace(/,\s$/, "") + '</h3>';  // remove last coma
    html += `<h3 class="center">Time to complete: ${this.times[this.level]} minutes</h3>
               <h2 class="center">GOOD LUCK!</h2>
               ${maths.layout.testNavigation(true, false)}
              </div>`;
    return html;
  },

  summary: `<div id="test-summary" class="test-interface">'
              <div class="test-navigation">
                <button id="test-close" class="form-element button3d">Close</button>
              </div>
            </div>`,

  displayResults: function (scores: Array<number>, secs: number) {
    let mods = this.modules,
        exNums: number = this.numOfQuest,
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

    const processResults = () => {
      scores.forEach(function (value: number, idx: number) { //calculate results and percentages for each module
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
          maths.settings.accessStorage({ unlocked: this.level + 1 }, "maths.settings.test.", true);
        } else {
          unlockMessage = 'To unlock next level you need to score at least 75%.. Try again';
        }
      }
      seconds = secs % 60;
      minutes = Math.floor(secs / 60);
      minutesStr = (minutes < 1) ? "" : (minutes === 1) ? minutes + ' minute' : minutes + ' minutes';
      secondsStr = (seconds === 1) ? seconds + ' second' : seconds + ' seconds';
      html += (score > 59) ?
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
  }

}


