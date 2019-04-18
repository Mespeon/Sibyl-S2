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
          'starRating'
        ],

        disabledAttrs: [
          'access',
          'className',
          'other',
          'multiple'
        ],

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
      //showToast('Processing form. Please wait.');
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
      tableName = $formName.value;  // the table / form name
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
    $('.view-js', $formContainer).click(function() {
      console.log(Date.now() / 1000 | 0);

      // Get the JS object of the form
      js = formBuilder.actions.getData();

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
    let html = `<!DOCTYPE html><head><title>Sibyl Forms</title></head><body class="container"><h1>Preview</h1><hr>${$renderContainer.html()}</body></html>`;
    let html_toWrite = `
    <!DOCTYPE html>
    <head>
    <title>Sibyl Forms</title>
    <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' type='text/css'>
    </head>
    <body class="container">
    <h1>Sample Form</h1><hr>
    <form action="https://marknolledo.pythonanywhere.com/sibyl/test" method="POST">
    ${$renderContainer.html()}
    </form>
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
  }
});
