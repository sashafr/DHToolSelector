(function($) {
    'use strict';
    var selectBox = {
        cache: {},
        init: function(id) {
            var box = document.getElementById(id);
            var node;
            selectBox.cache[id] = [];
            var cache = selectBox.cache[id];
            var boxOptions = box.options;
            var boxOptionsLength = boxOptions.length;
            for (var i = 0, j = boxOptionsLength; i < j; i++) {
                node = boxOptions[i];
                cache.push({value: node.value, text: node.text, displayed: 1});
            }
        },
        redisplay: function(id) {
            // Repopulate HTML select box from cache
            var box = document.getElementById(id);
            var node;
            $(box).empty(); // clear all options
            var newOptions = box.outerHTML.slice(0, -9);  // grab just the opening tag
            var cache = selectBox.cache[id];
            for (var i = 0, j = cache.length; i < j; i++) {
                node = cache[i];
                if (node.displayed) {
                    var newOption = new Option(node.text, node.value, false, false);
                    // Shows a tooltip when hovering over the option
                    newOption.setAttribute("title", node.text);
                    newOptions += newOption.outerHTML;
                }
            }
            newOptions += '</select>';
            box.outerHTML = newOptions;
        },
        filter: function(id, text) {
            // Redisplay the HTML select box, displaying only the choices containing ALL
            // the words in text. (It's an AND search.)
            var tokens = text.toLowerCase().split(/\s+/);
            var node, token;
            var cache = selectBox.cache[id];
            for (var i = 0, j = cache.length; i < j; i++) {
                node = cache[i];
                node.displayed = 1;
                var nodeText = node.text.toLowerCase();
                var numTokens = tokens.length;
                for (var k = 0; k < numTokens; k++) {
                    token = tokens[k];
                    if (nodeText.indexOf(token) === -1) {
                        node.displayed = 0;
                        break;  // Once the first token isn't found we're done
                    }
                }
            }
            selectBox.redisplay(id);
        },
        deleteFromCache: function(id, value) {
            var node, deleteIndex = null;
            var cache = selectBox.cache[id];
            for (var i = 0, j = cache.length; i < j; i++) {
                node = cache[i];
                if (node.value === value) {
                    deleteIndex = i;
                    break;
                }
            }
            cache.splice(deleteIndex, 1);
        },
        addToCache: function(id, option) {
            selectBox.cache[id].push({value: option.value, text: option.text, displayed: 1});
        },
        cacheContains: function(id, value) {
            // Check if an item is contained in the cache
            var node;
            var cache = selectBox.cache[id];
            for (var i = 0, j = cache.length; i < j; i++) {
                node = cache[i];
                if (node.value === value) {
                    return true;
                }
            }
            return false;
        },
        move: function(from, to) {
            var fromBox = document.getElementById(from);
            var option;
            var boxOptions = fromBox.options;
            var boxOptionsLength = boxOptions.length;
            for (var i = 0, j = boxOptionsLength; i < j; i++) {
                option = boxOptions[i];
                var optionValue = option.value;
                if (option.selected && selectBox.cacheContains(from, optionValue)) {
                    selectBox.addToCache(to, {value: optionValue, text: option.text, displayed: 1});
                    selectBox.deleteFromCache(from, optionValue);
                }
            }
            selectBox.redisplay(from);
            selectBox.redisplay(to);
        },
        moveAll: function(from, to) {
            var fromBox = document.getElementById(from);
            var option;
            var boxOptions = fromBox.options;
            var boxOptionsLength = boxOptions.length;
            for (var i = 0, j = boxOptionsLength; i < j; i++) {
                option = boxOptions[i];
                var optionValue = option.value;
                if (selectBox.cacheContains(from, optionValue)) {
                    selectBox.addToCache(to, {value: optionValue, text: option.text, displayed: 1});
                    selectBox.deleteFromCache(from, optionValue);
                }
            }
            selectBox.redisplay(from);
            selectBox.redisplay(to);
        },
        sort: function(id) {
            selectBox.cache[id].sort(function(a, b) {
                a = a.text.toLowerCase();
                b = b.text.toLowerCase();
                try {
                    if (a > b) {
                        return 1;
                    }
                    if (a < b) {
                        return -1;
                    }
                }
                catch (e) {
                    // silently fail on IE 'unknown' exception
                }
                return 0;
            } );
        },
        selectAll: function(id) {
            var box = document.getElementById(id);
            var boxOptions = box.options;
            var boxOptionsLength = boxOptions.length;
            for (var i = 0; i < boxOptionsLength; i++) {
                boxOptions[i].selected = 'selected';
            }
        }
    };
    window.selectBox = selectBox;
})(django.jQuery);
