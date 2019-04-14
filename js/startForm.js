// Start form builder when page is ready
$(document).ready(function() {
  //$(document.getElementById('build-wrap')).formBuilder();   // Basic form with no functions

  // Form Builder with Form Render
  jQuery(function($) {
    // The form builder itself
    var $fbEditor = $(document.getElementById('build-wrap')),
      $formContainer = $(document.getElementById('build-render')),
      $formHeaders = $(document.getElementById('build-render-headers')),
      $formHTML = $(document.getElementById('build-html-viewer')),
      fbOptions = {
        onSave: function(formData) {
          // The form builder's render view
          $fbEditor.toggle();
          $formContainer.toggle();
          $formHeaders.toggle();
          $('form', $formContainer).formRender({
            formData: formBuilder.formData
          });
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

        disabledAttrs: [
          'access'
        ],

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

    // Toggle action for the form builder's Render Preview
    $('.edit-form', $formContainer).click(function() {
      $fbEditor.toggle();
      $formContainer.toggle();
      $formHeaders.toggle();
      $formHTML.hide();
      $formHTML.removeClass('active');
    });

    // Toggle action for Export to HTML
    $('.export-html', $formContainer).click(function() {
      html = $formContainer.formRender('html');
      xml = formBuilder.actions.getData('xml');
      showToast('Exporting as HTML.');

      createForm(xml);

      //console.log(html);
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

    // Toggle action for View XML
    $('.view-xml', $formContainer).click(function() {
      console.log(Date.now() / 1000 | 0);

      xml = formBuilder.actions.getData('xml');
      console.log(xml);
    });

    // // Toggle for getting the form data XML (for debugging)
    // document.getElementById('getXML').addEventListener('click', function() {
    //   console.log(formBuilder.actions.getData('xml'));
    // });
  });

  // EXPORT AND COPY HANDLERS
  function showToast(text) {
    $('.toast--message').html(text);
    $('.toast--message').fadeToggle(300, function() {
      setTimeout(function() {
        $('.toast--message').fadeToggle(300);
      }, 2000);
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
    ${$renderContainer.html()}
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

    $filename = 'sibyl-forms' + (Date.now() / 1000 | 0);
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
