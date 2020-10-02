
import { MathOperation } from "./m01-prototype";

export interface mainObject {
  isTouchscreen: boolean,
  noTouchClass: string,
  icons: any,
  sounds: any,
  difficulties: Array<string>,
  numOfExercises: Array<string>,
  signMap: Map<string, string>,

  active: JQuery,

  switch: any,
  playSound: any,
  createAndAppendCanvas: any,

  home: unknown,
  addition?: MathOperation,
  subtraction?: MathOperation,
  multiplication?: MathOperation,
  division?: MathOperation,
  fractions?: MathOperation,

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