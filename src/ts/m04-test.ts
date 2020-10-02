import $ from 'jquery';
import { MathOperation } from './m01-prototype';
import { maths } from './m03-maths';
import type { content } from './types';


export const test = {

  container: $(".dialog-body"),
  name: "test",
  isLoaded: false,

  /* following properties will be initialized during module init below */
  moduleNames: [],
  times: [],
  numOfQuest: 0,
  unlocked: 0,
  level: 0,
  /* to be initialized during test creation */
  modules: [],

  init: function () { 
    let choiceButtons = $(".test-level-choice"),
        ns = maths.settings.test;
  
    this.moduleNames = ns.modules.split(",");
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
    let module: MathOperation,
        testContainer: any,
        sign: any,
        html: string;
    const testContent = { info: this.info() },
          max = this.moduleNames.length;
        
    this.modules = [];

    for (let i = 0; i < max; i += 1) {

      sign = (this.moduleNames[i] === "fractions")?
              maths[this.moduleNames[i]].sign
              : maths.signMap.get(this.moduleNames[i]);
      // create new module object
      module = maths[this.moduleNames[i]].constructor(this.container, this.moduleNames[i], sign);
      module.numbersBank = module.generateOperations(this.numOfQuest, this.level);  // generate operations
      module.answersMap = new Map();              // answersMap needs to be initialized manually in test
      html = maths.layout.main(module, true);     // string containing markup for operations
      html += (i === max - 1)?                    // add bottom navigation depending on the position in test
                maths.layout.testNavigation(false, true)      // buttons `prev` and `finish`
                : maths.layout.testNavigation(false, false);  // buttons `prev` and `next`
      testContent[module.name as keyof content] = html;       // create property of content object...
      this.modules.push(module);                              // add module to test database

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
    return `<div class="test-interface">
              <h3 class="center">Level: ${ maths.difficulties[this.level] }</h3>
              <h3 class="center">Number of questions: ${ this.moduleNames.length * this.numOfQuest }</h3>
              <h3 class="center">Questions per module: ${ this.numOfQuest }</h3>
              <h3 class="center">Modules: ${ this.moduleNames.join(', ') }</h3>
              <h3 class="center">Time to complete: ${ this.times[this.level] } minutes</h3>
              <h2 class="center">GOOD LUCK!</h2>
              ${maths.layout.testNavigation(true, false)}
            </div>`;
  },

  summary: `<div id="test-summary" class="test-interface">
              <div class="test-navigation">
                <button id="test-close" class="form-element button3d">Close</button>
              </div>
            </div>`,

  displayResults: function (secs: number) {
    let mods = this.moduleNames,
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
      html += `<h3 class="center">Total points: ${points}/${exNums * mods.length}</h3>`
      html += unlockMessage? `<h3 class="center">${unlockMessage}</h3>`: '';
      $("#test-summary").prepend(html);
      maths.playSound(score > 59);
    };

    processResults();
    maths.accordion.unfold();
    maths.accordion.showSummary();
  }

}


