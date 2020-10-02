
import $ from 'jquery';
import type { mainObject } from './types';
import { MathOperation } from './m01-prototype';
import * as operations from './m02-operations';
import { test } from './m04-test';
import { layout } from './m05-layout';
import { handlers } from './m06-handlers';
import { settings } from './m07-settings';
import { dialog } from './m08-dialog';
import { accordion } from './m09-accordion';
import { timer } from './m10-timer';
import { canvas } from './m11-canvas';
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

  isTouchscreen: "ontouchstart" in document.documentElement,
  noTouchClass: (function() {
    return ("ontouchstart" in document.documentElement)? '': 'no-touch'
  }()),

  icons: {
    tick: tick,
    cross: cross,
    questMark: questMark,
    volumeMuted: volumeMuted,
    volumeLow: volumeLow,
    volumeMedium: volumeMedium,
    volumeHigh: volumeHigh
  },

  signMap: new Map([
    ["addition", MathOperation.ADDITION_SIGN],
    ["subtraction", MathOperation.SUBTRACTION_SIGN],
    ["multiplication", MathOperation.MULTIPLICATION_SIGN],
    ["division", MathOperation.DIVISION_SIGN]
  ]),

  sounds: {
    cheer: null,
    wrong: null,
    getCheer: function() {
      if (!this.cheer) {
        this.cheer = new Audio(cheer);
      }
      return this.cheer;
    },
    getWrong: function() {
      if (!this.wrong) {
        this.wrong = new Audio(wrong);
      }
      return this.wrong;
    }
  },

  difficulties: ["Fair", "Advanced", "Super Hard"],

  numOfExercises: ["6", "8", "10", "12", "16", "20", "24"],

  active: $("#home"),

  switch: function (id: string) {     // id argument comes from href property of clicked navigation menu link
    let moduleName: string = id.replace("#", ""),
        module = this[moduleName];    // obtain actual object which is a property of maths

    this.active = $(id);              // matches the id of maths modules (divs)

    if (!this.settings.areLoaded) {   // initialize settings module if needed
      this.settings.init();
    }
    if (module instanceof MathOperation) {
      if (module.level !== module.levelDisplayed) {   // initialize module if it's an instance of..
        module.init();    //..MathOperation class (excludes settings test and home). Only when loaded first time.. 
      }                   //..the levelDisplayed is -1 and will not match the module's level property
    } else if (moduleName === "test") {
      if (!this.test.isLoaded) {
        this.test.init();
      }
    }
    this.active.scrollTop(0);
  },

  playSound: function (isCorrect: boolean, volume: number) {
    let cheer = this.sounds.getCheer(),
      wrong = this.sounds.getWrong();
    if (volume !== 0) {     // if called while adjusting settings the volume arg will have a value otherwise..
      volume = volume || maths.settings.system.volume;  //..it will be undefined so use stored setting value
    } else {                // only if volume is muted while adjusting in settings
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

  home: {},

  addition: new operations.Addition(
    $('#addition-exercises'),
    'addition',
    MathOperation.ADDITION_SIGN
  ),

  subtraction: new operations.Subtraction(
    $("#subtraction-exercises"),
    "subtraction",
    MathOperation.SUBTRACTION_SIGN
  ),

  multiplication: new operations.Multiplication(
    $("#multiplication-exercises"),
    "multiplication",
    MathOperation.MULTIPLICATION_SIGN
  ),

  division: new operations.Division(
    $("#division-exercises"),
    "division",
    MathOperation.DIVISION_SIGN
  ),

  fractions: new operations.Fractions(
    $("#fractions-exercises"),
    "fractions",
    [
      MathOperation.ADDITION_SIGN,
      MathOperation.SUBTRACTION_SIGN,
      MathOperation.MULTIPLICATION_SIGN,
      MathOperation.DIVISION_SIGN
    ]
  ),

  test: test,
  dialog: dialog,
  accordion: accordion,
  timer: timer,
  layout: layout,
  handlers: handlers,
  createAndAppendCanvas: canvas,
  settings: settings
  
}