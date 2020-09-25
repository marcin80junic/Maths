
export interface mathOperation {
  container: JQuery,
  name: string,
  sign: string,
  level: number,
  exerciseNum: number,
  levelDisplayed: number,

  init: any,  //prototype
  numbersCreator: any,  //prototype
  getNumbers?: any,   //not in test
  reducer?: any,    //not in test
  simpleReducer?: any,  //only in fractions
  numbers: Array<number> | Array<Array<number>>,
  results: Array<number> | Array<Array<number>>,
  answersIdxs: Array<number>,

  modules?: Array<mathOperation>,  // only test
  times?: Array<string>,  // only test
  unlocked?: number,  // only test
  createTest?: any,   // only test
  info?: any,   // only test
  summary?: string,   // only test
  displayResults?: any,  // only test

  loadSettings: any,  //prototype
  setLevel: any,  //prototype
  setExerciseNum: any,  //prototype
  saveSettings: any   //prototype
}

export interface mainObject {
  isTouchscreen: boolean,
  noTouchClass: string,
  icons: any,
  sounds: any,
  difficulties: Array<string>,
  numOfExercises: Array<string>,

  active: JQuery,

  switch: any,
  playSound: any,
  createAndAppendCanvas: any,
  range: any,

  home: unknown,
  addition?: mathOperation,
  subtraction?: mathOperation,
  multiplication?: mathOperation,
  division?: mathOperation,
  fractions?: mathOperation,

  test: any,
  dialog: any,
  accordion: any,
  timer: any,

  layout: any,
  handlers: any,
  settings: any
}

export interface content {
  info: string
}