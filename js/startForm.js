// Start form builder when page is ready
$(document).ready(function() {
  console.log('[Builder] Form builder is ready.');
  //$(document.getElementById('build-wrap')).formBuilder();   // Basic form with no functions
  //$tableName = document.querySelector('#field--tableName');

  // On page load, generate a form ID based on the date now.
  // This will be used to identify the form that will come out (if exported),
  // as a file name, and as the formID query variable.
  $formName = document.querySelector('#tableName');
  $formID = Date.now() / 1000 | 0;
  $('#table-id-display').html($formID);

  // Form Builder with Form Render
  jQuery(function($) {
    // The form builder itself
    var $fbEditor = $(document.getElementById('build-wrap')),
      $formContainer = $(document.getElementById('build-render')),
      $formHeaders = $(document.getElementById('build-render-headers')),
      $formHTML = $(document.getElementById('build-html-viewer')),
      fbOptions = {
        onSave: function(formData) {
          if ($formName.value == '') {
            showToast('Form name cannot be empty.');
          }
          else {
            // The form builder's render view
            $formName.disabled = true;  // disables the form name input to prevent edits
            $fbEditor.toggle();
            $formContainer.toggle();
            $formHeaders.toggle();
            $('form', $formContainer).formRender({
              formData: formBuilder.formData
            });
          }
        },

        notify: {
          error: function(message) {
            return console.error(message);
          },
          success: function(message) {
            return console.log(message);
          },
          warning: function(message) {
            return console.warn(message);
          }
        },

        disableFields: [
          'autocomplete',
          'file',
          'starRating',
          'checkbox-group'
        ],

        disabledAttrs: [
          'access',
          'className',
          'other',
          'multiple',
          'toggle',
          'placeholder'
        ],

        disabledSubtypes: {
          button: ['button'],
          paragraph: ['canvas'],
          textarea: ['tinymce', 'quill']
        },

        editOnAdd: true,
        fieldRemoveWarn: true,
        scrollToFieldOnAdd: true,
        stickyControls: {
          enable: true,
          offset: {
            top: 20,
            right: 20,
            left: 'auto'
          }
        }
      },
      formBuilder = $fbEditor.formBuilder(fbOptions); // starts the form builder with the options stated above

    // AJAX START listeners
    $(document).ajaxStart(function() {
      showToast('Processing form. Please wait.');
    }).ajaxStop(function() {
      $('#toast--parent-container').fadeOut(300);
    });

    // Toggle action for the form builder's Render Preview
    $('.edit-form', $formContainer).click(function() {
      $formName.disabled = false; // re-enables form name edits
      $fbEditor.toggle();
      $formContainer.toggle();
      $formHeaders.toggle();
      $formHTML.hide();
      $formHTML.removeClass('active');
    });

    // Toggle action for Export to HTML
    $('.export-html', $formContainer).click(function() {
      $fields = [];   // the fields array
      //tableName = $formName.value;  // the table / form name
      tableName = $formID;
      console.log('Initial fields: ', $fields);
      console.log('Form ID: ', $formID);

      // Get the form builder's data first
      html = $formContainer.formRender('html');
      xml = formBuilder.actions.getData('xml');
      js = formBuilder.actions.getData();

      //showToast('Exporting as HTML.');
      console.log(js);

      // Iterate on the JS object and output the field names
      // For now, this will output only the names of fields (if available)
      if (js.length != 0) {
        var counter;
        console.log('Fields in form: ', js.length);
        for (counter = 0; counter < js.length; counter++) {
          $fieldName = js[counter].name;
          $fieldType = js[counter].type;

          // This condition checks for fields that are buttons.
          // This will filter buttons added to the field array.
          if ($fieldName && $fieldType != 'button') {
            console.log(js[counter].name);
            $fields.push(js[counter].name);
            console.log('Pushed to array.');
          }
          else {
            console.log($fieldName, 'not added. This item has no name attribute or is a button.');
          }
        }
        console.log('Updated fields array: ', $fields);

        // After appending the fields, stringify the array.
        jFields = JSON.stringify($fields);

        // Begin an AJAX request to server to push the table name and columns FIRST
        // before exporting the actual HTML file. This is to prevent an HTML form
        // from having no backend table linked to it.
        if ($fields.length != 0) {
          $.ajax({
            type: 'POST',
            url: 'https://marknolledo.pythonanywhere.com/sibyl/create',
            data: {tableName: tableName, fields: jFields},
            error: function(response) { console.log(response); },
            success: function(response) {
              console.log(response);
              // Pass the form's XML data to the form HTML constructor
              showToast('Creating HTML document.');
              createForm(xml);
            }
          });
          return false;
        }
        else {
          console.log('Not submitted. There are no quantifiable items in the form.');
          showToast('The form has no quantifiable fields.')
        }
      }
      else {
        console.log('Not submitted. There are no fields in the form.');
        showToast('There are no fields in the form.');
      }
    });

    // Toggle action for Copy HTML
    $('.copy-html', $formContainer).click(function() {
      //html = formBuilder.actions.getData('xml');  // retrieve the XML data of the current form
      html = $formContainer.formRender('html');     // retrieve the HTML code of the current form

      // Show the HTML viewer
      $('#build-html-viewer').fadeToggle(300, function() {
        $(this).addClass('active');
        var formHTML = $('#hidden--output').val(html).select();
        document.execCommand('copy');
      });

      // Logs?
      console.log(html);
      showToast('Copied to clipboard.');
    });

    // Toggle action for View JS
    $('.export-html-only', $formContainer).click(function() {
      console.log(Date.now() / 1000 | 0);

      // Get the JS object of the form
      js = formBuilder.actions.getData();
      xml = formBuilder.actions.getData('xml');

      // Iterate on the JS object and output the field names
      // For now, this will output only the names of fields (if available)
      var counter;
      console.log('Fields in form: ', js.length);
      for (counter = 0; counter < js.length; counter++) {
        if (js[counter].name) {
          console.log(js[counter].name);
        }
        else {
          console.log('This item has no name attribute.');
        }
      }

      showToast('Creating HTML document.');
      createForm(xml);
    });

    // // Toggle for getting the form data XML (for debugging)
    // document.getElementById('getXML').addEventListener('click', function() {
    //   console.log(formBuilder.actions.getData('xml'));
    // });
  });

  // EXPORT AND COPY HANDLERS
  function showToast(text) {
    $('#toast--message').html(text);
    $('#toast--parent-container').fadeToggle(300, function() {
      setTimeout(function() {
        $('#toast--parent-container').fadeToggle(300);
      }, 5000);
    });
  }

  // CREATE THE DAMNED THING'S FULL HTML CODE
  function createForm(formData) {
    console.log('Attempting to create the form.');
    let formRenderOpts = {
      dataType: 'xml',
      formData
    };
    let $renderContainer = $('<form/>');
    $renderContainer.formRender(formRenderOpts);
    let formId = $formID;
    let formName = $formName.value;
    let html = `<!DOCTYPE html><head><title>Sibyl Forms</title></head><body class="container"><h1>Preview</h1><hr>${$renderContainer.html()}</body></html>`;
    let html_toWrite = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>${formName} - Sibyl Forms</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' type='text/css'>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
      <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
      <link rel="shortcut icon" type="image/png" href="https://sibylforms.000webhostapp.com/sibyl-type3_16.png"/>

      <!-- SCRIPTS -->
      <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
      <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

      <!-- STYLE -->
      <style>
        body {
          width: 100%;
          margin: 0px;
          padding: 0px;
          font-family: Roboto, sans-serif;
          color: #444;
        }

        #wrapper {
          width: calc(0.5rem + 60%);
          margin: auto;
          margin-top: calc(0.5rem + 4vh);
          margin-bottom: calc(0.5rem + 2vh);
          background-color: #fff;
          padding: calc(0.5rem + 2vmin);
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        #page--splitter-background {
          position: fixed;
          top: 0px;
          right: 0px;
          width: 100%;
          height: calc(0.5rem + 30vh);
          padding: 0px;
          margin: 0px;
          z-index: -1;
          background-color: #00a99d;
        }

        #footer {
          width: calc(0.5rem + 60%);
          margin: auto;
          margin-bottom: calc(0.5rem + 2vh);
        }

        #footer span {
          display: block;
        }

        span.heavy {
          font-weight: bold;
        }

        /* FORM CONTROLS */
        h1, h2, h3, h4, h5, h6 {
          color: #00a99d;
          font-weight: bold;
        }

        p, blockquote, address, output {
          color: #777;
        }

        address {
          font-style: italic;
        }

        blockquote {
          color: #555;
        }

        label {
          font-size: calc(0.5rem + 1vmin);
          color: #555;
        }

        .fb-checkbox-group, .fb-radio-group {
          width: calc(0.5rem + 50%);
          border-left: 2px solid #ccc;
          padding: calc(0.5rem + 1vmin);
        }

        .checkbox-group label, .radio-group label {
          color: #666;
        }

        .fb-radio-inline, .fb-checkbox-inline {
          display: inline;
          margin-right: 10vmin;
        }

        .fb-number {
          width: calc(0.5rem + 20%);
        }

        .fb-text, .fb-textarea, .fb-select, .fb-date {
          width: calc(0.5rem + 60%);
        }

        .tooltip-element {
          padding: calc(0.5rem + 0.1vmin);
          font-size: calc(0.5rem + 0.5vmin);
          background-color: #00a99d;
          border-radius: 25px;
          color: #fff;
          display: none;
        }

        .fb-required {
          color: #ff0000;
        }

        #scrim {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          opacity: 0.8;
          z-index: 17;
          display: none;
        }
      </style>
    </head>
    <body class="container">
      <div id="wrapper">
        <form action="https://marknolledo.pythonanywhere.com/sibyl/write" method="POST" id="generatedForm" name="generatedForm">
          <input type="hidden" id="tableId" name="tableId" value="${formId}">
          ${$renderContainer.html()}
        </form>
      </div>
      <div id="footer">
        <span class="subtexts heavy">This form is created using Sibyl.</span>
        <span class="subtexts micro">&copy; 2019 Team Sibyl S2</span>
      </div>
      <!-- PAGE BACKGROUND -->
      <div id="page--splitter-background"></div>

      <!-- SCRIM -->
      <div id="scrim"></div>

      <script>
        $(document).ajaxStart(function() {
          $('#scrim').fadeToggle(300);
        });

        $('#generatedForm').submit(function() {
          form = $(this);
          $formData = new FormData(document.querySelector('#generatedForm'));
          $formId = document.querySelector('#tableId');
          $formValues = [];

          // PUSH ALL VALUES TO AN ARRAY
          for (var pair of $formData.entries()) {
            $formValues.push(pair[1]);
          }

          // For debugging LULZ
          console.log($formId.value);
          console.log('Updated form values: ', $formValues);

          $.ajax({
              type: 'POST',
              url: 'https://marknolledo.pythonanywhere.com/sibyl/write',
              data: {tableName: $formId.value, formData: JSON.stringify($formValues)},
              error: function(response)
              {
                 alert("Request Failed: " + response);
              },
              success: function(response)
              {
                 console.log(response);
                 window.location.replace('https://marknolledo.pythonanywhere.com/sibyl/thanks');
              }
          });
          return false;
        });
      </script>
      </body>
    </html>`;
    var formPreviewWindow = window.open('', 'formPreview', 'height=480,width=640,toolbar=no,scrollbars=yes');
    formPreviewWindow.document.write(html);
    var style = document.createElement('link');
    style.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css');
    style.setAttribute('rel', 'stylesheet');
    style.setAttribute('type', 'text/css');
    formPreviewWindow.document.head.appendChild(style);

    // Log the complete HTML code
    console.log('Preview: \n' + html);
    console.log('To write: \n' + html_toWrite);

    $filename = $formName.value + '-' + $formID;
    writeForm($filename, html_toWrite);
  }

  // THEN WRITE IT DOWN FOR DOWNLOAD.
  function writeForm(filename, formHtml) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(formHtml));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    $('#scrim').fadeIn(300, function() {
      $('#uploader--parent-container').fadeIn(300);
    });
  }

  // Scrim and uploader controls
  document.querySelector('#uploader').addEventListener('change', function() {
    if ($(this).value != '') {
      $('#submit--notifier').fadeIn(300);
    }
    else {
      $('#submit--notifier').fadeOut(300);
    }
  });

  document.querySelector('#scrim').addEventListener('click', function() {
    $('#uploader--parent-container').fadeOut(300, function() {
      $('#scrim').fadeOut(300);
    });
  });
});
