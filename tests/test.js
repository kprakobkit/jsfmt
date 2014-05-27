/* jshint node:true */
/* global describe,it */
'use strict';
var should = require('should');
var fs = require('fs');
var jsfmt = require('../lib/index');

describe('jsfmt', function() {
  it('should test basic rewrite', function() {
    jsfmt.rewrite('_.each(a, b)', '_.each(a, b) -> a.forEach(b)')
      .toString().should.eql('a.forEach(b)');

    jsfmt.rewrite('_.each(e, f)', '_.each(a, b) -> a.forEach(b)')
      .toString().should.eql('e.forEach(f)');

    jsfmt.rewrite('_.reduce(a,b,c)', '_.reduce(a, b, c) -> a.reduce(b, c)')
      .toString().should.eql('a.reduce(b, c)');
  });

  it('should test basic searching', function() {
    var results = jsfmt.search('var param1 = 1, done = function() {}; _.each(param1, done);', '_.each(a, b);');
    results[0].wildcards.a.name.should.eql('param1');
    results[0].wildcards.b.name.should.eql('done');
  });

  it('should be able to rewrite FunctionDeclaration', function() {
    jsfmt.rewrite('function myFunc() { return false; }', 'function a() {} -> function wrapper(a) {}')
      .toString().should.eql('function wrapper(myFunc) {\n}');
  });

  it('should test basic formatting', function() {
    var js = 'var func = function(test){console.log( test );};';
    var result = jsfmt.format(js, {});
    result.should.eql('var func = function(test) {\n  console.log(test);\n};');
  });

  it('should transform function args during rewrite', function() {
    jsfmt.rewrite('jade_mixins["my_key"](argA, argB, argC)', 'jade_mixins[a]($b) -> templates[a]($b)')
      .toString().should.eql("templates['my_key'](argA, argB, argC)");

    // Can drop Argument
    jsfmt.rewrite('jade_mixins["my_key"](argA, argB, argC)', 'jade_mixins[a]($b, c) -> templates[a]($b)')
      .toString().should.eql("templates['my_key'](argA, argB)");

    // Move Argument to beginning
    jsfmt.rewrite('jade_mixins["my_key"](argA, argB, argC)', 'jade_mixins[a]($b, c) -> templates[a](c, $b)')
      .toString().should.eql("templates['my_key'](argC, argA, argB)");

    // Move Argument to end
    jsfmt.rewrite('jade_mixins["my_key"](argA, argB, argC)', 'jade_mixins[a](b, $c) -> templates[a]($c, b)')
      .toString().should.eql("templates['my_key'](argB, arcC, arcA)");
  });
});
