"use strict";

var VsJobs = function() {
    function _JobSearch(m_Form) {
        // Delay for the keyup on search so we're not hammering search with every key typing
        var m_Delay = (
            function() {
                var timer = 0;
                return function(callback, ms) {
                    clearTimeout(timer);
                    timer = setTimeout(callback, ms);
                }
            }
        )();

        $J(m_Form).attr('action', '#');
        $J(m_Form).addClass('filterform');
        var $m_Input = $J(m_Form).find('input');
        $m_Input.addClass('filterinput');
        var $m_SearchButton = $J(m_Form).find('.search_button');
        var $m_ClearButton = $J(m_Form).find('.clear_button');

        $J(m_Form).on(
            'click touch',
            '.clear_button',
            function(m_Event) {
                m_Event.stopPropagation();
                $m_Input.val('').change();
            }
        ).on(
            'submit',
            function(m_Event) {
                m_Event.preventDefault();
            }
        );

        $m_Input.change(
            function(m_Event) {
                var m_strFilter = $J(this).val();

                // encode any html tags
                m_strFilter = m_strFilter.replace(/</g, "&lt;").replace(/>/g, "&gt;");

                if (m_strFilter) {
                    $m_SearchButton.hide();
                    $m_ClearButton.show();

                    m_Delay(
                        function() {
                            $J.get(
                                'https://www.motionblur.com/tr/jobs/job-search?search=' + m_strFilter,
                                function(m_Data) {
                                    var m_strResultsHtml = '<div class="row">';
                                    var m_iCounter = 0;

                                    if ($J('.search_form_results_wrapper').height() === 0) {
                                        $J('html, body').animate({
                                            scrollTop: $m_Input.offset().top - 50
                                        }, 1500);
                                    }

                                    if (m_Data.length > 0) {
                                        $J.each(
                                            m_Data,
                                            function(key, m_rgJob) {
                                                m_iCounter++;
                                                m_strResultsHtml += '<div class="job_opening col_4"><a href="https://www.motionblur.com/tr/jobs?job_id=' + m_rgJob['reqid'] + '"><h5 class="job_title">' + m_rgJob['name'] + '</h5></a></div>';
                                                if (m_iCounter % 3 === 0) {
                                                    m_strResultsHtml += '</div><div class="row">'
                                                }
                                            }
                                        );
                                    } else {
                                        var m_strNoSearchResult = "We didn\'t post any jobs for \'%s_jobsearch\'.".replace(/%s_jobsearch/g, m_strFilter);
                                        m_strResultsHtml += "<div class='col_12 job_opening no_results'><h5>" + m_strNoSearchResult + "<br><a href='https://www.motionblur.com/tr/jobs'>Did we miss something?</a></h5>"
                                    }

                                    m_strResultsHtml += '</div>';

                                    $J('.search_form_results').html(m_strResultsHtml);
                                    var $m_searchFormResultsWrapper = $J('.search_form_results_wrapper');
                                    $m_searchFormResultsWrapper.css('height', 'auto');
                                    $J('.search_form_wrapper').css('padding-bottom', $m_searchFormResultsWrapper.height() + 100);
                                }
                            );
                        },
                        250
                    );
                } else {
                    $J('.search_form_results_wrapper').css('height', '0');
                    $J('.search_form_wrapper').css('padding-bottom', '0');
                    $m_SearchButton.show();
                    $m_ClearButton.hide();

                    // Clears any currently running searches
                    m_Delay();
                }

                return false;
            }
        ).keyup(
            function() {
                $J(this).change();
            }
        );
    }

    function _updateUrlParameter(strParam, strValue) {
        var oRegEx = new RegExp("([?&])" + strParam + "=.*?(&|$)", "i");
        var strCurrentUrl = window.location.href;
        var strSeparator = strCurrentUrl.indexOf('?') !== -1 ? "&" : "?";
        var strNewUrl = '';

        if (strValue) {
            if (strCurrentUrl.match(oRegEx)) {
                strNewUrl = strCurrentUrl.replace(oRegEx, '$1' + strParam + "=" + strValue + '$2');
            } else {
                strNewUrl = strCurrentUrl + strSeparator + strParam + "=" + strValue;
            }
        } else {
            strNewUrl = strCurrentUrl.replace(oRegEx, '');
        }

        window.history.pushState("", "", strNewUrl);
    }

    function _convertToQueryObject(strQuery) {
        var rgQueryVars = strQuery.split("&");
        var rgQuery = {};
        for (var i = 0; i < rgQueryVars.length; i++) {
            var rgQueryVarsPair = rgQueryVars[i].split("=");
            // If first entry with this name
            if (typeof rgQuery[rgQueryVarsPair[0]] === "undefined") {
                rgQuery[rgQueryVarsPair[0]] = decodeURIComponent(rgQueryVarsPair[1]);
                // If second entry with this name
            } else if (typeof rgQuery[pair[0]] === "string") {
                rgQuery[rgQueryVarsPair[0]] = [
                    rgQuery[rgQueryVarsPair[0]], decodeURIComponent(rgQueryVarsPair[1])
                ];
                // If third or later entry with this name
            } else {
                rgQuery[rgQueryVarsPair[0]].push(decodeURIComponent(rgQueryVarsPair[1]));
            }
        }
        return rgQuery;
    }

    function _getQueryParamValue(strParam) {
        var strQueryParams = window.location.search.substring(1);
        var rgQuery = _convertToQueryObject(strQueryParams);
        if (rgQuery[strParam]) {
            return rgQuery[strParam];
        }
    }

    function _JobCategoryExpander() {
        var m_strJobCatParam = 'job_cat';

        $J(document).on(
            'click touch',
            '.job_tag:not(.selected):not(.empty_answer) > a',
            function(m_Event) {
                m_Event.preventDefault();

                var $m_Job = $J(this).parent();

                var m_openJobsHeight = 0;
                if ($m_Job.prevAll('.selected').length > 0) {
                    m_openJobsHeight = parseInt($m_Job.prevAll('.selected').css('padding-bottom'), 10);
                }

                _updateUrlParameter(m_strJobCatParam, $m_Job.data(m_strJobCatParam))

                $m_Job.siblings().removeClass('selected').css('padding-bottom', 0);
                $m_Job.siblings().find('.job_openings_wrapper').height(0);
                $m_Job.addClass('selected');

                var $m_jobOpeningsInnerWrapper = $m_Job.find('.job_openings_inner_wrapper');
                var $m_jobOpeningsWrapper = $m_Job.find('.job_openings_wrapper');

                var m_iJobOpeningsNewHeight = $m_jobOpeningsInnerWrapper.outerHeight(true);
                $m_jobOpeningsWrapper.height(m_iJobOpeningsNewHeight);

                var m_iJobOpeningsNewParentPadding = $m_jobOpeningsInnerWrapper.outerHeight(true) + 100;
                $m_Job.css('padding-bottom', m_iJobOpeningsNewParentPadding);

                var m_jobOffsetTop = $m_Job.offset().top - m_openJobsHeight;

                if (m_jobOffsetTop < $J(window).scrollTop()) {
                    var m_newScrollTop = m_jobOffsetTop - 50;
                    setTimeout(
                        function() {
                            $J('html, body').animate({
                                scrollTop: m_newScrollTop
                            }, 500);
                        },
                        250
                    );
                }
            }
        );

        // $J(document).on(
        //     'click touch',
        //     '.job_tag.selected > a',
        //     function(m_Event) {
        //         m_Event.preventDefault();
        //         var $m_Job = $J(this).parent();
        //         _updateUrlParameter(m_strJobCatParam, '')
        //         $m_Job.removeClass('selected').css('padding-bottom', 0);
        //         $m_Job.find('.job_openings_wrapper').height(0);
        //     }
        // );

        var m_strOpenJobCategory = _getQueryParamValue(m_strJobCatParam);
        // if (m_strOpenJobCategory) {
        //     m_strOpenJobCategory = m_strOpenJobCategory.replace(/[^a-zA-Z0-9\/_|+ -]/g, '');
        //     var $m_OpenJobCategory = $J('[data-' + m_strJobCatParam + '=' + m_strOpenJobCategory + ']');
        //     if ($m_OpenJobCategory.length > 0) {
        //         $m_OpenJobCategory.find(' > a').click();
        //         var m_iJobCatTop = $m_OpenJobCategory.offset().top - 100;
        //         if ($J(window).scrollTop() === 0) {
        //             $J('html,body').animate({ scrollTop: m_iJobCatTop }, 500);
        //         }
        //     }
        // }
    }


    function _VideoRotator(iLastVideoIdx) {
        var $elVideos = $J('#page_background_videos .background_video');

        if ($J(window).width() < 1000) {
            $elVideos.find(':not(.mobile)').remove();
        }

        if ($elVideos.length > 0) {
            var iCurrentVideoIdx = 0;
            if (iLastVideoIdx !== undefined) {
                if (iLastVideoIdx < $elVideos.length - 1) {
                    iCurrentVideoIdx = iLastVideoIdx + 1;
                }
            }

            $elVideos.off();
            $elVideos.css('opacity', '0');
            $J($elVideos[iCurrentVideoIdx]).css('opacity', '1')
            $elVideos.get(iCurrentVideoIdx).play();
            $J($elVideos[iCurrentVideoIdx]).on(
                'ended',
                function() {
                    _VideoRotator(iCurrentVideoIdx);
                }
            )
        }
    }

    function Init() {
        _JobSearch('.job_skills .search_form');
        _JobCategoryExpander();
        _VideoRotator();
    }

    return {
        Init: Init
    }
}();

$J(document).ready(
    function() {
        VsJobs.Init();
    }
);