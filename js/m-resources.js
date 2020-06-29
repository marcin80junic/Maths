
/*
  *define global application object which contains:
  ...
*/

var maths = {

  tick: "pics/correct.png",
  cross: "pics/wrong.png",
  questMark: "pics/question.png",
  difficulties: ["Fair", "Advanced", "Super Hard"],
  numOfExercises: ["6", "8", "10", "12", "16", "20", "24"],
  range: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
  active: $("#home"),
  switch: function (id) {
    this.active = $(id);
    let moduleName = id.replace("#", "");
    let module = this[moduleName];
    if (Operation.prototype === Object.getPrototypeOf(module)) {
      if (module.level !== module.levelDisplayed) {
        module.init();
      }
    } else if (moduleName === "settings") {
      if (!this.settings.areLoaded) module.init();
    }
  },
  playSound: function (isCorrect) {
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
  createAndAppendCanvas: function(parent, module, index) {
    
    let nums = module.numbers[index], 
        answerIdx = module.answersIdxs[index], 
        sign = module.sign,
        width = calculateWidth(),
        canvas = $('<canvas class="canvas" width="200" height="40px"></canvas>')[0],
        c = canvas.getContext("2d"),
        i;

    parent.width(200);
    const rads = (x) => Math.PI * x / 180;
    
    c.fillStyle = "red";
    c.lineWidth = 0.5;
    c.font = "20px sans-serif";
    c.translate(20, 20);

    for (i = 0; i < nums.length; i += 1) {
      if (i === answerIdx) {
        continue;
      }
      if (nums[i].length === 2) {
        
        drawFraction(c, nums[i]);
      } else {
        drawInteger(nums[i]);
      }
      if (i < nums.length - 2) {
        drawSign(sign);
      } else {
        drawSign("=");
      }
    }

    function calculateWidth(diameter) {
      let sum = 0, 
          
          whole, i, j;
      for (i = 0; i < nums.length; i += 1) {
        if (nums[i].length === 2) {
          whole = nums[i][0] / nums[i][1];
          for (j = 0; j < whole; j += 1) {
            sum += 1;
          }
        }
      }
    }

    function drawFraction(c, nums) {
      let whole, leftOver, i;
      if (nums[0] >= nums[1]) {
        whole = Math.floor(nums[0] / nums[1]);
        leftOver = nums[0] % nums[1];
        for (i = 0; i < whole; i += 1) {
          drawCircle(c, nums[1], nums[1]);
          if (leftOver && i === whole - 1) {
            c.translate(40, 0);
            drawCircle(c, leftOver, nums[1]);
          }
        }
      } else {
        drawCircle(c, nums[0], nums[1]);
      }
      function drawCircle(c, numerator, denominator) {
        let advance = 360 / denominator,
            startAngle = endAngle = -90,
            i;
        for (i = 1; i <= denominator; i += 1) {
          endAngle += advance;
          c.beginPath();
          c.moveTo(0, 0);
          c.arc(0, 0, 15, rads(startAngle), rads(endAngle), false);
          if (i <= numerator) {
            c.fill();
          } 
          c.closePath();
          c.stroke();
          startAngle = endAngle;
        }
      }
    }
    function drawInteger(num) {

    }
    function drawSign(sign) {
      c.fillStyle = "black";
      c.translate(20, 0);
      c.fillText(sign, 0, 7);
      c.translate(30, 0);
      c.fillStyle = "red";
    }
    return parent.append(canvas);
  },

  home: {

  }

};