/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.tinymce', [])
  .value('uiTinymceConfig', {})
  .value('uiTinymceSetup', function (ed) {})
  .directive('uiTinymce', ['uiTinymceConfig', 'uiTinymceSetup', function (uiTinymceConfig, uiTinymceSetup) {
    uiTinymceConfig = uiTinymceConfig || {};
    var generatedIds = 0;
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ngModel) {
        var expression, options, tinyInstance;
        // generate an ID if not present
        if (!attrs.id) {
          attrs.$set('id', 'uiTinymce' + generatedIds++);
        }
        options = {
          // Update model on button click
          onchange_callback: function (inst) {
            if (this.getContent() !== elm.val()) {
              inst.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase) {
                scope.$apply();
              }
            }
          },
          // Update model on keypress
          handle_event_callback: function (e) {
            if (this.getContent() !== elm.val()) {
              this.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase) {
                scope.$apply();
              }
            }
            return true; // Continue handling
          },
          // Update model when calling setContent (such as from the source editor popup)
          setup: function (ed) {
            ed.onInit.add(function(ed) {
              ngModel.$render();
            });
            ed.onSetContent.add(function (ed, o) {
              if (ed.getContent() !== elm.val()) {
                ed.save();
                ngModel.$setViewValue(elm.val());
                if (!scope.$$phase) {
                  scope.$apply();
                }
              }
            });
            if (uiTinymceSetup) {
              uiTinymceSetup(ed);
            }
          },
          mode: 'exact',
          elements: attrs.id
        };
        if (attrs.uiTinymce) {
          expression = scope.$eval(attrs.uiTinymce);
        } else {
          expression = {};
        }
        angular.extend(options, uiTinymceConfig, expression);
        setTimeout(function () {
          tinymce.init(options);
        });

        ngModel.$render = function() {
          if (!tinyInstance) {
            tinyInstance = tinymce.get(attrs.id);
          }
          if (tinyInstance) {
            tinyInstance.setContent(ngModel.$viewValue || '');

            var contentAreaContainer = angular.element(tinyInstance.contentAreaContainer);

            contentAreaContainer.find('iframe')[0].contentWindow.document.body.onclick = function () {
              var event = document.createEvent('MouseEvent');
              event.initEvent('click', true, true);
              elm[0].dispatchEvent(event);
            };
          }
        };
      }
    };
  }]);
