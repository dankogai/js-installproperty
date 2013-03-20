/*
 * $Id: installproperty.js,v 0.4 2013/03/20 14:34:31 dankogai Exp dankogai $
 *
 *  (c) 2013 Dan Kogai
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license
 *
 */

(function(root) {
    'use strict';
    if (typeof Object.installProperty === 'function') return;
    var create = Object.create;
    if (!create || 'hasOwnProperty' in create(null)) {
        throw new Error('ES5 unsupported');
    }
    var nameOfSafe = '__previousProperties__';
    var hasOwnProperty = ''.hasOwnProperty;
    var has = function(o, k) { return hasOwnProperty.call(o, k) };
    var defineProperty = Object.defineProperty,
    defineProperties = Object.defineProperties,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
    getOwnPropertyNames = Object.getOwnPropertyNames,
    isArray = Array.isArray;
    var isPrimitive = function(o) {
        return Object(o) !== o;
    };
    // let the show begin!
    function installProperty(target, prop, desc) {
        if (prop === nameOfSafe) return;
        if (isPrimitive(target)) {
            throw new TypeError(target + ' is not an object');
        }
        var safe = target[nameOfSafe] || (function(name) {
            try {
                defineProperty(target, name, {
                    value: create(null),
                    // too fragile ?
                    writable: true,
                    configurable: true
                });
                return target[name];
            } catch (e) {
                    throw e;
            }
        })(nameOfSafe);
        var prev;
        if (isArray(target)) { // array needs special andling :-(
            // Number(unknown) === NaN when unknown cannot be converted
            if (target.length <= Number(prop)) { 
                // save original length
                prev = getOwnPropertyDescriptor(target, 'length');
                if (!safe['length']) safe['length'] = [];
                safe['length'].push(prev);
                target.length = prop;
            }
        }
        prev = getOwnPropertyDescriptor(target, prop);
        if (prev) {
            if (!prev.configurable) return false;
            if (!prev.writable) return true;
        }
        desc.configurable = true;
        desc.writable = true;
        if (!safe[prop]) safe[prop] = [];
        safe[prop].push(prev);
        defineProperty(target, prop, desc);
        return true;
    };
    function defaultProperty(target, prop, desc) {
        return has(target, prop) 
            ? false : installProperty(target, prop, desc);
    };
    function revertProperty(target, prop) {
        if (prop === nameOfSafe) return;
        var safe = target[nameOfSafe];
        if (!safe) return;
        if (!safe[prop]) return;
        if (!safe[prop].length) {
            delete safe[prop];
            return;
        }
        var prev = safe[prop].pop();
        if (!prev) {
            delete target[prop];
        } else {
            var curr = getOwnPropertyDescriptor(target, prop);
            defineProperty(target, prop, prev);
            return curr;
        }
    };
    function installProperties(target, descs) {
        getOwnPropertyNames(descs)
            .filter(function(k) {return k !== nameOfSafe})
            .forEach(function(name) {
                installProperty(target, name, descs[name]);
        });
        return target;
    };
    function defaultProperties(target, descs) {
        getOwnPropertyNames(descs)
            .filter(function(k) {return k !== nameOfSafe})
            .forEach(function(name) {
                defaultProperty(target, name, descs[name]);
        });
        return target;
    };
    function revertProperties(target, descs) {
        descs = descs || target[nameOfSafe];
        var prevs = create(null);
        getOwnPropertyNames(descs)
            .filter(function(k) {return k !== nameOfSafe})
            .forEach(function(name) {
                var prev = revertProperty(target, name, descs[name]);
                if (prev) defineProperty(prevs, name, prev);
        });
        return prevs;
    };
    function restoreProperties(target) {
        getOwnPropertyNames(target[nameOfSafe])
            .filter(function(k) {return k !== nameOfSafe})
            .forEach(function(name) {
                var safe = target[nameOfSafe][name],
                desc;
                if (safe && safe.length){
                    desc = safe[0];
                    if (desc) { 
                        defineProperty(target, name, safe[0]);
                        return;
                    } 
                }
                delete target[name]
        });
        delete target[nameOfSafe];
    };
    var v2s = function(v) {
        return {
            value: v,
            configurable: true,
            writable: true
        };
    };
    defaultProperties(Object, {
        installProperty:   v2s(installProperty),
        defaultProperty:   v2s(defaultProperty),
        revertProperty:    v2s(revertProperty),
        installProperties: v2s(installProperties),
        defaultProperties: v2s(defaultProperties),
        revertProperties:  v2s(revertProperties),
        restoreProperties: v2s(restoreProperties)
    });
})(this);
