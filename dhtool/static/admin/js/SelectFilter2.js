/*global SelectBox, addEvent, gettext, interpolate, quickElement, SelectFilter*/
/*
SelectFilter2 - Turns a multiple-select box into a filter interface.

Requires jQuery, core.js, and SelectBox.js.
*/
(function($) {
    'use strict';
    function findForm(node) {
        // returns the node of the form containing the given node
        if (node.tagName.toLowerCase() !== 'form') {
            return findForm(node.parentNode);
        }
        return node;
    }

    window.SelectFilter = {
        init: function(fieldId, fieldName, isStacked) {
            if (fieldId.match(/__prefix__/)) {
                // Don't initialize on empty forms.
                return;
            }
            var fromBox = document.getElementById(fieldId);
            fromBox.id += '_from'; // change its ID
            fromBox.className = 'filtered';

            var ps = fromBox.parentNode.getElementsByTagName('p');
            for (var i = 0; i < ps.length; i++) {
                if (ps[i].className.indexOf("info") !== -1) {
                    // Remove <p class="info">, because it just gets in the way.
                    fromBox.parentNode.removeChild(ps[i]);
                } else if (ps[i].className.indexOf("help") !== -1) {
                    // Move help text up to the top so it isn't below the select
                    // boxes or wrapped off on the side to the right of the add
                    // button:
                    fromBox.parentNode.insertBefore(ps[i], fromBox.parentNode.firstChild);
                }
            }
            var selectorDiv = quickElement('div', fromBox.parentNode);
            selectorDiv.className = isStacked ? 'selector stacked' : 'selector';
            var selectorAvailable = quickElement('div', selectorDiv);
            selectorAvailable.className = 'selector-available';
            var titleAvailable = quickElement('h2', selectorAvailable, 
                interpolate(gettext('Available %s') + ' ', [fieldName]));
            quickElement(
                'span', titleAvailable, '',
                'class', 'help help-tooltip help-icon',
                'title', interpolate(
                    gettext(
                        'This is the list of available %s. You may choose some by ' +
                        'selecting them in the box below and then clicking the ' +
                        '"Choose" arrow between the two boxes.'
                    ),
                    [fieldName]
                )
            );

            var filterP = quickElement('p', selectorAvailable, '', 'id', fieldId + '_filter');
            filterP.className = 'selector-filter';

            var searchFilterLabel = quickElement('label', filterP, '', 'for', fieldId + '_input');

            quickElement(
                'span', searchFilterLabel, '',
                'class', 'help-tooltip search-label-icon',
                'title', interpolate(gettext("Type into this box to filter down the list of available %s."), [fieldName])
            );

            filterP.appendChild(document.createTextNode(' '));

            var filterInput = quickElement('input', filterP, '', 'type', 'text', 'placeholder', 
                gettext("Filter"));
            filterInput.id = fieldId + '_input';

            selectorAvailable.appendChild(fromBox);
            var chooseAll = quickElement('a', selectorAvailable, gettext('Choose all'), 'title', 
                interpolate(gettext('Click to choose all %s at once.'), [fieldName]), 'href', '#', 
                'id', fieldId + '_add_all_link');
            chooseAll.className = 'selector-chooseall';

            var selectorChooser = quickElement('ul', selectorDiv);
            selectorChooser.className = 'selector-chooser';
            var addLink = quickElement('a', quickElement('li', selectorChooser), gettext('Choose'), 
                'title', gettext('Choose'), 'href', '#', 'id', fieldId + '_add_link');
            addLink.className = 'selector-add';
            var removeLink = quickElement('a', quickElement('li', selectorChooser), 
                gettext('Remove'), 'title', gettext('Remove'), 'href', '#', 'id', 
                fieldId + '_remove_link');
            removeLink.className = 'selector-remove';

            var selectorChosen = quickElement('div', selectorDiv);
            selectorChosen.className = 'selector-chosen';
            var titleChosen = quickElement('h2', selectorChosen, 
                interpolate(gettext('Chosen %s') + ' ', [fieldName]));
            quickElement(
                'span', titleChosen, '',
                'class', 'help help-tooltip help-icon',
                'title', interpolate(
                    gettext(
                        'This is the list of chosen %s. You may remove some by ' +
                        'selecting them in the box below and then clicking the ' +
                        '"Remove" arrow between the two boxes.'
                    ),
                    [fieldName]
                )
            );

            var toBox = quickElement('select', selectorChosen, '', 'id', fieldId + '_to', 
                'multiple', 'multiple', 'size', fromBox.size, 'name', fromBox.getAttribute('name'));
            toBox.className = 'filtered';
            var clearAll = quickElement('a', selectorChosen, gettext('Remove all'), 'title', 
                interpolate(gettext('Click to remove all chosen %s at once.'), [fieldName]), 
                'href', '#', 'id', fieldId + '_remove_all_link');
            clearAll.className = 'selector-clearall';

            fromBox.setAttribute('name', fromBox.getAttribute('name') + '_old');

            // Set up the JavaScript event handlers for the select box filter interface
            var moveSelection = function(e, elem, moveFunc, from, to) {
                if (elem.className.indexOf('active') !== -1) {
                    moveFunc(from, to);
                    SelectFilter.refreshIcons(fieldId);
                }
                e.preventDefault();
            };
            addEvent(chooseAll, 'click', function(e) { moveSelection(e, this, SelectBox.move_all, 
                fieldId + '_from', fieldId + '_to'); });
            addEvent(addLink, 'click', function(e) { moveSelection(e, this, SelectBox.move, 
                fieldId + '_from', fieldId + '_to'); });
            addEvent(removeLink, 'click', function(e) { moveSelection(e, this, SelectBox.move, 
                fieldId + '_to', fieldId + '_from'); });
            addEvent(clearAll, 'click', function(e) { moveSelection(e, this, SelectBox.move_all, 
                fieldId + '_to', fieldId + '_from'); });
            addEvent(filterInput, 'keypress', function(e) { SelectFilter.filterKeyPress(e, fieldId); });
            addEvent(filterInput, 'keyup', function(e) { SelectFilter.filterKeyUp(e, fieldId); });
            addEvent(filterInput, 'keydown', function(e) { SelectFilter.filterKeyDown(e, fieldId); });
            addEvent(selectorDiv, 'change', function(e) {
                if (e.target.tagName === 'SELECT') {
                    SelectFilter.refreshIcons(fieldId);
                }
            });
            addEvent(selectorDiv, 'dblclick', function(e) {
                if (e.target.tagName === 'OPTION') {
                    if (e.target.closest('select').id === fieldId + '_to') {
                        SelectBox.move(fieldId + '_to', fieldId + '_from');
                    } else {
                        SelectBox.move(fieldId + '_from', fieldId + '_to');
                    }
                    SelectFilter.refreshIcons(fieldId);
                }
            });
            addEvent(findForm(fromBox), 'submit', function() { SelectBox.select_all(fieldId + '_to'); });
            SelectBox.init(fieldId + '_from');
            SelectBox.init(fieldId + '_to');
            // Move selected fromBox options to toBox
            SelectBox.move(fieldId + '_from', fieldId + '_to');

            if (!isStacked) {
                // In horizontal mode, give the same height to the two boxes.
                var jFromBox = $(fromBox);
                var jToBox = $(toBox);
                var resizeFilters = function() { jToBox.height($(filterP).outerHeight() + jFromBox.outerHeight()); };
                if (jFromBox.outerHeight() > 0) {
                    resizeFilters(); // This fieldset is already open. Resize now.
                } else {
                    // This fieldset is probably collapsed. Wait for its 'show' event.
                    jToBox.closest('fieldset').one('show.fieldset', resizeFilters);
                }
            }

            // Initial icon refresh
            SelectFilter.refreshIcons(fieldId);
        },
        anySelected: function(field) {
            var anySelected = false;
            try {
                // Temporarily add the required attribute and check validity.
                // This is much faster in WebKit browsers than the fallback.
                field.attr('required', 'required');
                anySelected = field.is(':valid');
                field.removeAttr('required');
            } catch (e) {
                // Browsers that don't support :valid (IE < 10)
                anySelected = field.find('option:selected').length > 0;
            }
            return anySelected;
        },
        refreshIcons: function(fieldId) {
            var from = $('#' + fieldId + '_from');
            var to = $('#' + fieldId + '_to');
            // Active if at least one item is selected
            $('#' + fieldId + '_add_link').toggleClass('active', SelectFilter.anySelected(from));
            $('#' + fieldId + '_remove_link').toggleClass('active', SelectFilter.anySelected(to));
            // Active if the corresponding box isn't empty
            $('#' + fieldId + '_add_all_link').toggleClass('active', from.find('option').length > 0);
            $('#' + fieldId + '_remove_all_link').toggleClass('active', to.find('option').length > 0);
        },
        filterKeyPress: function(event, fieldId) {
            var from = document.getElementById(fieldId + '_from');
            // don't submit form if user pressed Enter
            if ((event.which && event.which === 13) || (event.keyCode && event.keyCode === 13)) {
                from.selectedIndex = 0;
                SelectBox.move(fieldId + '_from', fieldId + '_to');
                from.selectedIndex = 0;
                event.preventDefault();
                return false;
            }
        },
        filterKeyUp: function(event, fieldId) {
            var from = document.getElementById(fieldId + '_from');
            var temp = from.selectedIndex;
            SelectBox.filter(fieldId + '_from', document.getElementById(fieldId + '_input').value);
            from.selectedIndex = temp;
            return true;
        },
        filterKeyDown: function(event, fieldId) {
            var from = document.getElementById(fieldId + '_from');
            // right arrow -- move across
            if ((event.which && event.which === 39) || (event.keyCode && event.keyCode === 39)) {
                var oldIndex = from.selectedIndex;
                SelectBox.move(fieldId + '_from', fieldId + '_to');
                from.selectedIndex = (oldIndex === from.length) ? from.length - 1 : oldIndex;
                return false;
            }
            // down arrow -- wrap around
            if ((event.which && event.which === 40) || (event.keyCode && event.keyCode === 40)) {
                from.selectedIndex = (from.length === from.selectedIndex + 1) ? 0 : from.selectedIndex + 1;
            }
            // up arrow -- wrap around
            if ((event.which && event.which === 38) || (event.keyCode && event.keyCode === 38)) {
                from.selectedIndex = (from.selectedIndex === 0) ? from.length - 1 : from.selectedIndex - 1;
            }
            return true;
        }
    };

    addEvent(window, 'load', function(e) {
        $('select.selectfilter, select.selectfilterstacked').each(function() {
            var $el = $(this),
                data = $el.data();
            SelectFilter.init($el.attr('id'), data.fieldName, parseInt(data.isStacked, 10));
        });
    });

})(django.jQuery);
