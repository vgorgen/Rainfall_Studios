"use strict";
const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'vertical',
    loop: true,
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  
    // And if we need scrollbar
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });
  
var VsApp = function() {
    var sm_strFootnoteElement = 'sup';
    var sm_strContentId = '#content';

    var sm_strContext = 'default';

    function _EasyScrollToForLocalLinks() {
        $J('a[href^="#"]').on(
            'click touch',
            function(event) {
                event.preventDefault();
                var $m_Target = $J($J(this).attr('href'));

                if ($m_Target.length > 0) {
                    $J('html, body').stop().animate({
                            scrollTop: $m_Target.offset().top
                        },
                        1000
                    );
                }
            }
        );
    }

    function _NavigateToFootnote() {
        $J('a[href^="#"].footnoted').on(
            'click touch',
            function(m_Event) {
                m_Event.preventDefault();
                var $m_Footnote = $J($J(this).attr('href'));

                if ($J(window).width() < 992) {
                    if ($m_Footnote.length > 0) {
                        if ($m_Footnote.parent().is(":hidden")) {
                            $m_Footnote.parent().slideDown();
                        } else {
                            $m_Footnote.parent().slideUp();
                        }
                    }
                } else {
                    $J('html, body').stop().animate({
                            scrollTop: $m_Footnote.offset().top
                        },
                        1000
                    );
                }
            }
        );
    }

    function _FootnoteMarkup(m_iFootnoteNumber) {
        return '<' + sm_strFootnoteElement + '>' + m_iFootnoteNumber + '</' + sm_strFootnoteElement + '>';
    }

    function _ContentFootnotes() {
        $J('.footnoted sup').remove();
        $J('.footnote sup').remove();

        $J.each(
            $J('section'),
            function(key, m_elSection) {
                var $m_SectionFootnotes = $J(m_elSection).find(".footnote");
                $m_SectionFootnotes.detach().appendTo($J(m_elSection).find('.footnotes'));
                var $m_FirstFootnote = $m_SectionFootnotes.first();
                if ($m_FirstFootnote.attr('id') !== undefined) {
                    var $m_FirstFootnoted = $J(this).find('[href=#' + $m_FirstFootnote.attr('id') + ']');

                    if ($m_FirstFootnoted.length) {
                        var m_iFootnoteTopDifference = $m_FirstFootnoted.offset().top - $m_FirstFootnote.offset().top;

                        if (m_iFootnoteTopDifference > 0) {
                            $m_FirstFootnote.css('margin-top', m_iFootnoteTopDifference);
                        }
                    }
                }
            }
        );

        var m_iStartingFootnoteValue = 0;

        $J.each(
            $J('.footnoted'),
            function(m_iFootnotedKey, m_elFootnoted) {
                var m_iFootnoteVal = parseInt(m_iStartingFootnoteValue + m_iFootnotedKey + 1);
                $J(m_elFootnoted).append(_FootnoteMarkup(m_iFootnoteVal));

                var $m_Footnote = $J($J('.footnote')[m_iFootnotedKey]);

                $m_Footnote.prepend(_FootnoteMarkup(m_iFootnoteVal));

                if ($J(m_elFootnoted).is('[data-content-target]')) {
                    $m_Footnote.attr('data-content-target', $J(m_elFootnoted).attr('data-content-target'));
                }
            }
        );
    }

    function _TextareaAutoResize() {
        $J('textarea').on(
            'paste input',
            function() {
                if ($J(this).outerHeight() > this.scrollHeight) {
                    $J(this).height(1)
                }

                while (
                    $J(this).outerHeight() < this.scrollHeight +
                    parseFloat($J(this).css("borderTopWidth")) +
                    parseFloat($J(this).css("borderBottomWidth"))
                ) {
                    $J(this).height($J(this).height() + 1);
                }
            }
        );
    }

    function _CustomFileChooser() {
        $J.each(
            $J('.input_file_default'),
            function(key, m_DefaultInput) {
                var $m_CustomFileInput = $J(m_DefaultInput).siblings('label.input_file_custom');
                $J(m_DefaultInput).on(
                    'change',
                    function() {
                        var m_rgFile = $J(this).prop('files');
                        if (m_rgFile) {
                            if (m_rgFile.length > 1) {
                                $m_CustomFileInput.find('.input_file_selected_msg').html(m_rgFile.length + ' files selected.');
                            } else if (m_rgFile.length === 1) {
                                $m_CustomFileInput.find('.input_file_selected_msg').html(_EscapeHtml(m_rgFile[0]['name']));
                            } else {
                                $m_CustomFileInput.find('.input_file_selected_msg').html('No files chosen.');
                            }
                        }
                    }
                );
            }
        );
    }

    function _EscapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    function _FormSubmitError(m_Form, rgErrors) {
        var $m_ErrorModal = $J(m_Form).find('.modals .error_modal');
        if (rgErrors !== undefined && rgErrors.length > 0) {
            var m_strErrorsHtml = '<ul>';

            $J.each(
                rgErrors,
                function(key, m_strError) {
                    m_strErrorsHtml += '<li class="error">' + m_strError + '</li>';
                }
            )

            m_strErrorsHtml += '</ul>'

            $m_ErrorModal.find('.errors').html(m_strErrorsHtml);
        }
        $m_ErrorModal.show();
        $m_ErrorModal.on(
            'click',
            function(m_Event) {
                m_Event.preventDefault();
                $m_ErrorModal.hide();
            }
        );
        grecaptcha.reset();
    }

    function _FormSubmitSuccess(m_Form) {
        var $m_SuccessModal = $J(m_Form).find('.modals .success_modal');
        $m_SuccessModal.show();
        $m_SuccessModal.on(
            'click',
            function(m_Event) {
                m_Event.preventDefault();
                $m_SuccessModal.hide();
            }
        );
        $J(m_Form).find('input:visible, textarea, select').val('').change();
        grecaptcha.reset();
    }

    function _FormSubmitGAEvent(strEventType, bIsError) {
        var rgEventDetails = {
            value: 1
        };

        if (bIsError !== undefined && bIsError) {
            strEventType = strEventType + '_error';
            rgEventDetails.value = 0;
        } else {
            strEventType = strEventType + '_success';
        }

        if (gtag !== undefined) {
            gtag(
                'event',
                strEventType,
                rgEventDetails
            );
        }
    }

    function _FormHandler() {
        var $m_Forms = $J('form[action]');
        if ($m_Forms.length > 0) {
            $J.each(
                $m_Forms,
                function(key, m_Form) {
                    $J(m_Form).on(
                        'submit',
                        function(m_Event) {
                            m_Event.preventDefault();
                            var strFormType = $J(m_Form).data('form-type');
                            var m_FormData = new FormData(this);

                            var $m_LoadingModal = $J(m_Form).find('.modals .loading_modal');
                            $m_LoadingModal.show();

                            $J.ajax({
                                url: $J(m_Form).attr('action'),
                                type: 'POST',
                                processData: false,
                                contentType: false,
                                data: m_FormData
                            }).done(
                                function(m_Data) {
                                    if (m_Data.bSuccess == true) {
                                        $m_LoadingModal.hide();
                                        _FormSubmitSuccess(m_Form);
                                        _FormSubmitGAEvent(strFormType)
                                    } else {
                                        $m_LoadingModal.hide();
                                        _FormSubmitError(m_Form, m_Data.rgErrors);
                                        _FormSubmitGAEvent(strFormType, true)
                                    }
                                }
                            ).fail(
                                function(xhr) {
                                    var m_rgErrors = [];

                                    if (xhr.status === 413) {
                                        m_rgErrors.push('Attachment file size is too large.');
                                    } else {
                                        m_rgErrors.push('There was an unexpected error submitting your application.');
                                    }

                                    _FormSubmitError(m_rgErrors);

                                    rgEventDetails.description = 'Form Submission Failure';
                                    rgEventDetails.value = 0;
                                    _FormSubmitGAEvent(strFormType, true)
                                }
                            );
                        }
                    );
                }
            );
        }
    }

    function _SelectWithExtraData() {
        $J('select').on(
            'change',
            function() {
                $J(this).find('option').each(
                    function(index, option) {
                        option = $J(option);
                        var extraSelector = option.data('extra-selector');
                        $J(extraSelector).toggleClass('selected', option.is(':selected'));
                    }

                );
            }
        );
    }

    function _UpdateContext() {
        $J('body').attr('data-vsapp-context', sm_strContext);
    }

    function SetContext(strContext) {
        sm_strContext = strContext;

        _UpdateContext();

        _ContentFootnotes(sm_strContentId);
        _NavigateToFootnote();

        _TextareaAutoResize();
        _CustomFileChooser();
        _SelectWithExtraData();
        _FormHandler();

        _EasyScrollToForLocalLinks();

        console.info('Hello! Have you read about our security philosophy? And how to report issues to us? Check it out at https://www.motionblur.com/tr/security');
    }

    function GetContext() {
        return sm_strContext;
    }

    function Init(strContext) {
        SetContext(strContext)
    }

    return {
        Init: Init,
        SetContext: SetContext,
        GetContext: GetContext
    }
}();


$J(document).ready(
    function() {
        var m_strContext = $J('#content').attr('data-content-context');
        VsApp.Init(m_strContext);
    }
);