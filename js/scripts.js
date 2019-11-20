
(function(){
  var maths = {
    exerciseNum: 20,
    testNum: 6,
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
  settingsSetup();
  createTable("addition", "+");
  createTable("subtraction", "-");
  createTable("multiplying", "&times");
  createTable("division", ":");

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
    $(".test-accordeon-content").hide();
    switchContent(this, "test");
    $(".test-Difficulty-Button").on("click", function(){
      var level = $(this).prop("value");
      createTest(level);
    })
  });
  $("#settingsMenu").on("click", function(e) {
    e.preventDefault();
    switchContent(this, "settings");
  });

  function loadData() {
    var add, sub, mul, div;
    add = maths.settings_log[0][1] = maths.difficulty.addition = parseInt(localStorage.getItem("addition")) || 0;
    sub = maths.settings_log[1][1] = maths.difficulty.subtraction = parseInt(localStorage.getItem("subtraction")) || 0;
    mul = maths.settings_log[2][1] = maths.difficulty.multiplying = parseInt(localStorage.getItem("multiplying")) || 0;
    div = maths.settings_log[3][1] = maths.difficulty.division= parseInt(localStorage.getItem("division")) || 0;
    maths.difficulty.test = parseInt(localStorage.getItem("test")) || 0;
    $("input[type='radio'][name='addition'][value='"+add+"']").attr("checked", true);
    $("input[type='radio'][name='subtraction'][value='"+sub+"']").attr("checked", true);
    $("input[type='radio'][name='multiplying'][value='"+mul+"']").attr("checked", true);
    $("input[type='radio'][name='division'][value='"+div+"']").attr("checked", true);
  }

  function switchContent(menu, element) {
    $("li a.selected").removeClass("selected");
    $(menu).addClass("selected");
    $(".visible").hide();
    $("#"+element+"Intro, #"+element+"Content").attr("class", "visible").hide().fadeIn("slow");
  }

  function createTable(name, symbol) {
    var tableContent = "";
    var i, j, k;
    for(i=0; i<maths.exerciseNum/2; i+=1) {
      tableContent += '<tr>';
      for(j=0; j<2; j+=1) {
        k = i*2+j;
        tableContent += '<td class="first" colspan="2"><label for="result'+k+'" class="'+name+'">';
        tableContent += '<span class="'+name+'Number"></span> '+symbol+' <span class="'+name+'Number"></span>';
        tableContent += ' =</label><input type="text" name="result"'+k+' size="3" class="'+name+'Input"/>';
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

  function createTest(level) {
    var tableContent;
    var i, j, k, m, name, sign;
    for (m=0; m<maths.modules.length; m+=1) {
      name = maths.modules[m][0];
      sign = maths.modules[m][1];
      tableContent = "";
      for (i=0; i<maths.testNum/2; i+=1) {
        tableContent += '<tr>';
        for(j=0; j<2; j+=1) {
          k = i*2+j;
          tableContent += '<td></td><td class="first"><span class="'+name+'TestNumber">';
          tableContent += '</span> '+sign+' <span class="'+name+'TestNumber"></span> = </td>';
          tableContent += '<td><input type="text" class="'+name+'TestInput" size="3"/>';
          tableContent += '</td><td></td>'
          if(j === 1) {
            tableContent += '</tr>';
          }
        }
      }
      $("#"+name+"Test").html(tableContent);
      randomizeTable(name, level);
      $("."+name+"TestInput").on("keypress", function(e){
        return validateInput(this, e);
      });
    }
    $(".test-accordeon-control").on("click", function(e){
      e.preventDefault();
      $(this).next().slideToggle();
    });
  }

  function randomizeTable(name, level) {
    var $spans = level? $("."+name+"TestNumber"): $("."+name+"Number");
    var count = level? maths.testNum: maths.exerciseNum;
    var number, i, j, k,
        temp = [];
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
      switch(maths.difficulty[name]) {
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
    var spanValues = [],
        textValue, answer, correct;
    var checker = function(button, submit) {
      var $btn = $(button);
      var $textField = $btn.prev();
      var $icon = $btn.parent().next().children();
      textValue = $textField.val();
      if (textValue === "") {
        if (submit === false) {
          $textField.focus();
        }
        $textField.addClass("warning");
        $icon.attr("src", "pics/question.png");
        return;
      }
      $textField.removeClass("warning");
      answer = parseInt(textValue);
      spanValues = [];
      $btn.prev().prev().find("span").each( function() {
          spanValues.push(parseInt($(this).text()));
      });
      correct = false;
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
      if (correct) {
        $icon.attr("src", "pics/correct.png");
      } else {
        $icon.attr("src", "pics/wrong.png");
      }
    };
    var $checkButtons = $("."+name+"Button");
    $checkButtons.on("click", function(e) {
      e.preventDefault();
      checker(this, false);
    });
    $("."+name+"CheckAll").on("click", function(e) {
      e.preventDefault();
      $checkButtons.each(function() {
        checker(this, true);
      });
    });
    $("."+name+"Reload").on("click", function(){
      randomizeTable(name);
      $("."+name+"Icon").prop("src", "pics/question.png");
    });
    var $textFields = $("."+name+"Input");
    $textFields.on("keypress", function(e) {
      return validateInput(this, e);
    });
    $textFields.on("blur", function(e){
      $(this).removeClass("warning");
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
