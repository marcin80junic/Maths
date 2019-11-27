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
      $(".test-Difficulty-Button").on("click", function(){
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
    maths.difficulty.test = level;
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
    state: function(){
      return "<b>"+this.minutes+":"+this.seconds+"</b>"
    },
    show: function(){
      this.container.html(this.state());
    },
    start: function(level){
      this.reset();
      var count = (level==0)? 600: ((level==1)? 300: 120);
      var minutes = count/60;
      this.minutes = (minutes < 10)? "0"+minutes: ""+minutes;
      this.show();
      var instance = this;
      var secs = 0;
      var start = Date.now();
      this.setTimer = setInterval(function(){
        var elapsed = Math.floor((Date.now() - start)/1000) - 1;
        if (elapsed >= count) {
          clearInterval(setTimer);
          return;
        }
        secs = 59 - ((elapsed + 60) % 60);
        var mins = (count/60 - 1) - Math.floor(elapsed/60);
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
    $("input[type='radio'][name='addition'][value='"+add+"']").prop("checked", true);
    $("input[type='radio'][name='subtraction'][value='"+sub+"']").prop("checked", true);
    $("input[type='radio'][name='multiplying'][value='"+mul+"']").prop("checked", true);
    $("input[type='radio'][name='division'][value='"+div+"']").prop("checked", true);
    var levels = document.getElementsByClassName("test-Difficulty-Button");
    for(var i=0; i<maths.unlocked; i++){
      levels[i].setAttribute("disabled", "false");
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
        spanValues = [],
        score = 0,
        answer, $icon;
    if (checkAll === false) {
      answer = $textInput.val();
      if (answer === "") {
        $textInput.focus();
        $textInput.addClass("warning");
        $icon.attr("src", "pics/question.png");
        return;
      }
    }
    $textInput.removeClass("warning");
    $textInput.each(function(){
      spanValues = [];
      $(this).siblings().filter("span").each(function(){
        spanValues.push(Number($(this).text()));
      });
      answer = Number($(this).val());
      $icon = $(this).parent().next().find("img");
      score = checker()? score++: score;
    });
    function checker() {
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
          tableContent += '<td colspan="2"><img class="'+name+'Icon" src="" alt="?" width="32px" height="32px">';
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
    $testModal.hide();
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
      $contentDivs.slideDown();
    });
    $closeButton.on("click", function(e){
      e.preventDefault();
      $("#testContent button:not(.test-accordeon-control:last)").removeAttr("disabled");
      $contentDivs.slideUp();
      $contentDivs.removeClass("accordeon-selected");
      $testModal.css("overflow", "hidden");
      $testModal.hide();
      $("div").remove("#dim");
    });

    function createSummary() {
      var results = [];
      for(var i=0; i<maths.modules.length; i++) {
        var name = maths.modules[i][0];
        results.push([name][checkResults(true, true, name)]);
      }

      localStorage.setItem("unlocked", ""+maths.unlocked);
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
      $checkButtons.each(function() {
        checkResults(false, true, name);
      });
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
