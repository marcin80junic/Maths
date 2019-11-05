
(function(){
  var difficulty = {
    addition: 0,
    subtraction: 0,
    multiplying: 0,
    division: 0,
    test: 0,
    general: function(num) {
      if (!num) {
        return 0;
      }
      var gen = Number.parseInt(num);
      this.addition = this.subtraction = this.multiplying = this.division = gen;
      return gen;
    }
  };
  var count = 20;
  var $menuButtons = $("li button");

  setupOptions();

  function setupOptions() {
    var $general = $("input[name='general']");
    var $addition = $("input[name='addition']");
    var $subtraction = $("input[name='subtraction']");
    var $multiplying = $("input[name='multiplying']");
    var $division = $("input[name='division']");

    $general.on("click", function(){
      
    })
  }

  createTable("addition", "+");
  createTable("subtraction", "-");
  createTable("multiplying", "&times");
  createTable("division", ":");

  $("#homeMenu").on("click", function() {
    switchContent(this, "home");
  });
  $("#additionMenu").on("click", function() {
      switchContent(this, "addition");
  });
  $("#subtractionMenu").on("click", function() {
      switchContent(this, "subtraction");
  });
  $("#multiplyingMenu").on("click", function() {
      switchContent(this, "multiplying");
  });
  $("#divisionMenu").on("click", function() {
      switchContent(this, "division");
  });
  $("#testMenu").on("click", function() {
      switchContent(this, "test");
  });
  $("#settingsMenu").on("click", function() {
      switchContent(this, "settings");
  });

  function switchContent(menu, element) {
    $menuButtons.css("background-color", "inherit");
    $(menu).children().css("background-color", "#990000");
    $(".visible").attr("class", "hidden");
    $("#"+element+"Intro, #"+element+"Content").attr("class", "visible");
  }

  function createTable(name, symbol) {
    var tableContent = "";
    var i, j, k;
    for(i=0; i<count/2; i+=1) {
      tableContent += '<tr>';
      for(j=0; j<2; j+=1) {
        k = i*2+j;
        tableContent += '<td class="first" colspan="2"><label for="result'+k+'" class="'+name+'">';
        tableContent += '<span class="'+name+'Number"></span> '+symbol+' <span class="'+name+'Number"></span>';
        tableContent += ' =</label><input type="text" name="result"'+k+' size="1" class="'+name+'Input"/>';
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

  function randomizeTable(name) {
    var $spans = $("."+name+"Number");
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
      switch(difficulty[name]) {
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
          alert("Please enter your answer in a text field!");
          $textField.focus();
          $textField.addClass("warning");
        }
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
      $("."+name+"Icon").attr("src", "pics/question.png");
    });
    var $textFields = $("."+name+"Input");
    $textFields.on("keypress", function(e) {
      var char = String.fromCharCode(e.which);
      if(!$.isNumeric(char)){
        return false;
      }
    });
    $textFields.on("blur", function(e){
      $(this).removeClass("warning");
    });
  }
}());
