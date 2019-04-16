var formLexicon = document.querySelector('#form-analyze-single');
var commentArea = document.querySelector('#comment');

var formClassifier = document.querySelector('#form-classify-single');
var commentAreaClassify = document.querySelector('#classify-comment')

// Listen to the Lexicon Analysis form for submission
// then POST the data using AJAX and retrieve a JSON response.
$(document).ready(function() {
  // Listener for an AJAX request begin/stop
  $(document).ajaxStart(function() {
    $('#toast--parent-container').fadeToggle(300);
  });

  $(document).ajaxStop(function() {
    $('#toast--parent-container').fadeToggle(300);
  });

  // Listener for the lexicon form
  $('#form-analyze-single').submit(function() {
      $.ajax({
          type: 'POST',
          url: 'http://marknolledo.pythonanywhere.com/sibyl/analyze/mode=lexicon',
          data: {comment: commentArea.value},
          error: function()
          {
             alert("Request Failed");
             //alert(commentArea.value);
          },
          success: function(response)
          {
             //alert('Request Sent');
             console.log('Text received: ' + commentArea.value);
             console.log('Server response: ' + response.result);
             $("#lexicon-result").html(response.result);
          } // this was missing
      });
      return false;
  });

  // Listener for the classifier form
  $('#form-classify-single').submit(function() {
    $.ajax({
        type: 'POST',
        url: 'http://marknolledo.pythonanywhere.com/sibyl/analyze/mode=classifier',
        data: {comment: commentAreaClassify.value},
        error: function()
        {
           alert("Request Failed");
           //alert(commentArea.value);
        },
        success: function(response)
        {
           //alert('Request Sent');
           console.log('Text received: ' + commentArea.value);
           console.log('Server response: ' + response.result);
           $("#classify-result").html(response.result);
        } // this was missing
    });
    return false;
  });

  //alert('Script reached.');
});

// $(function() {
//   $('#form-analyze-single').submit(function() {
//       $.ajax({
//           type: 'POST',
//           url: 'analyze/mode=lexicon',
//           data: {comment: commentArea.value},
//           error: function()
//           {
//              alert("Request Failed");
//           },
//           success: function(response)
//           {
//              //alert('Request Sent');
//              console.log(commentArea.value);
//              console.log(response.result);
//              $("#lexicon-result").html(response.result);
//           } // this was missing
//       });
//       return false;
//   })
// });
