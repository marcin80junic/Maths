/*
  *define global application object which contains:
  ...
*/

let maths: mainObject = {

    icons: {
      tick: "pics/correct.png",
      cross: "pics/wrong.png",
      questMark: "pics/question.png"
    },

    sounds: {
      cheer: new Audio("sounds/cheering.wav"),
      wrong: new Audio("sounds/fart.wav")
    },

    difficulties: ["Fair", "Advanced", "Super Hard"],

    numOfExercises: ["6", "8", "10", "12", "16", "20", "24"],

    active: $("#home"),

    switch: function (id: string) { // id argument comes from href property of clicked navigation menu link
      let moduleName: string = id.replace("#", ""),
          module = this[moduleName];  // obtaining actual object which is a property of maths
      this.active = $(id);  // matches the id of maths modules (divs)
      if (!this.settings.areLoaded) this.settings.init(); //initialize settings module if needed
      if (Operation.prototype === Object.getPrototypeOf(module)) {
        if (module.level !== module.levelDisplayed) {
          module.init();  // initialize module if it's an instance of..
        }    //..Operation class(excludes settings and home). Only when loaded first time..       
      }   //..the levelDisplayed is -1 and will not match the module's level property
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

    createAndAppendCanvas: function(parent: JQuery, module: Operation, index: number) {
      let numbers: any = module.numbers[index],
          answerIdx = module.answersIdxs[index], 
          sign = module.sign,
          i: number,
          temp: Array<number> = [],
          scd: number,
          nums = (answerIdx !== numbers.length - 1)?  
            transform()                             // transform the pattern if answer index is not last
            : numbers.slice(0, numbers.length - 1),       // otherwise only cut off the answer
          factor = $('body').width() / ($('body').width() / 80), // calculate width factor
          width = calculateWidth(factor),               // calculate width according to the window width
          canvas = <HTMLCanvasElement> $('<canvas class="canvas" width="'+ width + 'px" height="80px"></canvas>')[0],
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
        switch(sign) {  // if transforming addition and multiplication the sign needs to be changed
          case "+": sign = "-"; break;
          case "\u00D7": sign = "\u00F7"; break;
        }
        for (i = numbers.length - 1; i >=0 ; i--) {
          if (i !== answerIdx) temp.push(numbers[i]);  // reverse the order and leave the answer off
        }
        return temp;
      }
  
      function findSCD(den1: number, den2: number) { // find smallest common denominator
        let i: number,
            temp: number,
            smaller = (den1 < den2)? den1: den2,
            greater = (den1 > den2)? den1: den2;
        if (den2 === den1) return den1;
        if (greater % smaller === 0) return greater;
        else {
          for (i = 2; i <= greater; i++ ) {
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
    test: {},
    accordion: {},
    timer: {},
    layout: {},
    handlers: {},
    settings: {}
  
  };