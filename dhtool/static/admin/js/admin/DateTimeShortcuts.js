/*global addEvent, Calendar, cancelEventPropagation, findPosX, findPosY, getStyle, get_format, 
 gettext, interpolate, ngettext, quickElement, removeEvent*/
// Inserts shortcut buttons after all of the following:
//     <input type="text" class="vDateField">
//     <input type="text" class="vTimeField">
(function() {
    'use strict';
    var DateTimeShortcuts = {
        calendars: [],
        calendarInputs: [],
        clockInputs: [],
        dismissClockFunc: [],
        dismissCalendarFunc: [],
        calendarDivName1: 'calendarbox', // name of calendar <div> that gets toggled
        calendarDivName2: 'calendarin',  // name of <div> that contains calendar
        calendarLinkName: 'calendarlink',// name of the link that is used to toggle
        clockDivName: 'clockbox',        // name of clock <div> that gets toggled
        clockLinkName: 'clocklink',      // name of the link that is used to toggle
        shortCutsClass: 'datetimeshortcuts', // class of the clock and cal shortcuts
        timezoneWarningClass: 'timezonewarning', // class of the warning for timezone mismatch
        timezoneOffset: 0,
        init: function() {
            var body = document.getElementsByTagName('body')[0];
            var serverOffset = body.getAttribute('data-admin-utc-offset');
            if (serverOffset) {
                var localOffset = new Date().getTimezoneOffset() * -60;
                DateTimeShortcuts.timezoneOffset = localOffset - serverOffset;
            }

            var inputs = document.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                var inp = inputs[i];
                if (inp.getAttribute('type') === 'text' && inp.className.match(/vTimeField/)) {
                    DateTimeShortcuts.addClock(inp);
                    DateTimeShortcuts.addTimezoneWarning(inp);
                }
                else if (inp.getAttribute('type') === 'text' && inp.className.match(/vDateField/)) {
                    DateTimeShortcuts.addCalendar(inp);
                    DateTimeShortcuts.addTimezoneWarning(inp);
                }
            }
        },
        // Return the current time while accounting for the server timezone.
        now: function() {
            var body = document.getElementsByTagName('body')[0];
            var serverOffset = body.getAttribute('data-admin-utc-offset');
            if (serverOffset) {
                var localNow = new Date();
                var localOffset = localNow.getTimezoneOffset() * -60;
                localNow.setTime(localNow.getTime() + 1000 * (serverOffset - localOffset));
                return localNow;
            } else {
                return new Date();
            }
        },
        // Add a warning when the time zone in the browser and backend do not match.
        addTimezoneWarning: function(inp) {
            var $ = django.jQuery;
            var warningClass = DateTimeShortcuts.timezoneWarningClass;
            var timezoneOffset = DateTimeShortcuts.timezoneOffset / 3600;

            // Only warn if there is a time zone mismatch.
            if (!timezoneOffset) {
                return;
            }

            // Check if warning is already there.
            if ($(inp).siblings('.' + warningClass).length) {
                return;
            }

            var message;
            if (timezoneOffset > 0) {
                message = ngettext(
                    'Note: You are %s hour ahead of server time.',
                    'Note: You are %s hours ahead of server time.',
                    timezoneOffset
                );
            }
            else {
                timezoneOffset *= -1;
                message = ngettext(
                    'Note: You are %s hour behind server time.',
                    'Note: You are %s hours behind server time.',
                    timezoneOffset
                );
            }
            message = interpolate(message, [timezoneOffset]);

            var $warning = $('<span>');
            $warning.attr('class', warningClass);
            $warning.text(message);

            $(inp).parent()
                .append($('<br>'))
                .append($warning);
        },
        // Add clock widget to a given field
        addClock: function(inp) {
            var num = DateTimeShortcuts.clockInputs.length;
            DateTimeShortcuts.clockInputs[num] = inp;
            DateTimeShortcuts.dismissClockFunc[num] = function() { 
                DateTimeShortcuts.dismissClock(num); return true; 
            };
            // Shortcut links (clock icon and "Now" link)
            var shortcutsSpan = document.createElement('span');
            shortcutsSpan.className = DateTimeShortcuts.shortCutsClass;
            inp.parentNode.insertBefore(shortcutsSpan, inp.nextSibling);
            var nowLink = document.createElement('a');
            nowLink.setAttribute('href', "#");
            nowLink.appendChild(document.createTextNode(gettext('Now')));
            addEvent(nowLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleClockQuicklink(num, -1);
            });
            var clockLink = document.createElement('a');
            clockLink.setAttribute('href', '#');
            clockLink.id = DateTimeShortcuts.clockLinkName + num;
            addEvent(clockLink, 'click', function(e) {
                e.preventDefault();
                // avoid triggering the document click handler to dismiss the clock
                e.stopPropagation();
                DateTimeShortcuts.openClock(num);
            });

            quickElement(
                'span', clockLink, '',
                'class', 'clock-icon',
                'title', gettext('Choose a Time')
            );
            shortcutsSpan.appendChild(document.createTextNode('\u00A0'));
            shortcutsSpan.appendChild(nowLink);
            shortcutsSpan.appendChild(document.createTextNode('\u00A0|\u00A0'));
            shortcutsSpan.appendChild(clockLink);

            var clockBox = document.createElement('div');
            clockBox.style.display = 'none';
            clockBox.style.position = 'absolute';
            clockBox.className = 'clockbox module';
            clockBox.setAttribute('id', DateTimeShortcuts.clockDivName + num);
            document.body.appendChild(clockBox);
            addEvent(clockBox, 'click', cancelEventPropagation);

            quickElement('h2', clockBox, gettext('Choose a time'));
            var timeList = quickElement('ul', clockBox);
            timeList.className = 'timelist';
            var timeLink = quickElement("a", quickElement("li", timeList), gettext("Now"), 
                "href", "#");
            addEvent(timeLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleClockQuicklink(num, -1);
            });
            timeLink = quickElement("a", quickElement("li", timeList), gettext("Midnight"), 
                "href", "#");
            addEvent(timeLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleClockQuicklink(num, 0);
            });
            timeLink = quickElement("a", quickElement("li", timeList), gettext("6 a.m."), 
                "href", "#");
            addEvent(timeLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleClockQuicklink(num, 6);
            });
            timeLink = quickElement("a", quickElement("li", timeList), gettext("Noon"), 
                "href", "#");
            addEvent(timeLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleClockQuicklink(num, 12);
            });
            timeLink = quickElement("a", quickElement("li", timeList), gettext("6 p.m."), 
                "href", "#");
            addEvent(timeLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleClockQuicklink(num, 18);
            });

            var cancelP = quickElement('p', clockBox);
            cancelP.className = 'calendar-cancel';
            var cancelLink = quickElement('a', cancelP, gettext('Cancel'), 'href', '#');
            addEvent(cancelLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.dismissClock(num);
            });

            django.jQuery(document).bind('keyup', function(event) {
                if (event.which === 27) {
                    // ESC key closes popup
                    DateTimeShortcuts.dismissClock(num);
                    event.preventDefault();
                }
            });
        },
        openClock: function(num) {
            var clockBox = document.getElementById(DateTimeShortcuts.clockDivName + num);
            var clockLink = document.getElementById(DateTimeShortcuts.clockLinkName + num);

            // Recalculate the clockbox position
            // is it left-to-right or right-to-left layout ?
            if (getStyle(document.body, 'direction') !== 'rtl') {
                clockBox.style.left = findPosX(clockLink) + 17 + 'px';
            }
            else {
                // since style's width is in em, it'd be tough to calculate
                // px value of it. let's use an estimated px for now
                // TODO: IE returns wrong value for findPosX when in rtl mode
                //       (it returns as it was left aligned), needs to be fixed.
                clockBox.style.left = findPosX(clockLink) - 110 + 'px';
            }
            clockBox.style.top = Math.max(0, findPosY(clockLink) - 30) + 'px';

            // Show the clock box
            clockBox.style.display = 'block';
            addEvent(document, 'click', DateTimeShortcuts.dismissClockFunc[num]);
        },
        dismissClock: function(num) {
            document.getElementById(DateTimeShortcuts.clockDivName + num).style.display = 'none';
            removeEvent(document, 'click', DateTimeShortcuts.dismissClockFunc[num]);
        },
        handleClockQuicklink: function(num, val) {
            var d;
            if (val === -1) {
                d = DateTimeShortcuts.now();
            }
            else {
                d = new Date(1970, 1, 1, val, 0, 0, 0);
            }
            DateTimeShortcuts.clockInputs[num].value = d.strftime(get_format('TIME_INPUT_FORMATS')[0]);
            DateTimeShortcuts.clockInputs[num].focus();
            DateTimeShortcuts.dismissClock(num);
        },
        // Add calendar widget to a given field.
        addCalendar: function(inp) {
            var num = DateTimeShortcuts.calendars.length;

            DateTimeShortcuts.calendarInputs[num] = inp;
            DateTimeShortcuts.dismissCalendarFunc[num] = function() { 
                DateTimeShortcuts.dismissCalendar(num); return true; 
            };

            // Shortcut links (calendar icon and "Today" link)
            var shortcutsSpan = document.createElement('span');
            shortcutsSpan.className = DateTimeShortcuts.shortCutsClass;
            inp.parentNode.insertBefore(shortcutsSpan, inp.nextSibling);
            var todayLink = document.createElement('a');
            todayLink.setAttribute('href', '#');
            todayLink.appendChild(document.createTextNode(gettext('Today')));
            addEvent(todayLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleCalendarQuickLink(num, 0);
            });
            var calLink = document.createElement('a');
            calLink.setAttribute('href', '#');
            calLink.id = DateTimeShortcuts.calendarLinkName + num;
            addEvent(calLink, 'click', function(e) {
                e.preventDefault();
                // avoid triggering the document click handler to dismiss the calendar
                e.stopPropagation();
                DateTimeShortcuts.openCalendar(num);
            });
            quickElement(
                'span', calLink, '',
                'class', 'date-icon',
                'title', gettext('Choose a Date')
            );
            shortcutsSpan.appendChild(document.createTextNode('\u00A0'));
            shortcutsSpan.appendChild(todayLink);
            shortcutsSpan.appendChild(document.createTextNode('\u00A0|\u00A0'));
            shortcutsSpan.appendChild(calLink);

            var calBox = document.createElement('div');
            calBox.style.display = 'none';
            calBox.style.position = 'absolute';
            calBox.className = 'calendarbox module';
            calBox.setAttribute('id', DateTimeShortcuts.calendarDivName1 + num);
            document.body.appendChild(calBox);
            addEvent(calBox, 'click', cancelEventPropagation);

            // next-prev links
            var calNav = quickElement('div', calBox);
            var calNavPrev = quickElement('a', calNav, '<', 'href', '#');
            calNavPrev.className = 'calendarnav-previous';
            addEvent(calNavPrev, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.drawPrev(num);
            });

            var calNavNext = quickElement('a', calNav, '>', 'href', '#');
            calNavNext.className = 'calendarnav-next';
            addEvent(calNavNext, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.drawNext(num);
            });

            // main box
            var calMain = quickElement('div', calBox, '', 'id', 
                DateTimeShortcuts.calendarDivName2 + num);
            calMain.className = 'calendar';
            DateTimeShortcuts.calendars[num] = new Calendar(DateTimeShortcuts.calendarDivName2 + num, 
                DateTimeShortcuts.handleCalendarCallback(num));
            DateTimeShortcuts.calendars[num].drawCurrent();

            // calendar shortcuts
            var shortcuts = quickElement('div', calBox);
            shortcuts.className = 'calendar-shortcuts';
            var dayLink = quickElement('a', shortcuts, gettext('Yesterday'), 'href', '#');
            addEvent(dayLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleCalendarQuickLink(num, -1);
            });
            shortcuts.appendChild(document.createTextNode('\u00A0|\u00A0'));
            dayLink = quickElement('a', shortcuts, gettext('Today'), 'href', '#');
            addEvent(dayLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleCalendarQuickLink(num, 0);
            });
            shortcuts.appendChild(document.createTextNode('\u00A0|\u00A0'));
            dayLink = quickElement('a', shortcuts, gettext('Tomorrow'), 'href', '#');
            addEvent(dayLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.handleCalendarQuickLink(num, +1);
            });

            // cancel bar
            var cancelP = quickElement('p', calBox);
            cancelP.className = 'calendar-cancel';
            var cancelLink = quickElement('a', cancelP, gettext('Cancel'), 'href', '#');
            addEvent(cancelLink, 'click', function(e) {
                e.preventDefault();
                DateTimeShortcuts.dismissCalendar(num);
            });
            django.jQuery(document).bind('keyup', function(event) {
                if (event.which === 27) {
                    // ESC key closes popup
                    DateTimeShortcuts.dismissCalendar(num);
                    event.preventDefault();
                }
            });
        },
        openCalendar: function(num) {
            var calBox = document.getElementById(DateTimeShortcuts.calendarDivName1 + num);
            var calLink = document.getElementById(DateTimeShortcuts.calendarLinkName + num);
            var inp = DateTimeShortcuts.calendarInputs[num];

            // Determine if the current value in the input has a valid date.
            // If so, draw the calendar with that date's year and month.
            if (inp.value) {
                var format = get_format('DATE_INPUT_FORMATS')[0];
                var selected = inp.value.strptime(format);
                var year = selected.getUTCFullYear();
                var month = selected.getUTCMonth() + 1;
                var re = /\d{4}/;
                if (re.test(year.toString()) && month >= 1 && month <= 12) {
                    DateTimeShortcuts.calendars[num].drawDate(month, year, selected);
                }
            }

            // Recalculate the clockbox position
            // is it left-to-right or right-to-left layout ?
            if (getStyle(document.body, 'direction') !== 'rtl') {
                calBox.style.left = findPosX(calLink) + 17 + 'px';
            }
            else {
                // since style's width is in em, it'd be tough to calculate
                // px value of it. let's use an estimated px for now
                // TODO: IE returns wrong value for findPosX when in rtl mode
                //       (it returns as it was left aligned), needs to be fixed.
                calBox.style.left = findPosX(calLink) - 180 + 'px';
            }
            calBox.style.top = Math.max(0, findPosY(calLink) - 75) + 'px';

            calBox.style.display = 'block';
            addEvent(document, 'click', DateTimeShortcuts.dismissCalendarFunc[num]);
        },
        dismissCalendar: function(num) {
            document.getElementById(DateTimeShortcuts.calendarDivName1 + num).style.display = 'none';
            removeEvent(document, 'click', DateTimeShortcuts.dismissCalendarFunc[num]);
        },
        drawPrev: function(num) {
            DateTimeShortcuts.calendars[num].drawPreviousMonth();
        },
        drawNext: function(num) {
            DateTimeShortcuts.calendars[num].drawNextMonth();
        },
        handleCalendarCallback: function(num) {
            var format = get_format('DATE_INPUT_FORMATS')[0];
            // the format needs to be escaped a little
            format = format.replace('\\', '\\\\');
            format = format.replace('\r', '\\r');
            format = format.replace('\n', '\\n');
            format = format.replace('\t', '\\t');
            format = format.replace("'", "\\'");
            return function(y, m, d) {
                DateTimeShortcuts.calendarInputs[num].value = new Date(y, m - 1, d).strftime(format);
                DateTimeShortcuts.calendarInputs[num].focus();
                document.getElementById(DateTimeShortcuts.calendarDivName1 + num).style.display = 'none';
            };
        },
        handleCalendarQuickLink: function(num, offset) {
            var d = DateTimeShortcuts.now();
            d.setDate(d.getDate() + offset);
            DateTimeShortcuts.calendarInputs[num].value = d.strftime(get_format('DATE_INPUT_FORMATS')[0]);
            DateTimeShortcuts.calendarInputs[num].focus();
            DateTimeShortcuts.dismissCalendar(num);
        }
    };

    addEvent(window, 'load', DateTimeShortcuts.init);
    window.DateTimeShortcuts = DateTimeShortcuts;
})();
