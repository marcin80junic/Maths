(function() {

  var maths = {
    exerciseNum: 20,
    testNum: 6,
    unlocked: 0,
    modules: [["addition", "+"], ["subtraction", "-"], ["multiplying", "&times"], ["division", ":"]],
    settings_log: [["addition", 0], ["subtraction", 0], ["multiplying", 0], ["division", 0]],
    difficulty: {
      addition: 0,
      subtraction: 0,
      multiplying: 0,
      division: 0,
      test: 0,
      map: [["easy", 0], ["medium", 1], ["hard", 2]],
      setAll: function(num) {
        if (num === "none") {
          return null;
        }
        var gen = parseInt(num);
        this.addition = this.subtraction = this.multiplying = this.division = gen;
        return gen;
      }
    }
  };

  if (typeof(Storage) !== "undefined") {
    loadData();
  }
  menuEventsInit();
  settingsSetup();
  createExercises();
  createTest();

  function menuEventsInit() {
    var $content = $("div[id$='Intro'], div[id$='Content']");
    $content.not("div[id^='home']").hide();
    function switchContent(menu, contentName) {
      $("li a.selected").removeClass("selected");
      $(menu).addClass("selected");
      $content.hide();
      $content.filter("#"+contentName+"Intro, #"+contentName+"Content:not(#testContent)").fadeIn("slow");
    }
    $("#homeMenu").on("click", function(e) {
      e.preventDefault();
      switchContent(this, "home");
    });
    $("#additionMenu").on("click", function(e) {
      e.preventDefault();
      switchContent(this, "addition");
    });
    $("#subtractionMenu").on("click", function(e) {
      e.preventDefault();
      switchContent(this, "subtraction");
    });
    $("#multiplyingMenu").on("click", function(e) {
      e.preventDefault();
      switchContent(this, "multiplying");
    });
    $("#divisionMenu").on("click", function(e) {
      e.preventDefault();
      switchContent(this, "division");
    });
    $("#testMenu").on("click", function(e) {
      e.preventDefault();
      switchContent(this, "test");
      $(".test-difficulty-button").on("click", function(){
        var level = $(this).prop("value");
        showTest(level);
      })
    });
    $("#settingsMenu").on("click", function(e) {
      e.preventDefault();
      switchContent(this, "settings");
    });
  }

  function showTest(level) {
    maths.difficulty.test = parseInt(level);
    for (var i=0; i<maths.modules.length; i+=1) {
      var name = maths.modules[i][0];
      randomizeTable(name, level);
    }
    var $dimmer = $("<div id='dim'></div>");
    $("body").append($dimmer);
    $("#testContent").fadeIn("slow");
    $(".test-accordeon-content").first().slideDown(function(){
      $(this).addClass("accordeon-selected");
    });
    timer.start(level);
  }

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

  function createExercises() {
    var i, j, k, m, name, sign, tableContent;
    for (m=0; m<maths.modules.length; m+=1) {
      name = maths.modules[m][0];
      sign = maths.modules[m][1];
      tableContent = "";
      for(i=0; i<maths.exerciseNum/2; i+=1) {
        tableContent += '<tr>';
        for(j=0; j<2; j+=1) {
          k = i*2+j;
          tableContent += '<td class="first" colspan="2"><span class="'+name+'Number"></span> ';
          tableContent += sign+' <span class="'+name+'Number"></span> =';
          tableContent += '<input type="text" name="result"'+k+' size="3" class="'+name+'Input"/>';
          tableContent += '<input type="submit" value="check" class="'+name+'Button"/></td>';
          tableContent += '<td><img class="'+name+'Icon" src="pics/question.png" alt="?" width="32px" height="32px">'
          tableContent += '</td><td></td>';
          if(j === 1) {
            tableContent += '</tr>';
          }
        }
      }
      $('#'+name+'Table').html(tableContent);
      var footerHTML = '<input type="reset" value="reload" class="'+name+'Reload"/>';
      footerHTML += '<input type="submit" value="check all" class="'+name+'CheckAll"/>';
      $('#'+name+'Form').append('<p class="footer">'+footerHTML+'</p>');
      randomizeTable(name);
      addButtonListeners(name);
    }
  }

  function checkResults(isTest, checkAll, name, textInput) {
    var spanType = isTest? "TestNumber": "Number",
        inputType = isTest? "TestInput": "Input",
        $textInput = checkAll? $("."+name+inputType): $(textInput),
        $spans = checkAll? $("."+name+spanType): $textInput.parent().find("span"),
        score = 0,
        spanValues, answer, $icon;
    $textInput.removeClass("warning");
    $textInput.each(function(){
      var $thisInput = $(this);
      answer = parseInt($thisInput.val());
      $icon = $thisInput.parent().next().find("img");
      if(!isTest && isNaN(answer)) {
        $thisInput.addClass("warning");
        $icon.attr("src", "pics/question.png");
        if (!checkAll) {
          $thisInput.focus();
          return;
        }
      }
      spanValues = [];
      $(this).siblings().filter("span").each(function(){
        spanValues.push(Number($(this).text()));
      });
      score = checker()? ++score: score;
    });
    function checker() {
      if(isNaN(answer)) {
        if(isTest) {
          $icon.attr("src", "pics/wrong.png");
        }
        return 0;
      }
      var correct = false;
      switch (name) {
        case "addition":
          if (spanValues[0] + spanValues[1] === answer) {
            correct = true;
          } break;
          case "subtraction":
          if (spanValues[0] - spanValues[1] === answer) {
            correct = true;
          } break;
          case "multiplying":
          if (spanValues[0] * spanValues[1] === answer) {
            correct = true;
          } break;
          case "division":
          if (spanValues[0] / spanValues[1] === answer) {
            correct = true;
          } break;
      }
      if(correct) {
        $icon.attr("src", "pics/correct.png");
      } else {
        $icon.attr("src", "pics/wrong.png");
      }
      return correct;
    }
    return score;
  }

  function createTest() {
    var i, j, k, m, name, sign, tableContent;
    for (m=0; m<maths.modules.length; m+=1) {
      name = maths.modules[m][0];
      sign = maths.modules[m][1];
      tableContent = "";
      for (i=0; i<maths.testNum/2; i+=1) {
        tableContent += '<tr>';
        for(j=0; j<2; j+=1) {
          k = i*2+j;
          tableContent += '<td class="first" colspan="2"><span class="'+name+'TestNumber">';
          tableContent += '</span> '+sign+' <span class="'+name+'TestNumber"></span> =';
          tableContent += '<input type="text" class="'+name+'TestInput" size="3"/></td>';
          tableContent += '<td colspan="2"><img class="'+name+'TestIcon" src="" alt="?" width="32px" height="32px">';
          tableContent += '</td>';
          if(j === 1) {
            tableContent += '</tr>';
          }
        }
      }
      $("#"+name+"Test").html(tableContent);
      $("."+name+"TestInput").on("keypress", function(e){
        return validateInput(this, e);
      });
    }
    var $testModal = $("#testContent"),
        $contentDivs = $(".test-accordeon-content"),
        $icons = $("#test-accordeon img"),
        $headerButtons = $(".test-accordeon-control"),
        $nextButtons = $(".next-button"),
        $prevButtons = $(".previous-button"),
        $submitButton = $(".submit-button"),
        $closeButton = $(".close-button");

    $icons.hide();
    $contentDivs.hide();

    $headerButtons.on("click", function(e){
      e.preventDefault();
      $(".accordeon-selected").slideUp();
      if($(this).next().is(".accordeon-selected")) {
        toggleClass(null);
        return;
      }
      $(this).next().slideDown(function(){
        toggleClass($(this));
      });
    });
    $nextButtons.on("click", function(e){
      e.preventDefault();
      $(".accordeon-selected").slideUp();
      $(this).parents("li").next().find(".test-accordeon-content").slideDown(function(){
        toggleClass($(this));
      });
    });
    $prevButtons.on("click", function(e){
      e.preventDefault();
      $(".accordeon-selected").slideUp();
      $(this).parents("li").prev().find(".test-accordeon-content").slideDown(function(){
        toggleClass($(this));
      });
    });
    $("#test").on("submit", function(e){
      e.preventDefault();
      timer.stop();
      createSummary();
      $icons.show();
      $("#testContent button:not(.close-button)").prop("disabled", "true");
      $testModal.css("overflow", "scroll");
      $contentDivs.slideDown(function(){
        $testModal.scrollTop(1500);
      });
    });
    $closeButton.on("click", function(e){
      e.preventDefault();
      $("#testContent button:not(.test-accordeon-control:last)").removeAttr("disabled");
      $("#test input").val("");
      $icons.hide();
      $contentDivs.slideUp();
      $contentDivs.removeClass("accordeon-selected");
      $testModal.css("overflow", "hidden");
      $testModal.hide();
      $("div").remove("#dim");
    });

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
        alert(maths.unlocked + " is number?: "+ !isNaN(maths.unlocked));
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
  }

  function randomizeTable(name, level) {
    var $spans = level? $("."+name+"TestNumber"): $("."+name+"Number"),
        count = level? maths.testNum: maths.exerciseNum,
        difficulty = level? parseInt(level): maths.difficulty[name],
        number, i, j, k,
        temp = [],
        numbers = [];
    var randomSingleDigit = function() {
      while(true) {
        if ((number = Math.floor(Math.random()*10)) !== 0) {
          break;
        }
      }
      return number;
    };
    var randomSeveralDigit = function() {
      return (number = Math.floor(Math.random()*10) + 10);
    };
    var randomDoubleDigit = function() {
      while(true) {
        number = Math.floor(Math.random()*100);
        if (number !== 0 && number > 9) {
          break;
        }
      }
      return number;
    };
    function getNumbers() {
      var nums = [];
      switch(difficulty) {
        case 0:
          nums = [randomSingleDigit(), randomSingleDigit()];
          break;
        case 1:
          if (Math.random() < 0.5) {
            nums = [randomSingleDigit(), randomSeveralDigit()];
          } else {
            nums = [randomSeveralDigit(), randomSingleDigit()];
          }
          break;
        case 2:
          nums = [randomDoubleDigit(), randomDoubleDigit()];
          break;
      }
      return nums;
    }
    function helper() {
      if( (name === "subtraction" || name === "division") && (temp[0] < temp[1]) ) {
        var num = temp[0];
        temp[0] = temp[1];
        temp[1] = num;
      }
      if( (name === "division") && (temp[0] % temp[1] !== 0) ) {
        return false;
      }
      for(j=0; j<numbers.length; j+=1) {
        if((numbers[j][0] === temp[0]) && (numbers[j][1] === temp[1])) {
          return false;
        }
      }
      return true;
    }
    for(i=0; i<count; i+=1) {
      k = i*2;
      while(true) {
        temp = getNumbers();
        if(helper()) {
          numbers[i] = temp;
          $spans.eq(k).text(temp[0]);
          $spans.eq(k+1).text(temp[1]);
          break;
        }
      }
    }
    $("."+name+"Input").each(function(){
      if($(this).is(".warning")){
        $(this).removeClass("warning");
      }
    });
  }

  function addButtonListeners(name) {
    var $checkButtons = $("."+name+"Button"),
        $textFields = $("."+name+"Input");

    $checkButtons.on("click", function(e) {
      e.preventDefault();
      checkResults(false, false, name, this.previousSibling);
    });
    $("."+name+"CheckAll").on("click", function(e) {
      e.preventDefault();
      checkResults(false, true, name);
    });
    $("."+name+"Reload").on("click", function(){
      randomizeTable(name);
      $("."+name+"Icon").prop("src", "pics/question.png");
    });
    $textFields.on("keypress", function(e) {
      return validateInput(this, e);
    });
    $textFields.on("blur", function(e){
      $(this).removeClass("warning");
      if($(this).val()==="") {
        $(this).parent().next().find("img").prop("src", "pics/question.png");
      }
    });
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
