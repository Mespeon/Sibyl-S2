// Start form builder when form is ready
$(document).ready(function() {
  //$(document.getElementById('build-wrap')).formBuilder();   // Basic form with no functions

  // Form Builder with Form Render
  jQuery(function($) {
    var $fbEditor = $(document.getElementById('build-wrap')),
      $formContainer = $(document.getElementById('build-render')),
      $formHeaders = $(document.getElementById('build-render-headers')),
      fbOptions = {
        onSave: function() {
          $fbEditor.toggle();
          $formContainer.toggle();
          $formHeaders.toggle();
          $('form', $formContainer).formRender({
            formData: formBuilder.formData
          });
        }
      },
      formBuilder = $fbEditor.formBuilder(fbOptions);

    $('.edit-form', $formContainer).click(function() {
      $fbEditor.toggle();
      $formContainer.toggle();
      $formHeaders.toggle();
    });
  });
});
