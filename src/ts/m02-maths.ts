import type { mainObject, mathOperation } from './types';
import $ from 'jquery';
import { Operation } from './m01-prototype';
import * as operations from './m03-operations';
import { test } from './m04-test';
import { layout } from './m05-layout';
import { handlers } from './m06-handlers';
import { settings } from './m07-settings';
import { dialog } from './m08-dialog';
import { accordion } from './m09-accordion';
import { timer } from './m10-timer';
import tick from '../../public/pics/correct.png';
import cross from '../../public/pics/wrong.png';
import questMark from '../../public/pics/question.png';
import volumeMuted from '../../public/pics/speaker-muted.png';
import volumeLow from '../../public/pics/speaker-low-volume.png';
import volumeMedium from '../../public/pics/speaker-medium-volume.png';
import volumeHigh from '../../public/pics/speaker-high-volume.png';
import cheer from '../../public/sounds/cheering.mp3';
import wrong from '../../public/sounds/fart.mp3';


/*
  *define global application object
*/

export const maths: mainObject = {

  icons: {
    tick: tick,
    cross: cross,
    questMark: questMark,
    volumeMuted: volumeMuted,
    volumeLow: volumeLow,
    volumeMedium: volumeMedium,
    volumeHigh: volumeHigh
  },

  sounds: {
    cheer: new Audio(cheer),
    wrong: new Audio(wrong)
  },

  difficulties: ["Fair", "Advanced", "Super Hard"],

  numOfExercises: ["6", "8", "10", "12", "16", "20", "24"],

  active: $("#home"),

  switch: function (id: string) { // id argument comes from href property of clicked navigation menu link
    let moduleName: string = id.replace("#", ""),
        module = this[moduleName];  // obtain actual object which is a property of maths

    this.active = $(id);  // matches the id of maths modules (divs)

    if (!this.settings.areLoaded) {   //initialize settings module if needed
      this.settings.init();
    }
    if (Operation.prototype === Object.getPrototypeOf(module)) {
      if (module.level !== module.levelDisplayed) {   // initialize module if it's an instance of..
        module.init();  //..Operation class (excludes settings test and home). Only when loaded first time.. 
      }                 //..the levelDisplayed is -1 and will not match the module's level property
    } else if (moduleName === "test") {
      if (!this.test.isLoaded) {
        this.test.init();
      }
    }

    this.active.scrollTop(0);
  },

  range: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min),

  playSound: function (isCorrect: boolean, volume: number) {
    let cheer = this.sounds.cheer,
      wrong = this.sounds.wrong;
    if (volume !== 0) { // if called while adjusting settings the volume arg will have a value otherwise..
      volume = volume || maths.settings.system.volume;  //..it will be undefined so use stored setting value
    } else {  // only if volume is muted while adjusting in settings
      cheer.pause();
      return;
    }
    if (isCorrect) {
      cheer.currentTime = 0.5;
      cheer.volume = volume;
      cheer.play();
    } else {
      wrong.volume = volume;
      wrong.play();
    }
  },

  createAndAppendCanvas: function (parent: JQuery, module: mathOperation, index: number) {
    let numbers: any = module.numbers[index],
      answerIdx = module.answersIdxs[index],
      sign = module.sign,
      i: number,
      temp: Array<number> = [],
      scd: number,
      nums = (answerIdx !== numbers.length - 1) ?
        transform()                             // transform the pattern if answer index is not last
        : numbers.slice(0, numbers.length - 1),       // otherwise only cut off the answer
      factor = $('body').width() / ($('body').width() / 80), // calculate width factor
      width = calculateWidth(factor),               // calculate width according to the window width
      canvas = <HTMLCanvasElement>$('<canvas class="canvas" width="' + width + 'px" height="80px"></canvas>')[0],
      c: CanvasRenderingContext2D = canvas.getContext("2d");
    const rads = (x: number) => Math.PI * x / 180;

    if (nums[0].length === 2) {   // find common denominator for fractions
      scd = findSCD(nums[0][1], nums[1][1]);
    }
    parent.width(width);  //set size of tooltip container
    c.fillStyle = "red";
    c.lineWidth = 0.5;
    c.font = "30px sans-serif";   // font only used for signs
    c.translate(40, 40);  // center of first circle

    for (i = 0; i < nums.length; i += 1) {
      if (nums[i].length === 2) {
        nums[i] = [nums[i][0] * (scd / nums[i][1]), scd]; //transform fractions so they have common denominator
        drawFraction(c, nums[i]);
      } else {
        drawInteger(nums[i]);
      }
      if (i < nums.length - 1) {
        drawSign(sign);
        c.translate(57, 0);
      } else {
        drawSign("=");
        c.translate(50, 0);
        drawIcon(maths.icons.questMark);
      }
    }

    function calculateWidth(factor: number) {   // # needs to be changed so it considers integers as well
      let sum: number = 1,
        whole: number,
        i: number,
        j: number;
      for (i = 0; i < nums.length; i += 1) {
        if (nums[i].length === 2) {
          whole = nums[i][0] / nums[i][1];
          for (j = 0; j < whole; j += 1) {
            sum += 1;
          }
        }
      }
      return sum * factor;
    }

    function transform() {
      switch (sign) {  // if transforming addition and multiplication the sign needs to be changed
        case "+": sign = "-"; break;
        case "\u00D7": sign = "\u00F7"; break;
      }
      for (i = numbers.length - 1; i >= 0; i--) {
        if (i !== answerIdx) temp.push(numbers[i]);  // reverse the order and leave the answer off
      }
      return temp;
    }

    function findSCD(den1: number, den2: number) { // find smallest common denominator
      let i: number,
        temp: number,
        smaller = (den1 < den2) ? den1 : den2,
        greater = (den1 > den2) ? den1 : den2;
      if (den2 === den1) return den1;
      if (greater % smaller === 0) return greater;
      else {
        for (i = 2; i <= greater; i++) {
          temp = i * smaller;
          if (temp > greater) {
            if (temp % greater === 0) return temp;
          }
        }
      }
    }

    function drawFraction(c: CanvasRenderingContext2D, nums: Array<number>) {
      let whole: number,
        leftOver: number,
        i: number;
      if (nums[0] >= nums[1]) {
        whole = Math.floor(nums[0] / nums[1]);
        leftOver = nums[0] % nums[1];
        for (i = 0; i < whole; i += 1) {
          drawCircle(c, nums[1], nums[1]);
          if (i < whole - 1) c.translate(70, 0)
          if (leftOver && i === whole - 1) {
            c.translate(70, 0);
            drawCircle(c, leftOver, nums[1]);
          }
        }
      } else {
        drawCircle(c, nums[0], nums[1]);
      }
      function drawCircle(c: CanvasRenderingContext2D, numerator: number, denominator: number) {
        let advance: number = 360 / denominator,
          startAngle: number = -90,
          endAngle: number = -90,
          i: number;
        for (i = 1; i <= denominator; i += 1) {
          endAngle += advance;
          c.beginPath();
          c.moveTo(0, 0);
          c.arc(0, 0, 30, rads(startAngle), rads(endAngle), false);
          if (i <= numerator) {
            c.fill();
          }
          c.closePath();
          c.stroke();
          startAngle = endAngle;
        }
      }
    }

    function drawInteger(num: number) {

    }

    function drawSign(sign: string) {
      c.fillStyle = "black";
      c.translate(40, 0);
      c.fillText(sign, 0, 11);
      c.fillStyle = "red";
    }
    function drawIcon(path: string) {
      c.translate(-25, -15);
      var img = document.createElement("img");
      img.src = path;
      c.drawImage(img, 0, 0);
    }

    return parent.append(canvas);
  },


  home: {},
  addition: operations.addition,
  subtraction: operations.subtraction,
  multiplication: operations.multiplication,
  division: operations.division,
  fractions: operations.fractions,
  test: test,
  dialog: dialog,
  accordion: accordion,
  timer: timer,
  layout: layout,
  handlers: handlers,
  settings: settings

};