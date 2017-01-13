var postcss = require("postcss");
var Color = require("color");

var functions = {
  darken: function(color, amount) {
    color = Color(color);
    // Translate amount from string % to float
    if (typeof amount == "string" && amount.indexOf("%") !== -1) {
      amount = parseInt(amount, 10) / 100;
    }
    // Perform darken
    color.values.hsl[2] += color.values.hsl[2] * -amount;
    // Update the color value to the new one
    color.setValues('hsl', color.values.hsl);
    // Return a rgbString
    return color.rgbString();
  },
  lighten: function(color, amount) {
    color = Color(color);
    // Translate amount from string % to float
    if (typeof amount == "string" && amount.indexOf("%") !== -1) {
      amount = parseInt(amount, 10) / 100;
    }
    // Perform lighten
    color.values.hsl[2] += (100 - color.values.hsl[2]) * amount;
    // Update the color value to the new one
    color.setValues('hsl', color.values.hsl);
    // Return a rgbString
    return color.rgbString();
  }
};

var functionsRegex = new RegExp(
  "(" +
  Object.keys(functions).reduce(function(acc, curr) {
    return (acc ? acc + "|" : "") + curr
  }, false) +
  ")"
);

var fnRe = /(darken|lighten)\(([^)]+)\)/g;

/**
 * PostCSS plugin to transform color()
 */
module.exports = postcss.plugin("postcss-sass-color-functions", function() {
  return function(style) {
    style.walkDecls(function transformDecl(decl) {
      if (!decl.value || !functionsRegex.test(decl.value)) {
        return;
      }

      var initialValue = decl.value;
      var newValue = initialValue;
      var match;

      while ((match = fnRe.exec(initialValue)) !== null) {
        var inner = match[2].split(/\s*\,\s*/);

        var color = inner[0];
        var amt = inner[1];

        newValue = newValue.replace(match[0], functions[match[1]](color, amt));
      }

      if (initialValue !== newValue) {
        decl.value = newValue;
      }
    })
  }
});
