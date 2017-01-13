var postcss = require('postcss');

var plugin = require('./');

function run(input, output, opts) {
    return postcss([ plugin(opts) ]).process(input)
        .then(result => {
            expect(result.css).toEqual(output);
            expect(result.warnings().length).toBe(0);
        });
}

/* Write tests here */

it('Lightens hex colors', () => {
    return run(
        'a{ color: lighten(#333333, 80%); }',
        'a{ color: rgb(214, 214, 214); }',
        { }
    );
});


it('Darkens hex colors', () => {
    return run(
        'a{ color: darken(#333333, 50%); }',
        'a{ color: rgb(26, 26, 26); }',
        { }
    );
});


it('Applies multiple times on a string', () => {
    return run(
        'a{ background: ' +
            'linear-gradient(' +
            '1deg, ' +
            'darken(#123456, 10%) 85%, ' +
            'lighten(#111111, 50%)); }',
        'a{ background: ' +
            'linear-gradient(' +
            '1deg, ' +
            'rgb(16, 46, 76) 85%, ' +
            'rgb(138, 138, 138)); }',
        { }
    );
});
