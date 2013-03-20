/*
 * use mocha to test me
 * http://visionmedia.github.com/mocha/
 */
if (this['window'] !== this) {
    require('./helper.js');
    require('../installproperty.js');
}

(function(root){
    'use strict';
    var o = Object.create(null),
    prev, descs;
    it ('Object.installProperty(o, "k", {value:1}); // works',
        eq(Object.installProperty(o, "k", {value:1}), true));
    // console.log(o);
    Object.defineProperty(o, 'ng', {value:'IGNOREME'});
    it ('Object.installProperty(o, "ng", {value:1}); // fails',
        eq(Object.installProperty(o, "ng", {value:1}), false));
    Object.installProperty(o, "k", {value:2});
    it ('prev = Object.revertProperty(o, "k");',
        ok(prev = Object.revertProperty(o, "k")));
    // console.log(o);
    it ('prev.value == 2', eq(prev.value, 2));
    it ('o.k === 1', eq(o.k, 1));
    it ('prev = Object.revertProperty(o, "k");',
        eq(Object.revertProperty(o, "k"), undefined));
    // console.log(o);
    it ('"k" in o === false', eq("k" in o, false));
    o = [0,1];
    descs = {0:{value:1},1:{value:2}};
    it ('Object.installProperties(o, descs) === o;',
        eq(Object.installProperties(o, descs), o));
    it ('o[0] === 1 && o[1] === 2', ok(o[0] === 1 && o[1] === 2));
    it ('Object.revertProperties(o) === o;',
        eq(Object.revertProperties(o), o));
    it ('o[0] === 0 && o[1] === 1', ok(o[0] === 0 && o[1] === 1));
    Object.installProperties(o, descs);
    // console.log(Object.keys(o), Object.getOwnPropertyNames(o));
    Object.restoreProperties(o);
    it ('Object.restoreProperties(o); // cleans spotlessly',
        ok(o[0] === 0 && o[1] === 1 
           && Object.getOwnPropertyNames(o).length === 3) // 0,1,length
       ); 
})(this);
