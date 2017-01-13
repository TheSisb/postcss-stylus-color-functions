var postcss = require('postcss');
var colorJS = require('color');

var functions = {
    darken: function (color, amount) {
        // Perform darken
        color.values.hsl[2] += color.values.hsl[2] * -amount;
        // Update the color value to the new one
        color.setValues('hsl', color.values.hsl);
        // Return a rgbString
        return color.rgbString();
    },
    lighten: function (color, amount) {
        // Perform lighten
        color.values.hsl[2] += (100 - color.values.hsl[2]) * amount;
        // Update the color value to the new one
        color.setValues('hsl', color.values.hsl);
        // Return a rgbString
        return color.rgbString();
    }
};

var fnsList = Object.keys(functions).reduce(function (acc, curr) {
    return (acc ? acc + '|' : '') + curr;
}, false);

var quickFindFns = new RegExp('(' + fnsList + ')\\(');
var captureGroupFindFns = new RegExp('(' + fnsList + ')\\(([^)]+)\\)', 'g');


function transformDecl(decl) {
    if (!decl.value || !quickFindFns.test(decl.value)) {
        return;
    }

    var initialValue = decl.value;
    var newValue = initialValue;
    var match;

    while ((match = captureGroupFindFns.exec(initialValue)) !== null) {
        var inner = match[2].split(/\s*\,\s*/);

        var color = colorJS(inner[0]);
        var amount = inner[1];

        // Translate amount from string % to float
        if (typeof amount === 'string' && amount.indexOf('%') !== -1) {
            amount = parseInt(amount, 10) / 100;
        }

        newValue = newValue.replace(
          match[0],
          functions[match[1]](color, amount)
        );
    }

    if (initialValue !== newValue) {
        decl.value = newValue;
    }
}

/**
 * PostCSS plugin to transform color()
 */
module.exports = postcss.plugin('postcss-stylus-color-functions', function () {
    return function (css) {
        css.walkDecls(transformDecl);
    };
});
