js-installproperty
==================

defineProperty, undoably.

SYNOPSIS
--------

One property by one…

````javascript
var o = Object.create(null), prev, descs;
Object.installProperty(o, "k", {value:1});      // true
Object.defineProperty(o, 'ng', {value:'IGNOREME'});
Object.installProperty(o, "ng", {value:1});     // false
Object.installProperty(o, "k", {value:2});      // true
console.log(o.k);                               // 2
prev = Object.revertProperty(o, "k")
console.log(prev);  // {value:2, configurable:true, writable:true, enumerable:false}
console.log(o.k);                               // 1
prev = Object.revertProperty(o, "k")   // undefined // undo buffer is empty
````

…or all at once!

````javascript
o = [0, 1]; // any object will do! (unless it is primitive, of course)
descs = {0:{value:1},1:{value:2}};
Object.installProperties(o, descs);
console.log(o[0], o[1]);    // 1, 2
Object.revertProperties(o, descs);
console.log(o[0], o[1]);    // 0, 1
````
