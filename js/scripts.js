(function() {

  var maths = {
    addition: {
      name: "addition",
      sign: "+",
      difficulty: 0,
      create: creator,
      getNumbers: ()=> {
        switch(this.difficulty) {
          case 0:
            return [maths.randomSingleDigit(), maths.randomSingleDigit()];
          case 1:
            return (Math.random() < 0.5)?
                      (Math.random() < 0.5)?
                        [maths.randomSeveralDigit(), maths.randomSingleDigit()]
                        : [maths.randomSingleDigit(), maths.randomSeveralDigit()]
                      : [maths.randomSingleDigit(), maths.randomSingleDigit(), maths.randomSingleDigit()];
          case 2:
            return (Math.random() < 0.5)?
                      [maths.randomDoubleDigit(), maths.randomSeveralDigit(), maths.randomSingleDigit()]
                      : [maths.randomSeveralDigit(), maths.randomSingleDigit(), maths.randomDoubleDigit()];
        }
      },
      numbers: [],
      results: [],
      answers: []
    },
    randomSingleDigit: ()=> {
      let number;
      while(true) {
        number = Math.floor(Math.random() * 10);
        if (number !== 0) {
          return number;
        }
      }
    },
    randomSeveralDigit: ()=> {
      return Math.floor(Math.random() * 10) + 10;
    },
    randomDoubleDigit: ()=> {
      let number = Math.floor(Math.random() * 100);
      return (number === 0 || number < 9)? number + 10: number;
    },
    isUnique: (nums, array)=> {
      let max = array.length,
          i; 
      for (i = 0; i < max; i += 1) {
        if (nums === array[i]) {
          return false;
        }
      }
      return true;
    },
    exerciseNum: 20,
    testNum: 6,
  };

  var creator = (isTest)=> {
    let operation = [],
        numbers = [],
        results = [],
        max = isTest? maths.testNum: maths.exerciseNum,
        i;
    for (i = 0; i < max; i += 1) {
      while(true) {
        operation = this.getNumbers();
        if (maths.isUnique(operation, numbers)) {
          numbers.push(operation);
          results.push(operation.reduce((accumulator, num)=> {
            return accumulator + num;
          }));
          break;
        }
      }
    }
    if (!isTest) {
      this.numbers = numbers;
      this.results = results;
    } else {
      maths.test.numbers.push(numbers);
      maths.test.results.push(results);
    }
    return numbers;
  },

  if (typeof(Storage) !== "undefined") {
    loadData();
  }
  menuEventsInit();
  settingsSetup();
  createExercises();
  createTest();


  var timer = {
    container: $("#timer"),
    minutes: "00",
    seconds: "00",
    secondsElapsed: 0,
    state: function(){
      return "<b>"+this.minutes+":"+this.seconds+"</b>"
    },
    show: function(){
      this.container.html(this.state());
    },
    setTimer: null,
    start: function(level){
      this.reset();
      var count = (level==0)? 500: ((level==1)? 300: 120);
      var minutes = Math.floor(count/60);
      var seconds = count % 60;
      this.minutes = (minutes < 10)? "0"+minutes: ""+minutes;
      this.seconds = (seconds < 10)? "0"+seconds: ""+seconds;
      this.show();
      var instance = this;
      var start = Date.now();
      this.setTimer = setInterval(function(){
        var elapsed = Math.floor((Date.now() - start)/1000) - 1;
        instance.secondsElapsed = elapsed;
        if (elapsed >= count+1) {
          $("#test").submit();
          clearInterval(this.setTimer);
          return;
        }
        var secsElapsed = (elapsed + 60) % 60;
        var secs = (seconds < secsElapsed)? 60 - (secsElapsed - seconds): seconds - secsElapsed;
        var minsElapsed = Math.floor(elapsed/60);
        var mins = (secsElapsed < seconds+1)? minutes - minsElapsed: minutes - minsElapsed - 1;
        instance.minutes = (mins < 10)? "0"+mins: ""+mins;
        instance.seconds = (secs < 10)? "0"+secs: ""+secs;
        instance.show();
      } ,1000);
    },
    stop: function(){
      clearInterval(this.setTimer);
      this.container.html("");
    },
    reset: function(){
      this.minutes = "00";
      this.seconds = "00";
    }
  };

  function loadData() {
    var add, sub, mul, div;
    add = maths.settings_log[0][1] = maths.difficulty.addition = parseInt(localStorage.getItem("addition")) || 0;
    sub = maths.settings_log[1][1] = maths.difficulty.subtraction = parseInt(localStorage.getItem("subtraction")) || 0;
    mul = maths.settings_log[2][1] = maths.difficulty.multiplying = parseInt(localStorage.getItem("multiplying")) || 0;
    div = maths.settings_log[3][1] = maths.difficulty.division= parseInt(localStorage.getItem("division")) || 0;
    maths.unlocked = parseInt(localStorage.getItem("unlocked")) || 0;
    // localStorage.setItem("unlocked", "0");
    $("input[type='radio'][name='addition'][value='"+add+"']").prop("checked", true);
    $("input[type='radio'][name='subtraction'][value='"+sub+"']").prop("checked", true);
    $("input[type='radio'][name='multiplying'][value='"+mul+"']").prop("checked", true);
    $("input[type='radio'][name='division'][value='"+div+"']").prop("checked", true);
    var levels = document.getElementsByClassName("test-difficulty-button");
    for(var i=0; i<=maths.unlocked; i++){
      levels[i].removeAttribute("disabled");
    }
  }



  

    function createSummary() {
      var results = [],
          score = 0,
          rewardText = "";
      for(var i=0; i<maths.modules.length; i++) {
        var name = maths.modules[i][0];
        results.push(checkResults(true, true, name));
        score += results[i];
      }
      var $summary = $(".summary");
      $summary.empty();
      $summary.filter(":lt(4)").each(function(index){
        var txt = results[index] + " of 6 (" +Math.round(results[index]/6*100)+ "%)";
        $(this).text(txt);
      });
      var percent = Math.round(score/24*100);
      $summary.eq(4).text(score + " of 24  (" +percent+ "%)");
      var minutes = (timer.secondsElapsed > 59)? Math.floor(timer.secondsElapsed / 60): 0;
      var seconds = (timer.secondsElapsed > 59)? timer.secondsElapsed % 60: timer.secondsElapsed;
      var time = (minutes > 0)? minutes+ ((minutes===1)? " minute ": " minutes ") +seconds+ " second(s)": seconds+ " second(s)";
      $summary.eq(5).text(time);
      if(percent < 66) {
        rewardText = "test failed, you need to practise a little more<br>don't give up and try again!";
      }
      else if(percent > 65 && percent < 86) {
        rewardText = "Well done you passed!"
        rewardText += ( (maths.unlocked < 2) && (maths.unlocked === maths.difficulty.test) )?
          "<br>(to unlock next level your score needs to be at least 90%)": "";
      }
      else {
        rewardText = "Well done you passed!";
        rewardText += ( (maths.unlocked < 2) && (maths.unlocked === maths.difficulty.test) )?
          "<br>Next level unlocked: " +maths.difficulty.map[maths.unlocked+1][0] : "";
        maths.unlocked = maths.difficulty.test + 1;
        $(".test-difficulty-button[value="+maths.unlocked+"]").removeAttr("disabled");
        localStorage.setItem("unlocked", maths.unlocked);
      }
      $summary.eq(6).html(rewardText);
    }

    function toggleClass($activeDiv){
      $(".accordeon-selected").removeClass("accordeon-selected");
      $activeDiv.addClass("accordeon-selected");
    }
  

  

  function validateInput(element, e) {
    var char = String.fromCharCode(e.which);
    var length = $(element).val().length;
    if ( (window.getSelection().toString() !== "") && ($.isNumeric(char)) ) {
      return true;
    };
    if (!$.isNumeric(char) || (length === 3)) {
      return false;
    }
  }

  function settingsSetup() {
    var $general = $("input[name='general']");
    var $radios = $(".settingsTable input[name!=general]");

    $general.on("click", function() {
      var value = maths.difficulty.setAll($(this).val());
      if (value !== null) {
        $radios.filter("[value="+value+"]").prop("checked", true);
        $("#applySettings").prop("disabled", false);
      }
    });
    $radios.on("click", function() {
      maths.difficulty[$(this).prop("name")] = parseInt($(this).val());
      $general.filter("[value=none]").prop("checked", true);
      $("#applySettings").prop("disabled", false);
    });
    $("#resetSettings").on("click", function() {
      maths.difficulty.setAll(0);
      submitChanges();
      $("#applySettings").prop("disabled", false);
    });
    $("#applySettings").on("click", function(e) {
      e.preventDefault();
      submitChanges();
      $("#applySettings").prop("disabled", true);
    });
    function submitChanges() {
      var name, num, i, length;
      var current_log = [];
      $radios.filter(":checked").each(function() {
        name = $(this).prop("name");
        num = parseInt($(this).val());
        current_log.push([name, num]);
      });
      length = current_log.length;
      for(i=0; i<length; i+=1) {
        if(maths.settings_log[i][1] !== current_log[i][1]) {
          maths.settings_log[i][1] = current_log[i][1];
          if (typeof(Storage) !== "undefined") {
            localStorage.setItem(current_log[i][0], current_log[i][1].toString());
          }
          randomizeTable(current_log[i][0]);
          $("."+current_log[i][0]+"Reload").click();
        }
      }
    }
  }
}());
