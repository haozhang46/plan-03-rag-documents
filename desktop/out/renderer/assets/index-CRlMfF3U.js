const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MarkdownDocWidget-mA7Itk8l.js","./MarkdownFilePanel.vue_vue_type_script_setup_true_lang-DsSaG5bf.js","./MarkdownPreview.vue_vue_type_script_setup_true_lang-CGx813Ou.js","./ArchitectureDocsWidget-BfvZVbJ2.js","./AgentRunWidget-CdYYxGa0.js","./FeArchitecturePlanWidget--PIhACpc.js","./ComponentSplitterWidget-Ckb1rrW9.js","./AgentRulesEditorWidget-DnPcGgnk.js"])))=>i.map(i=>d[i]);
/**
* @vue/shared v3.5.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-\w/g;
const camelize = cacheStringFunction(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction(
  (str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  }
);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function looseCompareArrays(a, b2) {
  if (a.length !== b2.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b2[i]);
  }
  return equal;
}
function looseEqual(a, b2) {
  if (a === b2) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b2);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b2.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b2);
  if (aValidType || bValidType) {
    return a === b2;
  }
  aValidType = isArray(a);
  bValidType = isArray(b2);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b2) : false;
  }
  aValidType = isObject(a);
  bValidType = isObject(b2);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b2).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b2.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b2[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b2);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const isRef$1 = (val) => {
  return !!(val && val["__v_isRef"] === true);
};
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (isRef$1(val)) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v2) => stringifySymbol(v2))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v2, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol(v2) ? `Symbol(${(_a = v2.description) != null ? _a : i})` : v2
  );
};
/**
* @vue/reactivity v3.5.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let activeEffectScope;
class EffectScope {
  // TODO isolatedDeclarations "__v_skip"
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this._on = 0;
    this.effects = [];
    this.cleanups = [];
    this._isPaused = false;
    this._warnOnRun = true;
    this.__v_skip = true;
    if (!detached && activeEffectScope) {
      if (activeEffectScope.active) {
        this.parent = activeEffectScope;
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      } else {
        this._active = false;
        this._warnOnRun = false;
      }
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l3;
      if (this.scopes) {
        for (i = 0, l3 = this.scopes.length; i < l3; i++) {
          this.scopes[i].pause();
        }
      }
      for (i = 0, l3 = this.effects.length; i < l3; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l3;
        if (this.scopes) {
          for (i = 0, l3 = this.scopes.length; i < l3; i++) {
            this.scopes[i].resume();
          }
        }
        for (i = 0, l3 = this.effects.length; i < l3; i++) {
          this.effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (activeEffectScope === this) {
        activeEffectScope = this.prevScope;
      } else {
        let current = activeEffectScope;
        while (current) {
          if (current.prevScope === this) {
            current.prevScope = this.prevScope;
            break;
          }
          current = current.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l3;
      for (i = 0, l3 = this.effects.length; i < l3; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l3 = this.cleanups.length; i < l3; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        for (i = 0, l3 = this.scopes.length; i < l3; i++) {
          this.scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
}
function getCurrentScope() {
  return activeEffectScope;
}
let activeSub;
const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 1 | 4;
    this.next = void 0;
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope) {
      if (activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      } else {
        this.flags &= -2;
      }
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
}
let batchDepth = 0;
let batchedSub;
let batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed2) {
  if (computed2.flags & 4 && !(computed2.flags & 16)) {
    return;
  }
  computed2.flags &= -17;
  if (computed2.globalVersion === globalVersion) {
    return;
  }
  computed2.globalVersion = globalVersion;
  if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
    return;
  }
  computed2.flags |= 2;
  const dep = computed2.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed2;
  shouldTrack = true;
  try {
    prepareDeps(computed2);
    const value = computed2.fn(computed2._value);
    if (dep.version === 0 || hasChanged(value, computed2._value)) {
      computed2.flags |= 128;
      computed2._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed2);
    computed2.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l3 = dep.computed.deps; l3; l3 = l3.nextDep) {
        removeSub(l3, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}
let globalVersion = 0;
class Link {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed2) {
    this.computed = computed2;
    this.version = 0;
    this.activeLink = void 0;
    this.subs = void 0;
    this.map = void 0;
    this.key = void 0;
    this.sc = 0;
    this.__v_skip = true;
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (false) ;
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed2 = link.dep.computed;
    if (computed2 && !link.dep.subs) {
      computed2.flags |= 4 | 16;
      for (let l3 = computed2.deps; l3; l3 = l3.nextDep) {
        addSub(l3);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track();
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger();
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function reactiveReadArray(array) {
  const raw = /* @__PURE__ */ toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive);
}
function shallowReadArray(arr) {
  track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x2) => isArray(x2) ? reactiveReadArray(x2) : x2)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(
      this,
      "filter",
      fn,
      thisArg,
      (v2) => v2.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !/* @__PURE__ */ isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
const arrayProto = Array.prototype;
function apply(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  let wrappedFn = fn;
  let wrapInitialAccumulator = false;
  if (arr !== self2) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self2, acc);
        }
        return fn.call(this, acc, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self2, result) : result;
}
function searchProxy(self2, method, args) {
  const arr = /* @__PURE__ */ toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
    args[0] = /* @__PURE__ */ toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = (/* @__PURE__ */ toRaw(self2))[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = /* @__PURE__ */ toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (/* @__PURE__ */ isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? /* @__PURE__ */ readonly(value) : value;
    }
    if (isObject(res)) {
      return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
      if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
        oldValue = /* @__PURE__ */ toRaw(oldValue);
        value = /* @__PURE__ */ toRaw(value);
      }
      if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
        if (isOldValueReadonly) {
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (target === /* @__PURE__ */ toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v2) => Reflect.getPrototypeOf(v2);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = /* @__PURE__ */ toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return extend(
      // inheriting all iterator properties
      Object.create(innerIterator),
      {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        }
      }
    );
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        const target = /* @__PURE__ */ toRaw(this);
        const proto = getProto(target);
        const rawValue = /* @__PURE__ */ toRaw(value);
        const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
        const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
        if (!hadKey) {
          target.add(valueToAdd);
          trigger(target, "add", valueToAdd, valueToAdd);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
          value = /* @__PURE__ */ toRaw(value);
        }
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
        return this;
      },
      delete(key) {
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0);
        }
        return result;
      },
      clear() {
        const target = /* @__PURE__ */ toRaw(this);
        const hadItems = target.size !== 0;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  if (target["__v_skip"] || !Object.isExtensible(target)) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = targetTypeMap(toRawType(target));
  if (targetType === 0) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
const toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;
// @__NO_SIDE_EFFECTS__
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
// @__NO_SIDE_EFFECTS__
function ref(value) {
  return createRef(value, false);
}
// @__NO_SIDE_EFFECTS__
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (/* @__PURE__ */ isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, isShallow2) {
    this.dep = new Dep();
    this["__v_isRef"] = true;
    this["__v_isShallow"] = false;
    this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
    this._value = isShallow2 ? value : toReactive(value);
    this["__v_isShallow"] = isShallow2;
  }
  get value() {
    {
      this.dep.track();
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
    newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive(newValue);
      {
        this.dep.trigger();
      }
    }
  }
}
function unref(ref2) {
  return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
class CustomRefImpl {
  constructor(factory) {
    this["__v_isRef"] = true;
    this._value = void 0;
    const dep = this.dep = new Dep();
    const { get, set } = factory(dep.track.bind(dep), dep.trigger.bind(dep));
    this._get = get;
    this._set = set;
  }
  get value() {
    return this._value = this._get();
  }
  set value(newVal) {
    this._set(newVal);
  }
}
function customRef(factory) {
  return new CustomRefImpl(factory);
}
class ComputedRefImpl {
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.dep = new Dep(this);
    this.__v_isRef = true;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 16;
    this.globalVersion = globalVersion - 1;
    this.next = void 0;
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track();
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    }
  }
}
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
const INITIAL_WATCHER_VALUE = {};
const cleanupMap = /* @__PURE__ */ new WeakMap();
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  }
}
function watch$1(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const reactiveGetter = (source2) => {
    if (deep) return source2;
    if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  };
  let effect2;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (/* @__PURE__ */ isRef(source)) {
    getter = () => source.value;
    forceTrigger = /* @__PURE__ */ isShallow(source);
  } else if (/* @__PURE__ */ isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
    getter = () => source.map((s) => {
      if (/* @__PURE__ */ isRef(s)) {
        return s.value;
      } else if (/* @__PURE__ */ isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction(s)) {
        return call ? call(s, 2) : s();
      } else ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = () => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect2;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }
  const scope = getCurrentScope();
  const watchHandle = () => {
    effect2.stop();
    if (scope && scope.active) {
      remove(scope.effects, effect2);
    }
  };
  if (once && cb) {
    const _cb = cb;
    cb = (...args) => {
      const res = _cb(...args);
      watchHandle();
      return res;
    };
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = (immediateFirstRun) => {
    if (!(effect2.flags & 1) || !effect2.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v2, i) => hasChanged(v2, oldValue[i])) : hasChanged(newValue, oldValue))) {
        if (cleanup) {
          cleanup();
        }
        const currentWatcher = activeWatcher;
        activeWatcher = effect2;
        try {
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
        }
      }
    } else {
      effect2.run();
    }
  };
  if (augmentJob) {
    augmentJob(job);
  }
  effect2 = new ReactiveEffect(getter);
  effect2.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = (fn) => onWatcherCleanup(fn, false, effect2);
  cleanup = effect2.onStop = () => {
    const cleanups = cleanupMap.get(effect2);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect2.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect2.run();
  }
  watchHandle.pause = effect2.pause.bind(effect2);
  watchHandle.resume = effect2.resume.bind(effect2);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
function traverse(value, depth = Infinity, seen2) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen2 = seen2 || /* @__PURE__ */ new Map();
  if ((seen2.get(value) || 0) >= depth) {
    return value;
  }
  seen2.set(value, depth);
  depth--;
  if (/* @__PURE__ */ isRef(value)) {
    traverse(value.value, depth, seen2);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen2);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v2) => {
      traverse(v2, depth, seen2);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen2);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen2);
      }
    }
  }
  return value;
}
/**
* @vue/runtime-core v3.5.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const stack = [];
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (/* @__PURE__ */ isRef(value)) {
    value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = /* @__PURE__ */ toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  if (throwInProd) {
    throw err;
  } else {
    console.error(err);
  }
}
const queue = [];
let flushIndex = -1;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen2, i = flushIndex + 1) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
function flushPostFlushCbs(seen2) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b2) => getId(a) - getId(b2)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen2) {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (false) ;
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs();
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    return vnode;
  }
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
function provide(key, value) {
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}
const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
function watchSyncEffect(effect2, options) {
  return doWatch(
    effect2,
    null,
    { flush: "sync" }
  );
}
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  const baseWatchOptions = extend({}, options);
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
const pendingMounts = /* @__PURE__ */ new WeakMap();
const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;
const isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
const isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
const isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
const isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
const resolveTarget = (props, select) => {
  const targetSelector = props && props.to;
  if (isString(targetSelector)) {
    if (!select) {
      return null;
    } else {
      const target = select(targetSelector);
      return target;
    }
  } else {
    return targetSelector;
  }
};
const TeleportImpl = {
  name: "Teleport",
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
    const {
      mc: mountChildren,
      pc: patchChildren,
      pbc: patchBlockChildren,
      o: { insert, querySelector, createText, createComment, parentNode }
    } = internals;
    const disabled = isTeleportDisabled(n2.props);
    let { dynamicChildren } = n2;
    const mount = (vnode, container2, anchor2) => {
      if (vnode.shapeFlag & 16) {
        mountChildren(
          vnode.children,
          container2,
          anchor2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    };
    const mountToTarget = (vnode = n2) => {
      const disabled2 = isTeleportDisabled(vnode.props);
      const target = vnode.target = resolveTarget(vnode.props, querySelector);
      const targetAnchor = prepareAnchor(target, vnode, createText, insert);
      if (target) {
        if (namespace !== "svg" && isTargetSVG(target)) {
          namespace = "svg";
        } else if (namespace !== "mathml" && isTargetMathML(target)) {
          namespace = "mathml";
        }
        if (parentComponent && parentComponent.isCE) {
          (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
        }
        if (!disabled2) {
          mount(vnode, target, targetAnchor);
          updateCssVars(vnode, false);
        }
      }
    };
    const queuePendingMount = (vnode) => {
      const mountJob = () => {
        if (pendingMounts.get(vnode) !== mountJob) return;
        pendingMounts.delete(vnode);
        if (isTeleportDisabled(vnode.props)) {
          const mountContainer = parentNode(vnode.el) || container;
          mount(vnode, mountContainer, vnode.anchor);
          updateCssVars(vnode, true);
        }
        mountToTarget(vnode);
      };
      pendingMounts.set(vnode, mountJob);
      queuePostRenderEffect(mountJob, parentSuspense);
    };
    if (n1 == null) {
      const placeholder = n2.el = createText("");
      const mainAnchor = n2.anchor = createText("");
      insert(placeholder, container, anchor);
      insert(mainAnchor, container, anchor);
      if (isTeleportDeferred(n2.props) || parentSuspense && parentSuspense.pendingBranch) {
        queuePendingMount(n2);
        return;
      }
      if (disabled) {
        mount(n2, container, mainAnchor);
        updateCssVars(n2, true);
      }
      mountToTarget();
    } else {
      n2.el = n1.el;
      const mainAnchor = n2.anchor = n1.anchor;
      const pendingMount = pendingMounts.get(n1);
      if (pendingMount) {
        pendingMount.flags |= 8;
        pendingMounts.delete(n1);
        queuePendingMount(n2);
        return;
      }
      n2.targetStart = n1.targetStart;
      const target = n2.target = n1.target;
      const targetAnchor = n2.targetAnchor = n1.targetAnchor;
      const wasDisabled = isTeleportDisabled(n1.props);
      const currentContainer = wasDisabled ? container : target;
      const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
      if (namespace === "svg" || isTargetSVG(target)) {
        namespace = "svg";
      } else if (namespace === "mathml" || isTargetMathML(target)) {
        namespace = "mathml";
      }
      if (dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          currentContainer,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        traverseStaticChildren(n1, n2, true);
      } else if (!optimized) {
        patchChildren(
          n1,
          n2,
          currentContainer,
          currentAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          false
        );
      }
      if (disabled) {
        if (!wasDisabled) {
          moveTeleport(
            n2,
            container,
            mainAnchor,
            internals,
            1
          );
        } else {
          if (n2.props && n1.props && n2.props.to !== n1.props.to) {
            n2.props.to = n1.props.to;
          }
        }
      } else {
        if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
          const nextTarget = n2.target = resolveTarget(
            n2.props,
            querySelector
          );
          if (nextTarget) {
            moveTeleport(
              n2,
              nextTarget,
              null,
              internals,
              0
            );
          }
        } else if (wasDisabled) {
          moveTeleport(
            n2,
            target,
            targetAnchor,
            internals,
            1
          );
        }
      }
      updateCssVars(n2, disabled);
    }
  },
  remove(vnode, parentComponent, parentSuspense, { um: unmount, o: { remove: hostRemove } }, doRemove) {
    const {
      shapeFlag,
      children,
      anchor,
      targetStart,
      targetAnchor,
      target,
      props
    } = vnode;
    const shouldRemove = doRemove || !isTeleportDisabled(props);
    const pendingMount = pendingMounts.get(vnode);
    if (pendingMount) {
      pendingMount.flags |= 8;
      pendingMounts.delete(vnode);
    }
    if (target) {
      hostRemove(targetStart);
      hostRemove(targetAnchor);
    }
    doRemove && hostRemove(anchor);
    if (!pendingMount && shapeFlag & 16) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        unmount(
          child,
          parentComponent,
          parentSuspense,
          shouldRemove,
          !!child.dynamicChildren
        );
      }
    }
  },
  move: moveTeleport,
  hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
  if (moveType === 0) {
    insert(vnode.targetAnchor, container, parentAnchor);
  }
  const { el, anchor, shapeFlag, children, props } = vnode;
  const isReorder = moveType === 2;
  if (isReorder) {
    insert(el, container, parentAnchor);
  }
  if (!pendingMounts.has(vnode) && (!isReorder || isTeleportDisabled(props))) {
    if (shapeFlag & 16) {
      for (let i = 0; i < children.length; i++) {
        move(
          children[i],
          container,
          parentAnchor,
          2
        );
      }
    }
  }
  if (isReorder) {
    insert(anchor, container, parentAnchor);
  }
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, {
  o: { nextSibling, parentNode, querySelector, insert, createText }
}, hydrateChildren) {
  function hydrateAnchor(target2, targetNode) {
    let targetAnchor = targetNode;
    while (targetAnchor) {
      if (targetAnchor && targetAnchor.nodeType === 8) {
        if (targetAnchor.data === "teleport start anchor") {
          vnode.targetStart = targetAnchor;
        } else if (targetAnchor.data === "teleport anchor") {
          vnode.targetAnchor = targetAnchor;
          target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
          break;
        }
      }
      targetAnchor = nextSibling(targetAnchor);
    }
  }
  function hydrateDisabledTeleport(node2, vnode2) {
    vnode2.anchor = hydrateChildren(
      nextSibling(node2),
      vnode2,
      parentNode(node2),
      parentComponent,
      parentSuspense,
      slotScopeIds,
      optimized
    );
  }
  const target = vnode.target = resolveTarget(
    vnode.props,
    querySelector
  );
  const disabled = isTeleportDisabled(vnode.props);
  if (target) {
    const targetNode = target._lpa || target.firstChild;
    if (vnode.shapeFlag & 16) {
      if (disabled) {
        hydrateDisabledTeleport(node, vnode);
        hydrateAnchor(target, targetNode);
        if (!vnode.targetAnchor) {
          prepareAnchor(
            target,
            vnode,
            createText,
            insert,
            // if target is the same as the main view, insert anchors before current node
            // to avoid hydrating mismatch
            parentNode(node) === target ? node : null
          );
        }
      } else {
        vnode.anchor = nextSibling(node);
        hydrateAnchor(target, targetNode);
        if (!vnode.targetAnchor) {
          prepareAnchor(target, vnode, createText, insert);
        }
        hydrateChildren(
          targetNode && nextSibling(targetNode),
          vnode,
          target,
          parentComponent,
          parentSuspense,
          slotScopeIds,
          optimized
        );
      }
    }
    updateCssVars(vnode, disabled);
  } else if (disabled) {
    if (vnode.shapeFlag & 16) {
      hydrateDisabledTeleport(node, vnode);
      vnode.targetStart = node;
      vnode.targetAnchor = nextSibling(node);
    }
  }
  return vnode.anchor && nextSibling(vnode.anchor);
}
const Teleport = TeleportImpl;
function updateCssVars(vnode, isDisabled) {
  const ctx = vnode.ctx;
  if (ctx && ctx.ut) {
    let node, anchor;
    if (isDisabled) {
      node = vnode.el;
      anchor = vnode.anchor;
    } else {
      node = vnode.targetStart;
      anchor = vnode.targetAnchor;
    }
    while (node && node !== anchor) {
      if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
      node = node.nextSibling;
    }
    ctx.ut();
  }
}
function prepareAnchor(target, vnode, createText, insert, anchor = null) {
  const targetStart = vnode.targetStart = createText("");
  const targetAnchor = vnode.targetAnchor = createText("");
  targetStart[TeleportEndKey] = targetAnchor;
  if (target) {
    insert(targetStart, target, anchor);
    insert(targetAnchor, target, anchor);
  }
  return targetAnchor;
}
const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction(options) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = /* @__PURE__ */ toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    if (isTemplateRefKey(refs, key)) {
      return false;
    }
    return hasOwn(rawSetupState, key);
  };
  const canSetRef = (ref22, key) => {
    if (key && isTemplateRefKey(refs, key)) {
      return false;
    }
    return true;
  };
  if (oldRef != null && oldRef !== ref3) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (/* @__PURE__ */ isRef(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) {
        oldRef.value = null;
      }
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref3);
    const _isRef = /* @__PURE__ */ isRef(ref3);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref3) ? setupState[ref3] : refs[ref3] : canSetRef() || !rawRef.k ? ref3.value : refs[rawRef.k];
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (canSetSetupRef(ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                const newVal = [refValue];
                if (canSetRef(ref3, rawRef.k)) {
                  ref3.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (canSetSetupRef(ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          if (canSetRef(ref3, rawRef.k)) {
            ref3.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    }
  }
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}
getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook(
  "bu"
);
const onUpdated = createHook("u");
const onBeforeUnmount = createHook(
  "bum"
);
const onUnmounted = createHook("um");
const onServerPrefetch = createHook(
  "sp"
);
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const COMPONENTS = "components";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function resolveDynamicComponent(component) {
  if (isString(component)) {
    return resolveAsset(COMPONENTS, component, false) || component;
  } else {
    return component || NULL_DYNAMIC_COMPONENT;
  }
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    {
      const selfName = getComponentName(
        Component,
        false
      );
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type] || Component[type], name) || // global registration
      resolve(instance.appContext[type], name)
    );
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache;
  const sourceIsArray = isArray(source);
  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
    let needsWrap = false;
    let isReadonlySource = false;
    if (sourceIsReactiveArray) {
      needsWrap = !/* @__PURE__ */ isShallow(source);
      isReadonlySource = /* @__PURE__ */ isReadonly(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);
    for (let i = 0, l3 = source.length; i < l3; i++) {
      ret[i] = renderItem(
        needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i],
        i,
        void 0,
        cached
      );
    }
  } else if (typeof source === "number") {
    {
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached);
      }
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached)
      );
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l3 = keys.length; i < l3; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject(data)) ;
    else {
      instance.data = /* @__PURE__ */ reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get,
        set
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v2) => c.value = v2
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (/* @__PURE__ */ isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v2) => injected.value = v2
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      {
        watch(getter, handler);
      }
    }
  } else if (isFunction(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject(raw)) {
    if (isArray(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m2) => mergeOptions(resolved, m2, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m2) => mergeOptions(to, m2, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v2) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ;
        else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getComponentPublicInstance(vnode.component);
        }
      },
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
function useModel(props, name, options = EMPTY_OBJ) {
  const i = getCurrentInstance();
  const camelizedName = camelize(name);
  const hyphenatedName = hyphenate(name);
  const modifiers = getModelModifiers(props, camelizedName);
  const res = customRef((track2, trigger2) => {
    let localValue;
    let prevSetValue = EMPTY_OBJ;
    let prevEmittedValue;
    watchSyncEffect(() => {
      const propValue = props[camelizedName];
      if (hasChanged(localValue, propValue)) {
        localValue = propValue;
        trigger2();
      }
    });
    return {
      get() {
        track2();
        return options.get ? options.get(localValue) : localValue;
      },
      set(value) {
        const emittedValue = options.set ? options.set(value) : value;
        if (!hasChanged(emittedValue, localValue) && !(prevSetValue !== EMPTY_OBJ && hasChanged(value, prevSetValue))) {
          return;
        }
        const rawProps = i.vnode.props;
        const hasVModel = !!(rawProps && // check if parent has passed v-model
        (name in rawProps || camelizedName in rawProps || hyphenatedName in rawProps) && (`onUpdate:${name}` in rawProps || `onUpdate:${camelizedName}` in rawProps || `onUpdate:${hyphenatedName}` in rawProps));
        if (!hasVModel) {
          localValue = value;
          trigger2();
        }
        i.emit(`update:${name}`, emittedValue);
        if (hasChanged(value, prevSetValue) && (hasChanged(value, emittedValue) && !hasChanged(emittedValue, prevEmittedValue) || // #13524: browsers differ in when they flush microtasks between
        // event listeners. If a v-model listener emits an intermediate value
        // and a following listener restores the model to its previous prop
        // value before parent updates are flushed, the parent render can be
        // deduped as having no prop change. Force a local update so DOM state
        // such as an input's value is synchronized back to the current model.
        hasVModel && prevSetValue !== EMPTY_OBJ && !hasChanged(emittedValue, localValue))) {
          trigger2();
        }
        prevSetValue = value;
        prevEmittedValue = emittedValue;
      }
    };
  });
  res[Symbol.iterator] = () => {
    let i2 = 0;
    return {
      next() {
        if (i2 < 2) {
          return { value: i2++ ? modifiers || EMPTY_OBJ : res, done: false };
        } else {
          return { done: true };
        }
      }
    };
  };
  return res;
}
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
        render.call(
          thisProxy,
          proxyToUse,
          renderCache,
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (false) ;
      result = normalizeVNode(
        render2.length > 1 ? render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return /* @__PURE__ */ shallowReadonly(attrs);
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render2(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    setTransitionHooks(root, vnode.transition);
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject(nextProp) && isObject(prevProp)) {
    return !looseEqual(nextProp, prevProp);
  }
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.suspense.vnode.el = root.el = el;
      vnode = root;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
  if (suspense && suspense.activeBranch === vnode) {
    suspense.vnode.el = el;
  }
}
const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = /* @__PURE__ */ toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = /* @__PURE__ */ toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction(propType) && propType.name === "Boolean";
        }
        prop[
          0
          /* shouldCast */
        ] = shouldCast;
        prop[
          1
          /* shouldCastTrue */
        ] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref3 == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        try {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        } finally {
        }
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m: m2, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        {
          if (root.ce && root.ce._hasShadowRoot()) {
            root.ce._injectChildStyle(
              type,
              instance.parent ? instance.parent.type : void 0
            );
          }
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m2) {
          queuePostRenderEffect(m2, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) update();
              }, parentSuspense);
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    };
    instance.scope.on();
    const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect2.run.bind(effect2);
    const job = instance.job = effect2.runIfDirty.bind(effect2);
    job.i = instance;
    job.id = instance.uid;
    effect2.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l22 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l22 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l22 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j2;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j2 = s2; j2 <= e2; j2++) {
            if (newIndexToOldIndexMap[j2 - s2] === 0 && isSameVNodeType(prevChild, c2[j2])) {
              newIndex = j2;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j2 = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l22 ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j2 < 0 || i !== increasingNewIndexSequence[j2]) {
            move(nextChild, container, anchor, 2);
          } else {
            j2--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        if (transition.persisted && !el[leaveCbKey]) {
          hostInsert(el, container, anchor);
        } else {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        }
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        };
        const performLeave = () => {
          const wasLeaving = el._isLeaving || !!el[leaveCbKey];
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          if (transition.persisted && !wasLeaving) {
            remove22();
          } else {
            leave(el, () => {
              remove22();
              afterLeave && afterLeave();
            });
          }
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex,
      memo
    } = vnode;
    if (patchFlag === -2) {
      optimized = false;
    }
    if (ref3 != null) {
      pauseTracking();
      setRef(ref3, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    const shouldInvalidateMemo = memo != null && cacheIndex == null;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        if (shouldInvalidateMemo) {
          vnode.el = null;
        }
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, job, subTree, um, m: m2, a } = instance;
    invalidateMount(m2);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  let isFlushing = false;
  const render = (vnode, container, namespace) => {
    let instance;
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
        instance = container._vnode.component;
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    container._vnode = vnode;
    if (!isFlushing) {
      isFlushing = true;
      flushPreFlushCbs(instance);
      flushPostFlushCbs();
      isFlushing = false;
    }
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  return {
    render,
    hydrate,
    createApp: createAppAPI(render)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, job }, allowed) {
  if (allowed) {
    effect2.flags |= 32;
    job.flags |= 4;
  } else {
    effect2.flags &= -33;
    job.flags &= -5;
  }
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        if (c2.patchFlag === -1) {
          c2 = ch2[i] = cloneIfMounted(c2);
        }
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j2, u, v2, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j2 = result[result.length - 1];
      if (arr[j2] < arrI) {
        p2[i] = j2;
        result.push(i);
        continue;
      }
      u = 0;
      v2 = result.length - 1;
      while (u < v2) {
        c = u + v2 >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v2 = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v2 = result[u - 1];
  while (u-- > 0) {
    result[u] = v2;
    v2 = p2[v2];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) {
    return anchorVnode.placeholder;
  }
  const instance = anchorVnode.component;
  if (instance) {
    return resolveAsyncComponentPlaceholder(instance.subTree);
  }
  return null;
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
const Text = /* @__PURE__ */ Symbol.for("v-txt");
const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
const Static = /* @__PURE__ */ Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref3,
  ref_key,
  ref_for
}) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString(ref3) || /* @__PURE__ */ isRef(ref3) || isFunction(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style)) {
      if (/* @__PURE__ */ isProxy(style) && !isArray(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref3, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref3 ? isArray(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        } else if (incoming == null && existing == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !isModelListener(key)) {
          ret[key] = incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g2 = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g2[key])) setters = g2[key] = [];
    setters.push(setter);
    return (v2) => {
      if (setters.length > 1) setters.forEach((set) => set(v2));
      else setters[0](v2);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v2) => currentInstance = v2
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v2) => isInSSRComponentSetup = v2
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult);
    }
  } else {
    finishComponentSetup(instance);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance);
}
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])\w/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
      instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
};
const version = "3.5.38";
/**
* @vue/runtime-dom v3.5.38
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let policy = void 0;
const tt$1 = typeof window !== "undefined" && window.trustedTypes;
if (tt$1) {
  try {
    policy = /* @__PURE__ */ tt$1.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
  }
}
const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const vtcKey = /* @__PURE__ */ Symbol("_vtc");
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
const vShowHidden = /* @__PURE__ */ Symbol("_vsh");
const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
const displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      const value = next[key];
      if (value != null) {
        if (!shouldPreserveTextareaResizeStyle(
          el,
          key,
          !isString(prev) && prev ? prev[key] : void 0,
          value
        )) {
          setStyle(style, key, value);
        }
      } else {
        setStyle(style, key, "");
      }
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v2) => setStyle(style, name, v2));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
  return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean ? "" : isSymbol(value) ? String(value) : value
      );
    }
  }
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m2;
    while (m2 = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m2[0].length);
      options[m2[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    const value = invoker.value;
    if (isArray(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      const handlers = value.slice();
      const args = [e];
      for (let i = 0; i < handlers.length; i++) {
        if (e._stopped) {
          break;
        }
        const handler = handlers[i];
        if (handler) {
          callWithAsyncErrorHandling(
            handler,
            instance,
            5,
            args
          );
        }
      }
    } else {
      callWithAsyncErrorHandling(
        value,
        instance,
        5,
        [e]
      );
    }
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && // #12408 check if it's declared prop or it's async custom element
    (shouldSetAsPropForVueCE(el, key) || // @ts-expect-error _def is private
    el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
  const props = (
    // @ts-expect-error _def is private
    el._def.props
  );
  if (!props) {
    return false;
  }
  const camelKey = camelize(key);
  return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = /* @__PURE__ */ Symbol("_assign");
function castValue(value, trim, number) {
  if (trim) value = value.trim();
  if (number) value = looseToNumber(value);
  return value;
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing) return;
      el[assignKey](castValue(el.value, trim, castToNumber));
    });
    if (trim || castToNumber) {
      addEventListener(el, "change", () => {
        el.value = castValue(el.value, trim, castToNumber);
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing) return;
    const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
    const newValue = value == null ? "" : value;
    if (elValue === newValue) {
      return;
    }
    const rootNode = el.getRootNode();
    if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
      if (lazy && value === oldValue) {
        return;
      }
      if (trim && el.value.trim() === newValue) {
        return;
      }
    }
    el.value = newValue;
  }
};
const vModelCheckbox = {
  // #4096 array checkboxes need to be deep traversed
  deep: true,
  created(el, _2, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue(el);
      const checked = el.checked;
      const assign = el[assignKey];
      if (isArray(modelValue)) {
        const index = looseIndexOf(modelValue, elementValue);
        const found = index !== -1;
        if (checked && !found) {
          assign(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index, 1);
          assign(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign(cloned);
      } else {
        assign(getCheckboxValue(el, checked));
      }
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  let checked;
  if (isArray(value)) {
    checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    checked = value.has(vnode.props.value);
  } else {
    if (value === oldValue) return;
    checked = looseEqual(value, getCheckboxValue(el, true));
  }
  if (el.checked !== checked) {
    el.checked = checked;
  }
}
const vModelSelect = {
  // <select multiple> value need to be deep traversed
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    const isSetModel = isSet(value);
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map(
        (o) => number ? looseToNumber(getValue(o)) : getValue(o)
      );
      el[assignKey](
        el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]
      );
      el._assigning = true;
      nextTick(() => {
        el._assigning = false;
      });
    });
    el[assignKey] = getModelAssigner(vnode);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    if (!el._assigning) {
      setSelected(el, value);
    }
  }
};
function setSelected(el, value) {
  const isMultiple = el.multiple;
  const isArrayValue = isArray(value);
  if (isMultiple && !isArrayValue && !isSet(value)) {
    return;
  }
  for (let i = 0, l3 = el.options.length; i < l3; i++) {
    const option = el.options[i];
    const optionValue = getValue(option);
    if (isMultiple) {
      if (isArrayValue) {
        const optionType = typeof optionValue;
        if (optionType === "string" || optionType === "number") {
          option.selected = value.some((v2) => String(v2) === String(optionValue));
        } else {
          option.selected = looseIndexOf(value, optionValue) > -1;
        }
      } else {
        option.selected = value.has(optionValue);
      }
    } else if (looseEqual(getValue(option), value)) {
      if (el.selectedIndex !== i) el.selectedIndex = i;
      return;
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m2) => e[`${m2}Key`] && !modifiers.includes(m2))
};
const withModifiers = (fn, modifiers) => {
  if (!fn) return fn;
  const cache = fn._withMods || (fn._withMods = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = (event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers)) return;
    }
    return fn(event, ...args);
  });
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn, modifiers) => {
  const cache = fn._withKeys || (fn._withKeys = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = (event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some(
      (k) => k === eventKey || keyNames[k] === eventKey
    )) {
      return fn(event);
    }
  });
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
};
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
function M() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var T = M();
function N(l3) {
  T = l3;
}
var _ = { exec: () => null };
function E(l3) {
  let e = [];
  return (t) => {
    let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
    return s || (s = l3(n), e[n] = s), s;
  };
}
function d(l3, e = "") {
  let t = typeof l3 == "string" ? l3 : l3.source, n = { replace: (s, r) => {
    let i = typeof r == "string" ? r : r.source;
    return i = i.replace(m.caret, "$1"), t = t.replace(s, i), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var Te = ((l3 = "") => {
  try {
    return !!new RegExp("(?<=1)(?<!1)" + l3);
  } catch {
    return false;
  }
})(), m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (l3) => new RegExp(`^( {0,3}${l3})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: E((l3) => new RegExp(`^ {0,${l3}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)), hrRegex: E((l3) => new RegExp(`^ {0,${l3}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)), fencesBeginRegex: E((l3) => new RegExp(`^ {0,${l3}}(?:\`\`\`|~~~)`)), headingBeginRegex: E((l3) => new RegExp(`^ {0,${l3}}#`)), htmlBeginRegex: E((l3) => new RegExp(`^ {0,${l3}}<(?:[a-z].*>|!--)`, "i")), blockquoteBeginRegex: E((l3) => new RegExp(`^ {0,${l3}}>`)) }, Oe = /^(?:[ \t]*(?:\n|$))+/, we = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/, ye = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/, B = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/, Pe = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/, j = / {0,3}(?:[*+-]|\d{1,9}[.)])/, oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/, ae = d(oe).replace(/bull/g, j).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex(), Se = d(oe).replace(/bull/g, j).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(), F = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/, $e = /^[^\n]+/, U = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/, Le = d(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", U).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(), _e = d(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, j).getRegex(), H = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul", K = /<!--(?:-?>|[\s\S]*?(?:-->|$))/, ze = d("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", K).replace("tag", H).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(), le = d(F).replace("hr", B).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex(), Me = d(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", le).getRegex(), W = { blockquote: Me, code: we, def: Le, fences: ye, heading: Pe, hr: B, html: ze, lheading: ae, list: _e, newline: Oe, paragraph: le, table: _, text: $e }, se = d("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", B).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex(), Ee = { ...W, lheading: Se, table: se, paragraph: d(F).replace("hr", B).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", H).getRegex() }, Ie = { ...W, html: d(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", K).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: _, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: d(F).replace("hr", B).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ae).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() }, Ae = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/, Ce = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/, ue = /^( {2,}|\\)\n(?!\s*$)/, Be = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/, I = /[\p{P}\p{S}]/u, Z = /[\s\p{P}\p{S}]/u, X = /[^\s\p{P}\p{S}]/u, De = d(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, Z).getRegex(), pe = /(?!~)[\p{P}\p{S}]/u, qe = /(?!~)[\s\p{P}\p{S}]/u, ve = /(?:[^\s\p{P}\p{S}]|~)/u, He = d(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Te ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex(), ce = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/, Ze = d(ce, "u").replace(/punct/g, I).getRegex(), Ge = d(ce, "u").replace(/punct/g, pe).getRegex(), he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)", Ne = d(he, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z).replace(/punct/g, I).getRegex(), Qe = d(he, "gu").replace(/notPunctSpace/g, ve).replace(/punctSpace/g, qe).replace(/punct/g, pe).getRegex(), je = d("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z).replace(/punct/g, I).getRegex(), Fe = d(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, I).getRegex(), Ue = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", Ke = d(Ue, "gu").replace(/notPunctSpace/g, X).replace(/punctSpace/g, Z).replace(/punct/g, I).getRegex(), We = d(/\\(punct)/, "gu").replace(/punct/g, I).getRegex(), Xe = d(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(), Je = d(K).replace("(?:-->|$)", "-->").getRegex(), Ve = d("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Je).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(), v = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/, Ye = d(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", v).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(), ke = d(/^!?\[(label)\]\[(ref)\]/).replace("label", v).replace("ref", U).getRegex(), de = d(/^!?\[(ref)\](?:\[\])?/).replace("ref", U).getRegex(), et = d("reflink|nolink(?!\\()", "g").replace("reflink", ke).replace("nolink", de).getRegex(), ie = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/, J = { _backpedal: _, anyPunctuation: We, autolink: Xe, blockSkip: He, br: ue, code: Ce, del: _, delLDelim: _, delRDelim: _, emStrongLDelim: Ze, emStrongRDelimAst: Ne, emStrongRDelimUnd: je, escape: Ae, link: Ye, nolink: de, punctuation: De, reflink: ke, reflinkSearch: et, tag: Ve, text: Be, url: _ }, tt = { ...J, link: d(/^!?\[(label)\]\((.*?)\)/).replace("label", v).getRegex(), reflink: d(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", v).getRegex() }, Q = { ...J, emStrongRDelimAst: Qe, emStrongLDelim: Ge, delLDelim: Fe, delRDelim: Ke, url: d(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ie).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: d(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ie).getRegex() }, nt = { ...Q, br: d(ue).replace("{2,}", "*").getRegex(), text: d(Q.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() }, D = { normal: W, gfm: Ee, pedantic: Ie }, A = { normal: J, gfm: Q, breaks: nt, pedantic: tt };
var rt = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }, ge = (l3) => rt[l3];
function O(l3, e) {
  if (e) {
    if (m.escapeTest.test(l3)) return l3.replace(m.escapeReplace, ge);
  } else if (m.escapeTestNoEncode.test(l3)) return l3.replace(m.escapeReplaceNoEncode, ge);
  return l3;
}
function V(l3) {
  try {
    l3 = encodeURI(l3).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return l3;
}
function Y(l3, e) {
  let t = l3.replace(m.findPipe, (r, i, o) => {
    let u = false, a = i;
    for (; --a >= 0 && o[a] === "\\"; ) u = !u;
    return u ? "|" : " |";
  }), n = t.split(m.splitPipe), s = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
  else for (; n.length < e; ) n.push("");
  for (; s < n.length; s++) n[s] = n[s].trim().replace(m.slashPipe, "|");
  return n;
}
function $(l3, e, t) {
  let n = l3.length;
  if (n === 0) return "";
  let s = 0;
  for (; s < n; ) {
    let r = l3.charAt(n - s - 1);
    if (r === e && true) s++;
    else break;
  }
  return l3.slice(0, n - s);
}
function ee(l3) {
  let e = l3.split(`
`), t = e.length - 1;
  for (; t >= 0 && m.blankLine.test(e[t]); ) t--;
  return e.length - t <= 2 ? l3 : e.slice(0, t + 1).join(`
`);
}
function fe(l3, e) {
  if (l3.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let n = 0; n < l3.length; n++) if (l3[n] === "\\") n++;
  else if (l3[n] === e[0]) t++;
  else if (l3[n] === e[1] && (t--, t < 0)) return n;
  return t > 0 ? -2 : -1;
}
function me(l3, e = 0) {
  let t = e, n = "";
  for (let s of l3) if (s === "	") {
    let r = 4 - t % 4;
    n += " ".repeat(r), t += r;
  } else n += s, t++;
  return n;
}
function xe(l3, e, t, n, s) {
  let r = e.href, i = e.title || null, o = l3[1].replace(s.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let u = { type: l3[0].charAt(0) === "!" ? "image" : "link", raw: t, href: r, title: i, text: o, tokens: n.inlineTokens(o) };
  return n.state.inLink = false, u;
}
function st(l3, e, t) {
  let n = l3.match(t.other.indentCodeCompensation);
  if (n === null) return e;
  let s = n[1];
  return e.split(`
`).map((r) => {
    let i = r.match(t.other.beginningSpace);
    if (i === null) return r;
    let [o] = i;
    return o.length >= s.length ? r.slice(s.length) : r;
  }).join(`
`);
}
var w = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0) return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = this.options.pedantic ? t[0] : ee(t[0]), s = n.replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: n, codeBlockStyle: "indented", text: s };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], s = st(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: s };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let s = $(n, "#");
        (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
      }
      return { type: "heading", raw: $(t[0], `
`), depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t) return { type: "hr", raw: $(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = $(t[0], `
`).split(`
`), s = "", r = "", i = [];
      for (; n.length > 0; ) {
        let o = false, u = [], a;
        for (a = 0; a < n.length; a++) if (this.rules.other.blockquoteStart.test(n[a])) u.push(n[a]), o = true;
        else if (!o) u.push(n[a]);
        else break;
        n = n.slice(a);
        let c = u.join(`
`), p2 = c.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        s = s ? `${s}
${c}` : c, r = r ? `${r}
${p2}` : p2;
        let k = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(p2, i, true), this.lexer.state.top = k, n.length === 0) break;
        let h = i.at(-1);
        if (h?.type === "code") break;
        if (h?.type === "blockquote") {
          let R = h, f = R.raw + `
` + n.join(`
`), S = this.blockquote(f);
          i[i.length - 1] = S, s = s.substring(0, s.length - R.raw.length) + S.raw, r = r.substring(0, r.length - R.text.length) + S.text;
          break;
        } else if (h?.type === "list") {
          let R = h, f = R.raw + `
` + n.join(`
`), S = this.list(f);
          i[i.length - 1] = S, s = s.substring(0, s.length - h.raw.length) + S.raw, r = r.substring(0, r.length - R.raw.length) + S.raw, n = f.substring(i.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: s, tokens: i, text: r };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), s = n.length > 1, r = { type: "list", raw: "", ordered: s, start: s ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
      let i = this.rules.other.listItemRegex(n), o = false;
      for (; e; ) {
        let a = false, c = "", p2 = "";
        if (!(t = i.exec(e)) || this.rules.block.hr.test(e)) break;
        c = t[0], e = e.substring(c.length);
        let k = me(t[2].split(`
`, 1)[0], t[1].length), h = e.split(`
`, 1)[0], R = !k.trim(), f = 0;
        if (this.options.pedantic ? (f = 2, p2 = k.trimStart()) : R ? f = t[1].length + 1 : (f = k.search(this.rules.other.nonSpaceChar), f = f > 4 ? 1 : f, p2 = k.slice(f), f += t[1].length), R && this.rules.other.blankLine.test(h) && (c += h + `
`, e = e.substring(h.length + 1), a = true), !a) {
          let S = this.rules.other.nextBulletRegex(f), te = this.rules.other.hrRegex(f), ne = this.rules.other.fencesBeginRegex(f), re = this.rules.other.headingBeginRegex(f), be = this.rules.other.htmlBeginRegex(f), Re = this.rules.other.blockquoteBeginRegex(f);
          for (; e; ) {
            let G = e.split(`
`, 1)[0], C;
            if (h = G, this.options.pedantic ? (h = h.replace(this.rules.other.listReplaceNesting, "  "), C = h) : C = h.replace(this.rules.other.tabCharGlobal, "    "), ne.test(h) || re.test(h) || be.test(h) || Re.test(h) || S.test(h) || te.test(h)) break;
            if (C.search(this.rules.other.nonSpaceChar) >= f || !h.trim()) p2 += `
` + C.slice(f);
            else {
              if (R || k.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(k) || re.test(k) || te.test(k)) break;
              p2 += `
` + h;
            }
            R = !h.trim(), c += G + `
`, e = e.substring(G.length + 1), k = C.slice(f);
          }
        }
        r.loose || (o ? r.loose = true : this.rules.other.doubleBlankLine.test(c) && (o = true)), r.items.push({ type: "list_item", raw: c, task: !!this.options.gfm && this.rules.other.listIsTask.test(p2), loose: false, text: p2, tokens: [] }), r.raw += c;
      }
      let u = r.items.at(-1);
      if (u) u.raw = u.raw.trimEnd(), u.text = u.text.trimEnd();
      else return;
      r.raw = r.raw.trimEnd();
      for (let a of r.items) {
        this.lexer.state.top = false, a.tokens = this.lexer.blockTokens(a.text, []);
        let c = a.tokens[0];
        if (a.task && (c?.type === "text" || c?.type === "paragraph")) {
          a.text = a.text.replace(this.rules.other.listReplaceTask, ""), c.raw = c.raw.replace(this.rules.other.listReplaceTask, ""), c.text = c.text.replace(this.rules.other.listReplaceTask, "");
          for (let k = this.lexer.inlineQueue.length - 1; k >= 0; k--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[k].src)) {
            this.lexer.inlineQueue[k].src = this.lexer.inlineQueue[k].src.replace(this.rules.other.listReplaceTask, "");
            break;
          }
          let p2 = this.rules.other.listTaskCheckbox.exec(a.raw);
          if (p2) {
            let k = { type: "checkbox", raw: p2[0] + " ", checked: p2[0] !== "[ ]" };
            a.checked = k.checked, r.loose ? a.tokens[0] && ["paragraph", "text"].includes(a.tokens[0].type) && "tokens" in a.tokens[0] && a.tokens[0].tokens ? (a.tokens[0].raw = k.raw + a.tokens[0].raw, a.tokens[0].text = k.raw + a.tokens[0].text, a.tokens[0].tokens.unshift(k)) : a.tokens.unshift({ type: "paragraph", raw: k.raw, text: k.raw, tokens: [k] }) : a.tokens.unshift(k);
          }
        } else a.task && (a.task = false);
        if (!r.loose) {
          let p2 = a.tokens.filter((h) => h.type === "space"), k = p2.length > 0 && p2.some((h) => this.rules.other.anyLine.test(h.raw));
          r.loose = k;
        }
      }
      if (r.loose) for (let a of r.items) {
        a.loose = true;
        for (let c of a.tokens) c.type === "text" && (c.type = "paragraph");
      }
      return r;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t) {
      let n = ee(t[0]);
      return { type: "html", block: true, raw: n, pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: n };
    }
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: $(t[0], `
`), href: s, title: r };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
    let n = Y(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = { type: "table", raw: $(t[0], `
`), header: [], align: [], rows: [] };
    if (n.length === s.length) {
      for (let o of s) this.rules.other.tableAlignRight.test(o) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? i.align.push("left") : i.align.push(null);
      for (let o = 0; o < n.length; o++) i.header.push({ text: n[o], tokens: this.lexer.inline(n[o]), header: true, align: i.align[o] });
      for (let o of r) i.rows.push(Y(o, i.header.length).map((u, a) => ({ text: u, tokens: this.lexer.inline(u), header: false, align: i.align[a] })));
      return i;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t) {
      let n = t[1].trim();
      return { type: "heading", raw: $(t[0], `
`), depth: t[2].charAt(0) === "=" ? 1 : 2, text: n, tokens: this.lexer.inline(n) };
    }
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t) return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t) return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n)) return;
        let i = $(n.slice(0, -1), "\\");
        if ((n.length - i.length) % 2 === 0) return;
      } else {
        let i = fe(t[2], "()");
        if (i === -2) return;
        if (i > -1) {
          let u = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
          t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, u).trim(), t[3] = "";
        }
      }
      let s = t[2], r = "";
      if (this.options.pedantic) {
        let i = this.rules.other.pedanticHrefTitle.exec(s);
        i && (s = i[1], r = i[3]);
      } else r = t[3] ? t[3].slice(1, -1) : "";
      return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), xe(t, { href: s && s.replace(this.rules.inline.anyPunctuation, "$1"), title: r && r.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let s = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), r = t[s.toLowerCase()];
      if (!r) {
        let i = n[0].charAt(0);
        return { type: "text", raw: i, text: i };
      }
      return xe(n, r, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let s = this.rules.inline.emStrongLDelim.exec(e);
    if (!s || !s[1] && !s[2] && !s[3] && !s[4] || s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
    if (!(s[1] || s[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, u, a = i, c = 0, p2 = s[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (p2.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = p2.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
        if (u = [...o].length, s[3] || s[4]) {
          a += u;
          continue;
        } else if ((s[5] || s[6]) && i % 3 && !((i + u) % 3)) {
          c += u;
          continue;
        }
        if (a -= u, a > 0) continue;
        u = Math.min(u, u + a + c);
        let k = [...s[0]][0].length, h = e.slice(0, i + s.index + k + u);
        if (Math.min(i, u) % 2) {
          let f = h.slice(1, -1);
          return { type: "em", raw: h, text: f, tokens: this.lexer.inlineTokens(f) };
        }
        let R = h.slice(2, -2);
        return { type: "strong", raw: h, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return s && r && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t) return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let s = this.rules.inline.delLDelim.exec(e);
    if (!s) return;
    if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let i = [...s[0]].length - 1, o, u, a = i, c = this.rules.inline.delRDelim;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = c.exec(t)) !== null; ) {
        if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (u = [...o].length, u !== i)) continue;
        if (s[3] || s[4]) {
          a += u;
          continue;
        }
        if (a -= u, a > 0) continue;
        u = Math.min(u, u + a);
        let p2 = [...s[0]][0].length, k = e.slice(0, i + s.index + p2 + u), h = k.slice(i, -i);
        return { type: "del", raw: k, text: h, tokens: this.lexer.inlineTokens(h) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, s;
      return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, s;
      if (t[2] === "@") n = t[0], s = "mailto:" + n;
      else {
        let r;
        do
          r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (r !== t[0]);
        n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: s, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
};
var x = class l {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = /* @__PURE__ */ Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new w(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t = { other: m, block: D.normal, inline: A.normal };
    this.options.pedantic ? (t.block = D.pedantic, t.inline = A.pedantic) : this.options.gfm && (t.block = D.gfm, this.options.breaks ? t.inline = A.breaks : t.inline = A.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: D, inline: A };
  }
  static lex(e, t) {
    return new l(t).lex(e);
  }
  static lexInline(e, t) {
    return new l(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0; t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));
    let s = 1 / 0;
    for (; e; ) {
      if (e.length < s) s = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      let r;
      if (this.options.extensions?.block?.some((o) => (r = o.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false)) continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        r.raw.length === 1 && o !== void 0 ? o.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.raw, this.inlineQueue.at(-1).src = o.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let o = 1 / 0, u = e.slice(1), a;
        this.options.extensions.startBlock.forEach((c) => {
          a = c.call({ lexer: this }, u), typeof a == "number" && a >= 0 && (o = Math.min(o, a));
        }), o < 1 / 0 && o >= 0 && (i = e.substring(0, o + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let o = t.at(-1);
        n && o?.type === "paragraph" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let o = t.at(-1);
        o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  inlineTokens(e, t = []) {
    this.tokenizer.lexer = this;
    let n = e, s = null;
    if (this.tokens.links) {
      let a = Object.keys(this.tokens.links);
      if (a.length > 0) for (; (s = this.tokenizer.rules.inline.reflinkSearch.exec(n)) !== null; ) a.includes(s[0].slice(s[0].lastIndexOf("[") + 1, -1)) && (n = n.slice(0, s.index) + "[" + "a".repeat(s[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (; (s = this.tokenizer.rules.inline.anyPunctuation.exec(n)) !== null; ) n = n.slice(0, s.index) + "++" + n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let r;
    for (; (s = this.tokenizer.rules.inline.blockSkip.exec(n)) !== null; ) r = s[2] ? s[2].length : 0, n = n.slice(0, s.index + r) + "[" + "a".repeat(s[0].length - r - 2) + "]" + n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let i = false, o = "", u = 1 / 0;
    for (; e; ) {
      if (e.length < u) u = e.length;
      else {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
      i || (o = ""), i = false;
      let a;
      if (this.options.extensions?.inline?.some((p2) => (a = p2.call({ lexer: this }, e, t)) ? (e = e.substring(a.raw.length), t.push(a), true) : false)) continue;
      if (a = this.tokenizer.escape(e)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (a = this.tokenizer.tag(e)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (a = this.tokenizer.link(e)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (a = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(a.raw.length);
        let p2 = t.at(-1);
        a.type === "text" && p2?.type === "text" ? (p2.raw += a.raw, p2.text += a.text) : t.push(a);
        continue;
      }
      if (a = this.tokenizer.emStrong(e, n, o)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (a = this.tokenizer.codespan(e)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (a = this.tokenizer.br(e)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (a = this.tokenizer.del(e, n, o)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (a = this.tokenizer.autolink(e)) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      if (!this.state.inLink && (a = this.tokenizer.url(e))) {
        e = e.substring(a.raw.length), t.push(a);
        continue;
      }
      let c = e;
      if (this.options.extensions?.startInline) {
        let p2 = 1 / 0, k = e.slice(1), h;
        this.options.extensions.startInline.forEach((R) => {
          h = R.call({ lexer: this }, k), typeof h == "number" && h >= 0 && (p2 = Math.min(p2, h));
        }), p2 < 1 / 0 && p2 >= 0 && (c = e.substring(0, p2 + 1));
      }
      if (a = this.tokenizer.inlineText(c)) {
        e = e.substring(a.raw.length), a.raw.slice(-1) !== "_" && (o = a.raw.slice(-1)), i = true;
        let p2 = t.at(-1);
        p2?.type === "text" ? (p2.raw += a.raw, p2.text += a.text) : t.push(a);
        continue;
      }
      if (e) {
        this.infiniteLoopError(e.charCodeAt(0));
        break;
      }
    }
    return t;
  }
  infiniteLoopError(e) {
    let t = "Infinite loop on byte: " + e;
    if (this.options.silent) console.error(t);
    else throw new Error(t);
  }
};
var y = class {
  options;
  parser;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let s = (t || "").match(m.notSpaceStart)?.[0], r = e.replace(m.endingNewline, "") + `
`;
    return s ? '<pre><code class="language-' + O(s) + '">' + (n ? r : O(r, true)) + `</code></pre>
` : "<pre><code>" + (n ? r : O(r, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let t = e.ordered, n = e.start, s = "";
    for (let o = 0; o < e.items.length; o++) {
      let u = e.items[o];
      s += this.listitem(u);
    }
    let r = t ? "ol" : "ul", i = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + r + i + `>
` + s + "</" + r + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let r = 0; r < e.header.length; r++) n += this.tablecell(e.header[r]);
    t += this.tablerow({ text: n });
    let s = "";
    for (let r = 0; r < e.rows.length; r++) {
      let i = e.rows[r];
      n = "";
      for (let o = 0; o < i.length; o++) n += this.tablecell(i[o]);
      s += this.tablerow({ text: n });
    }
    return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${O(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let s = this.parser.parseInline(n), r = V(e);
    if (r === null) return s;
    e = r;
    let i = '<a href="' + e + '"';
    return t && (i += ' title="' + O(t) + '"'), i += ">" + s + "</a>", i;
  }
  image({ href: e, title: t, text: n, tokens: s }) {
    s && (n = this.parser.parseInline(s, this.parser.textRenderer));
    let r = V(e);
    if (r === null) return O(n);
    e = r;
    let i = `<img src="${e}" alt="${O(n)}"`;
    return t && (i += ` title="${O(t)}"`), i += ">", i;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : O(e.text);
  }
};
var L = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var b = class l2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || T, this.options.renderer = this.options.renderer || new y(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L();
  }
  static parse(e, t) {
    return new l2(t).parse(e);
  }
  static parseInline(e, t) {
    return new l2(t).parseInline(e);
  }
  parse(e) {
    this.renderer.parser = this;
    let t = "";
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (this.options.extensions?.renderers?.[s.type]) {
        let i = s, o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (o !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(i.type)) {
          t += o || "";
          continue;
        }
      }
      let r = s;
      switch (r.type) {
        case "space": {
          t += this.renderer.space(r);
          break;
        }
        case "hr": {
          t += this.renderer.hr(r);
          break;
        }
        case "heading": {
          t += this.renderer.heading(r);
          break;
        }
        case "code": {
          t += this.renderer.code(r);
          break;
        }
        case "table": {
          t += this.renderer.table(r);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(r);
          break;
        }
        case "list": {
          t += this.renderer.list(r);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(r);
          break;
        }
        case "html": {
          t += this.renderer.html(r);
          break;
        }
        case "def": {
          t += this.renderer.def(r);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(r);
          break;
        }
        case "text": {
          t += this.renderer.text(r);
          break;
        }
        default: {
          let i = 'Token with "' + r.type + '" type was not found.';
          if (this.options.silent) return console.error(i), "";
          throw new Error(i);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    this.renderer.parser = this;
    let n = "";
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      if (this.options.extensions?.renderers?.[r.type]) {
        let o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
        if (o !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(r.type)) {
          n += o || "";
          continue;
        }
      }
      let i = r;
      switch (i.type) {
        case "escape": {
          n += t.text(i);
          break;
        }
        case "html": {
          n += t.html(i);
          break;
        }
        case "link": {
          n += t.link(i);
          break;
        }
        case "image": {
          n += t.image(i);
          break;
        }
        case "checkbox": {
          n += t.checkbox(i);
          break;
        }
        case "strong": {
          n += t.strong(i);
          break;
        }
        case "em": {
          n += t.em(i);
          break;
        }
        case "codespan": {
          n += t.codespan(i);
          break;
        }
        case "br": {
          n += t.br(i);
          break;
        }
        case "del": {
          n += t.del(i);
          break;
        }
        case "text": {
          n += t.text(i);
          break;
        }
        default: {
          let o = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent) return console.error(o), "";
          throw new Error(o);
        }
      }
    }
    return n;
  }
};
var P = class {
  options;
  block;
  constructor(e) {
    this.options = e || T;
  }
  static passThroughHooks = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = /* @__PURE__ */ new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer(e = this.block) {
    return e ? x.lex : x.lexInline;
  }
  provideParser(e = this.block) {
    return e ? b.parse : b.parseInline;
  }
};
var q = class {
  defaults = M();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = y;
  TextRenderer = L;
  Lexer = x;
  Tokenizer = w;
  Hooks = P;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let s of e) switch (n = n.concat(t.call(this, s)), s.type) {
      case "table": {
        let r = s;
        for (let i of r.header) n = n.concat(this.walkTokens(i.tokens, t));
        for (let i of r.rows) for (let o of i) n = n.concat(this.walkTokens(o.tokens, t));
        break;
      }
      case "list": {
        let r = s;
        n = n.concat(this.walkTokens(r.items, t));
        break;
      }
      default: {
        let r = s;
        this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((i) => {
          let o = r[i].flat(1 / 0);
          n = n.concat(this.walkTokens(o, t));
        }) : r.tokens && (n = n.concat(this.walkTokens(r.tokens, t)));
      }
    }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let s = { ...n };
      if (s.async = this.defaults.async || s.async || false, n.extensions && (n.extensions.forEach((r) => {
        if (!r.name) throw new Error("extension name required");
        if ("renderer" in r) {
          let i = t.renderers[r.name];
          i ? t.renderers[r.name] = function(...o) {
            let u = r.renderer.apply(this, o);
            return u === false && (u = i.apply(this, o)), u;
          } : t.renderers[r.name] = r.renderer;
        }
        if ("tokenizer" in r) {
          if (!r.level || r.level !== "block" && r.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
          let i = t[r.level];
          i ? i.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
        }
        "childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
      }), s.extensions = t), n.renderer) {
        let r = this.defaults.renderer || new y(this.defaults);
        for (let i in n.renderer) {
          if (!(i in r)) throw new Error(`renderer '${i}' does not exist`);
          if (["options", "parser"].includes(i)) continue;
          let o = i, u = n.renderer[o], a = r[o];
          r[o] = (...c) => {
            let p2 = u.apply(r, c);
            return p2 === false && (p2 = a.apply(r, c)), p2 || "";
          };
        }
        s.renderer = r;
      }
      if (n.tokenizer) {
        let r = this.defaults.tokenizer || new w(this.defaults);
        for (let i in n.tokenizer) {
          if (!(i in r)) throw new Error(`tokenizer '${i}' does not exist`);
          if (["options", "rules", "lexer"].includes(i)) continue;
          let o = i, u = n.tokenizer[o], a = r[o];
          r[o] = (...c) => {
            let p2 = u.apply(r, c);
            return p2 === false && (p2 = a.apply(r, c)), p2;
          };
        }
        s.tokenizer = r;
      }
      if (n.hooks) {
        let r = this.defaults.hooks || new P();
        for (let i in n.hooks) {
          if (!(i in r)) throw new Error(`hook '${i}' does not exist`);
          if (["options", "block"].includes(i)) continue;
          let o = i, u = n.hooks[o], a = r[o];
          P.passThroughHooks.has(i) ? r[o] = (c) => {
            if (this.defaults.async && P.passThroughHooksRespectAsync.has(i)) return (async () => {
              let k = await u.call(r, c);
              return a.call(r, k);
            })();
            let p2 = u.call(r, c);
            return a.call(r, p2);
          } : r[o] = (...c) => {
            if (this.defaults.async) return (async () => {
              let k = await u.apply(r, c);
              return k === false && (k = await a.apply(r, c)), k;
            })();
            let p2 = u.apply(r, c);
            return p2 === false && (p2 = a.apply(r, c)), p2;
          };
        }
        s.hooks = r;
      }
      if (n.walkTokens) {
        let r = this.defaults.walkTokens, i = n.walkTokens;
        s.walkTokens = function(o) {
          let u = [];
          return u.push(i.call(this, o)), r && (u = u.concat(r.call(this, o))), u;
        };
      }
      this.defaults = { ...this.defaults, ...s };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, s) => {
      let r = { ...s }, i = { ...this.defaults, ...r }, o = this.onError(!!i.silent, !!i.async);
      if (this.defaults.async === true && r.async === false) return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null) return o(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string") return o(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
        let u = i.hooks ? await i.hooks.preprocess(n) : n, c = await (i.hooks ? await i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(u, i), p2 = i.hooks ? await i.hooks.processAllTokens(c) : c;
        i.walkTokens && await Promise.all(this.walkTokens(p2, i.walkTokens));
        let h = await (i.hooks ? await i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(p2, i);
        return i.hooks ? await i.hooks.postprocess(h) : h;
      })().catch(o);
      try {
        i.hooks && (n = i.hooks.preprocess(n));
        let a = (i.hooks ? i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(n, i);
        i.hooks && (a = i.hooks.processAllTokens(a)), i.walkTokens && this.walkTokens(a, i.walkTokens);
        let p2 = (i.hooks ? i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(a, i);
        return i.hooks && (p2 = i.hooks.postprocess(p2)), p2;
      } catch (u) {
        return o(u);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let s = "<p>An error occurred:</p><pre>" + O(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(s) : s;
      }
      if (t) return Promise.reject(n);
      throw n;
    };
  }
};
var z = new q();
function g(l3, e) {
  return z.parse(l3, e);
}
g.options = g.setOptions = function(l3) {
  return z.setOptions(l3), g.defaults = z.defaults, N(g.defaults), g;
};
g.getDefaults = M;
g.defaults = T;
g.use = function(...l3) {
  return z.use(...l3), g.defaults = z.defaults, N(g.defaults), g;
};
g.walkTokens = function(l3, e) {
  return z.walkTokens(l3, e);
};
g.parseInline = z.parseInline;
g.Parser = b;
g.parser = b.parse;
g.Renderer = y;
g.TextRenderer = L;
g.Lexer = x;
g.lexer = x.lex;
g.Tokenizer = w;
g.Hooks = P;
g.parse = g;
g.options;
g.setOptions;
g.use;
g.walkTokens;
g.parseInline;
b.parse;
x.lex;
const _hoisted_1$p = {
  key: 0,
  class: "mb-2 space-y-1",
  "data-testid": "tool-activity-list"
};
const _hoisted_2$p = ["onClick"];
const _hoisted_3$p = { class: "w-4 flex-shrink-0 text-center" };
const _hoisted_4$n = { class: "font-medium" };
const _hoisted_5$m = {
  key: 0,
  class: "text-gray-400 animate-pulse"
};
const _hoisted_6$k = {
  key: 0,
  class: "mt-1 ml-6 p-2 rounded bg-gray-900/5 dark:bg-black/20 text-[10px] overflow-auto max-h-[120px] whitespace-pre-wrap",
  "data-testid": "tool-output"
};
const _sfc_main$q = /* @__PURE__ */ defineComponent({
  __name: "ToolActivityList",
  props: {
    runs: {}
  },
  setup(__props) {
    const props = __props;
    const expanded = /* @__PURE__ */ reactive({});
    watch(
      () => props.runs,
      (runs) => {
        for (const run of runs) {
          if (run.status === "error") expanded[run.callId] = true;
        }
      },
      { deep: true, immediate: true }
    );
    function toggle(callId) {
      expanded[callId] = !expanded[callId];
    }
    function statusIcon(status) {
      if (status === "running") return "●";
      if (status === "error") return "✗";
      return "✓";
    }
    function statusClass(status) {
      if (status === "error") return "text-red-600 dark:text-red-400";
      if (status === "running") return "text-gray-500";
      return "text-gray-600 dark:text-gray-300";
    }
    return (_ctx, _cache) => {
      return __props.runs.length ? (openBlock(), createElementBlock("div", _hoisted_1$p, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(__props.runs, (run) => {
          return openBlock(), createElementBlock("div", {
            key: run.callId,
            class: "text-xs"
          }, [
            createBaseVNode("button", {
              type: "button",
              class: normalizeClass(["flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-gray-200/60 dark:hover:bg-gray-600/40", statusClass(run.status)]),
              onClick: ($event) => toggle(run.callId)
            }, [
              createBaseVNode("span", _hoisted_3$p, toDisplayString(statusIcon(run.status)), 1),
              createBaseVNode("span", _hoisted_4$n, toDisplayString(run.name), 1),
              run.status === "running" ? (openBlock(), createElementBlock("span", _hoisted_5$m, "…")) : createCommentVNode("", true)
            ], 10, _hoisted_2$p),
            expanded[run.callId] && run.output ? (openBlock(), createElementBlock("pre", _hoisted_6$k, toDisplayString(run.output), 1)) : createCommentVNode("", true)
          ]);
        }), 128))
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$o = { class: "mb-4 min-w-0" };
const _hoisted_2$o = {
  key: 0,
  class: "flex justify-end min-w-0"
};
const _hoisted_3$o = { class: "max-w-[95%] min-w-0 bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 break-words" };
const _hoisted_4$m = {
  key: 0,
  class: "mb-2 flex flex-wrap gap-1"
};
const _hoisted_5$l = { class: "whitespace-pre-wrap break-words" };
const _hoisted_6$j = {
  key: 1,
  class: "flex gap-3 min-w-0"
};
const _hoisted_7$j = { class: "max-w-[95%] min-w-0" };
const _hoisted_8$j = { class: "chat-message-content bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 prose dark:prose-invert max-w-none break-words" };
const _hoisted_9$e = ["innerHTML"];
const _hoisted_10$d = {
  key: 0,
  class: "mt-2 flex flex-wrap gap-1"
};
const _sfc_main$p = /* @__PURE__ */ defineComponent({
  __name: "ChatMessage",
  props: {
    msg: {}
  },
  setup(__props) {
    function renderMarkdown(text) {
      return g.parse(text);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$o, [
        __props.msg.role === "user" ? (openBlock(), createElementBlock("div", _hoisted_2$o, [
          createBaseVNode("div", _hoisted_3$o, [
            __props.msg.attachments?.length ? (openBlock(), createElementBlock("div", _hoisted_4$m, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.msg.attachments, (path) => {
                return openBlock(), createElementBlock("span", {
                  key: path,
                  "data-testid": "message-attachment-chip",
                  class: "text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full"
                }, toDisplayString(path.split("/").pop()), 1);
              }), 128))
            ])) : createCommentVNode("", true),
            createBaseVNode("p", _hoisted_5$l, toDisplayString(__props.msg.content), 1)
          ])
        ])) : (openBlock(), createElementBlock("div", _hoisted_6$j, [
          _cache[0] || (_cache[0] = createBaseVNode("div", { class: "w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center text-sm" }, " AI ", -1)),
          createBaseVNode("div", _hoisted_7$j, [
            createBaseVNode("div", _hoisted_8$j, [
              __props.msg.toolRuns?.length ? (openBlock(), createBlock(_sfc_main$q, {
                key: 0,
                runs: __props.msg.toolRuns
              }, null, 8, ["runs"])) : createCommentVNode("", true),
              createBaseVNode("div", {
                innerHTML: renderMarkdown(__props.msg.content)
              }, null, 8, _hoisted_9$e)
            ]),
            __props.msg.citations && __props.msg.citations.length ? (openBlock(), createElementBlock("div", _hoisted_10$d, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(__props.msg.citations, (cite) => {
                return openBlock(), createElementBlock("span", {
                  key: cite,
                  class: "text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                }, toDisplayString(cite), 1);
              }), 128))
            ])) : createCommentVNode("", true)
          ])
        ]))
      ]);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const ChatMessage = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["__scopeId", "data-v-95274e91"]]);
function useSubmitOnEnter(onSubmit) {
  const composing = /* @__PURE__ */ ref(false);
  function onCompositionStart2() {
    composing.value = true;
  }
  function onCompositionEnd2() {
    composing.value = false;
  }
  function onEnterKeydown(e) {
    if (e.isComposing || composing.value) return;
    e.preventDefault();
    onSubmit();
  }
  return { composing, onCompositionStart: onCompositionStart2, onCompositionEnd: onCompositionEnd2, onEnterKeydown };
}
function useTextareaHistoryKeydown({
  composing,
  text,
  undo,
  redo,
  onResize
}) {
  function onHistoryKeydown(e) {
    if (e.isComposing || composing.value) return;
    const key = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (key === "z" && !e.shiftKey) {
      const prev = undo();
      if (prev !== null) {
        e.preventDefault();
        text.value = prev;
        if (onResize) void nextTick(onResize);
      }
      return;
    }
    if (key === "y" || key === "z" && e.shiftKey) {
      const next = redo();
      if (next !== null) {
        e.preventDefault();
        text.value = next;
        if (onResize) void nextTick(onResize);
      }
    }
  }
  return { onHistoryKeydown };
}
function useTextareaUndo(options = {}) {
  const maxHistory = options.maxHistory ?? 100;
  const history = /* @__PURE__ */ ref([""]);
  const index = /* @__PURE__ */ ref(0);
  let applying = false;
  function record(value) {
    if (applying) return;
    if (history.value[index.value] === value) return;
    const next = history.value.slice(0, index.value + 1);
    next.push(value);
    if (next.length > maxHistory) next.shift();
    history.value = next;
    index.value = next.length - 1;
  }
  function undo() {
    if (index.value <= 0) return null;
    applying = true;
    index.value -= 1;
    const value = history.value[index.value] ?? "";
    applying = false;
    return value;
  }
  function redo() {
    if (index.value >= history.value.length - 1) return null;
    applying = true;
    index.value += 1;
    const value = history.value[index.value] ?? "";
    applying = false;
    return value;
  }
  function reset(value = "") {
    history.value = [value];
    index.value = 0;
  }
  return { record, undo, redo, reset };
}
const _hoisted_1$n = { class: "flex-1 flex flex-col gap-2" };
const _hoisted_2$n = {
  key: 0,
  class: "flex flex-wrap gap-2"
};
const _hoisted_3$n = ["disabled", "onClick"];
const _hoisted_4$l = ["disabled"];
const _hoisted_5$k = ["disabled"];
const _sfc_main$o = /* @__PURE__ */ defineComponent({
  __name: "ChatInput",
  props: {
    loading: { type: Boolean },
    disabled: { type: Boolean }
  },
  emits: ["send"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const text = /* @__PURE__ */ ref("");
    const textareaRef = /* @__PURE__ */ ref(null);
    const attachments = /* @__PURE__ */ ref([]);
    const { record, undo, redo } = useTextareaUndo();
    function addAttachment(item) {
      if (attachments.value.some((a) => a.path === item.path)) return;
      attachments.value.push(item);
    }
    function removeAttachment(path) {
      attachments.value = attachments.value.filter((a) => a.path !== path);
    }
    __expose({ addAttachment });
    function resizeTextarea(el) {
      const target = el ?? textareaRef.value;
      if (!target) return;
      target.style.height = "auto";
      target.style.height = target.scrollHeight + "px";
    }
    function onInput(e) {
      const el = e.target;
      record(el.value);
      resizeTextarea(el);
    }
    function send() {
      const trimmed = text.value.trim();
      if (!trimmed && !attachments.value.length || props.loading) return;
      emit2("send", { text: trimmed, attachments: [...attachments.value] });
      text.value = "";
      record("");
      attachments.value = [];
    }
    const { composing, onCompositionStart: onCompositionStart2, onCompositionEnd: onCompositionEnd2, onEnterKeydown } = useSubmitOnEnter(send);
    const { onHistoryKeydown } = useTextareaHistoryKeydown({
      composing,
      text,
      undo,
      redo,
      onResize: () => resizeTextarea()
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("form", {
        class: "flex items-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
        onSubmit: withModifiers(send, ["prevent"])
      }, [
        createBaseVNode("div", _hoisted_1$n, [
          attachments.value.length ? (openBlock(), createElementBlock("div", _hoisted_2$n, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(attachments.value, (attachment) => {
              return openBlock(), createElementBlock("span", {
                key: attachment.path,
                "data-testid": "chat-attachment-chip",
                class: "inline-flex items-center gap-1 px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }, [
                createTextVNode(toDisplayString(attachment.label) + " ", 1),
                createBaseVNode("button", {
                  type: "button",
                  class: "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                  disabled: props.loading || props.disabled,
                  onClick: ($event) => removeAttachment(attachment.path)
                }, " × ", 8, _hoisted_3$n)
              ]);
            }), 128))
          ])) : createCommentVNode("", true),
          withDirectives(createBaseVNode("textarea", {
            ref_key: "textareaRef",
            ref: textareaRef,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => text.value = $event),
            class: "input-field resize-none min-h-[44px]",
            rows: "1",
            placeholder: "Type a message...",
            disabled: props.loading || props.disabled,
            onCompositionstart: _cache[1] || (_cache[1] = //@ts-ignore
            (...args) => unref(onCompositionStart2) && unref(onCompositionStart2)(...args)),
            onCompositionend: _cache[2] || (_cache[2] = //@ts-ignore
            (...args) => unref(onCompositionEnd2) && unref(onCompositionEnd2)(...args)),
            onKeydown: [
              _cache[3] || (_cache[3] = //@ts-ignore
              (...args) => unref(onHistoryKeydown) && unref(onHistoryKeydown)(...args)),
              _cache[4] || (_cache[4] = withKeys(withModifiers(
                //@ts-ignore
                (...args) => unref(onEnterKeydown) && unref(onEnterKeydown)(...args),
                ["exact"]
              ), ["enter"]))
            ],
            onInput
          }, null, 40, _hoisted_4$l), [
            [vModelText, text.value]
          ])
        ]),
        createBaseVNode("button", {
          type: "submit",
          class: "btn-primary flex-shrink-0",
          disabled: !text.value.trim() && !attachments.value.length || props.loading || props.disabled
        }, toDisplayString(props.loading ? "..." : "Send"), 9, _hoisted_5$k)
      ], 32);
    };
  }
});
function resolveCallId(event, existing) {
  if (event.call_id) return event.call_id;
  const base = event.name ?? "tool";
  let n = existing.length;
  let id = `${base}-${n}`;
  while (existing?.some((r) => r.callId === id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}
function upsertToolStart(runs, event) {
  if (!event || typeof event !== "object") return runs;
  const runsArr = runs ?? [];
  const callId = resolveCallId(event, runsArr);
  const name = event.name ?? "unknown";
  const idx = runsArr.findIndex((r) => r.callId === callId);
  if (idx >= 0) {
    const next = [...runsArr];
    next[idx] = { ...next[idx], callId, name, status: "running" };
    return next;
  }
  return [...runsArr, { callId, name, status: "running" }];
}
function applyToolEnd(runs, event) {
  if (!event || typeof event !== "object") return runs;
  const runsArr = runs ?? [];
  const callId = event.call_id ?? runsArr.find((r) => r.name === event.name && r.status === "running")?.callId;
  if (!callId) return runsArr;
  const next = [...runsArr];
  const idx = next.findIndex((r) => r.callId === callId);
  if (idx < 0) return runsArr;
  next[idx] = {
    ...next[idx],
    status: event.ok === false ? "error" : "done",
    output: event.output
  };
  return next;
}
async function* parseSseStream(body) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let currentEvent = "message";
  console.log("parseSseStream", body);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
        continue;
      }
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (currentEvent === "done") {
          yield { type: "done" };
        } else if (currentEvent === "tool_start") {
          yield { type: "tool_start", event: data };
        } else if (currentEvent === "tool_end") {
          yield { type: "tool_end", event: data };
        } else {
          yield { type: "message", chunk: data };
        }
      } catch {
        console.error("parseSseStream", line);
      }
    }
  }
}
const _hoisted_1$m = { class: "relative border-t border-gray-200 bg-white" };
const _hoisted_2$m = {
  key: 0,
  class: "flex flex-wrap gap-1 px-4 pt-2"
};
const _hoisted_3$m = ["onClick"];
const _hoisted_4$k = {
  key: 1,
  class: "absolute bottom-full left-4 right-4 mb-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg z-10"
};
const _hoisted_5$j = ["onMousedown"];
const _hoisted_6$i = { class: "text-sm font-medium text-gray-800" };
const _hoisted_7$i = { class: "text-[10px] text-gray-500 truncate" };
const _hoisted_8$i = ["disabled"];
const _hoisted_9$d = ["disabled"];
const _sfc_main$n = /* @__PURE__ */ defineComponent({
  __name: "ChatInputWithSlash",
  props: {
    loading: { type: Boolean },
    skills: {},
    selectedSkills: {}
  },
  emits: ["send", "toggle-skill", "remove-skill"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const text = /* @__PURE__ */ ref("");
    const textareaRef = /* @__PURE__ */ ref(null);
    const showSlashMenu = /* @__PURE__ */ ref(false);
    const slashFilter = /* @__PURE__ */ ref("");
    const { record, undo, redo } = useTextareaUndo();
    const filteredSkills = computed(() => {
      const q2 = slashFilter.value.toLowerCase();
      if (!q2) return props.skills;
      return props.skills.filter(
        (s) => s.name.toLowerCase().includes(q2) || s.description.toLowerCase().includes(q2)
      );
    });
    function resizeTextarea(el) {
      const target = el ?? textareaRef.value;
      if (!target) return;
      target.style.height = "auto";
      target.style.height = target.scrollHeight + "px";
    }
    function onInput(e) {
      const el = e.target;
      record(el.value);
      resizeTextarea(el);
      const value = text.value;
      const slashIdx = value.lastIndexOf("/");
      if (slashIdx >= 0 && (slashIdx === 0 || value[slashIdx - 1] === " " || value[slashIdx - 1] === "\n")) {
        const query = value.slice(slashIdx + 1);
        if (!query.includes(" ")) {
          showSlashMenu.value = true;
          slashFilter.value = query;
          return;
        }
      }
      showSlashMenu.value = false;
      slashFilter.value = "";
    }
    function pickSkill(name) {
      emit2("toggle-skill", name);
      const value = text.value;
      const slashIdx = value.lastIndexOf("/");
      if (slashIdx >= 0) {
        text.value = value.slice(0, slashIdx).trimEnd();
        record(text.value);
      }
      showSlashMenu.value = false;
      slashFilter.value = "";
    }
    function send() {
      const trimmed = text.value.trim();
      if (!trimmed || props.loading) return;
      emit2("send", trimmed);
      text.value = "";
      record("");
      showSlashMenu.value = false;
    }
    const { composing, onCompositionStart: onCompositionStart2, onCompositionEnd: onCompositionEnd2, onEnterKeydown } = useSubmitOnEnter(send);
    const { onHistoryKeydown } = useTextareaHistoryKeydown({
      composing,
      text,
      undo,
      redo,
      onResize: () => resizeTextarea()
    });
    watch(
      () => props.loading,
      (isLoading) => {
        if (!isLoading) showSlashMenu.value = false;
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$m, [
        __props.selectedSkills.length ? (openBlock(), createElementBlock("div", _hoisted_2$m, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.selectedSkills, (skill) => {
            return openBlock(), createElementBlock("span", {
              key: skill,
              class: "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800"
            }, [
              createTextVNode(toDisplayString(skill) + " ", 1),
              createBaseVNode("button", {
                type: "button",
                class: "hover:text-blue-950",
                onClick: ($event) => emit2("remove-skill", skill)
              }, "×", 8, _hoisted_3$m)
            ]);
          }), 128))
        ])) : createCommentVNode("", true),
        showSlashMenu.value && filteredSkills.value.length ? (openBlock(), createElementBlock("div", _hoisted_4$k, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(filteredSkills.value, (skill) => {
            return openBlock(), createElementBlock("button", {
              key: skill.name,
              type: "button",
              class: "w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0",
              onMousedown: withModifiers(($event) => pickSkill(skill.name), ["prevent"])
            }, [
              createBaseVNode("div", _hoisted_6$i, "/" + toDisplayString(skill.name), 1),
              createBaseVNode("div", _hoisted_7$i, toDisplayString(skill.description), 1)
            ], 40, _hoisted_5$j);
          }), 128))
        ])) : createCommentVNode("", true),
        createBaseVNode("form", {
          class: "flex items-end gap-3 p-4",
          onSubmit: withModifiers(send, ["prevent"])
        }, [
          withDirectives(createBaseVNode("textarea", {
            ref_key: "textareaRef",
            ref: textareaRef,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => text.value = $event),
            class: "input-field resize-none min-h-[44px] flex-1",
            rows: "1",
            placeholder: "Type a message… (/ for skills)",
            disabled: __props.loading,
            onCompositionstart: _cache[1] || (_cache[1] = //@ts-ignore
            (...args) => unref(onCompositionStart2) && unref(onCompositionStart2)(...args)),
            onCompositionend: _cache[2] || (_cache[2] = //@ts-ignore
            (...args) => unref(onCompositionEnd2) && unref(onCompositionEnd2)(...args)),
            onKeydown: [
              _cache[3] || (_cache[3] = //@ts-ignore
              (...args) => unref(onHistoryKeydown) && unref(onHistoryKeydown)(...args)),
              _cache[4] || (_cache[4] = withKeys(withModifiers(
                //@ts-ignore
                (...args) => unref(onEnterKeydown) && unref(onEnterKeydown)(...args),
                ["exact"]
              ), ["enter"]))
            ],
            onInput
          }, null, 40, _hoisted_8$i), [
            [vModelText, text.value]
          ]),
          createBaseVNode("button", {
            type: "submit",
            class: "btn-primary flex-shrink-0",
            disabled: !text.value.trim() || __props.loading
          }, toDisplayString(__props.loading ? "..." : "Send"), 9, _hoisted_9$d)
        ], 32)
      ]);
    };
  }
});
const _hoisted_1$l = { class: "flex items-center gap-1 border-b border-gray-200 p-2" };
const _hoisted_2$l = { class: "flex-1 overflow-y-auto" };
const _hoisted_3$l = ["data-testid", "onClick"];
const _sfc_main$m = /* @__PURE__ */ defineComponent({
  __name: "ChatThreadSidebar",
  props: {
    threads: {},
    activeId: {},
    collapsed: { type: Boolean }
  },
  emits: ["update:collapsed", "select", "create"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    function toggleCollapsed() {
      emit2("update:collapsed", !props.collapsed);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("aside", {
        class: normalizeClass(["flex flex-col shrink-0 border-r border-gray-200 bg-gray-50 transition-[width]", __props.collapsed ? "w-7" : "w-40"]),
        "data-testid": "chat-thread-sidebar"
      }, [
        __props.collapsed ? (openBlock(), createElementBlock("button", {
          key: 0,
          type: "button",
          class: "flex flex-1 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700",
          "aria-label": "Expand thread list",
          "data-testid": "chat-thread-toggle",
          onClick: toggleCollapsed
        }, " ▶ ")) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createBaseVNode("div", _hoisted_1$l, [
            createBaseVNode("button", {
              type: "button",
              class: "shrink-0 px-1 text-gray-500 hover:text-gray-700",
              "aria-label": "Collapse thread list",
              "data-testid": "chat-thread-toggle",
              onClick: toggleCollapsed
            }, " ◀ "),
            createBaseVNode("button", {
              type: "button",
              class: "min-w-0 flex-1 truncate rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-50",
              "data-testid": "chat-thread-create",
              onClick: _cache[0] || (_cache[0] = ($event) => emit2("create"))
            }, " + New ")
          ]),
          createBaseVNode("div", _hoisted_2$l, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.threads, (thread) => {
              return openBlock(), createElementBlock("button", {
                key: thread.id,
                type: "button",
                class: normalizeClass(["w-full truncate px-3 py-2 text-left text-sm hover:bg-gray-100", __props.activeId === thread.id ? "bg-blue-50 text-blue-700" : ""]),
                "data-testid": `chat-thread-item-${thread.id}`,
                onClick: ($event) => emit2("select", thread.id)
              }, toDisplayString(thread.title), 11, _hoisted_3$l);
            }), 128))
          ])
        ], 64))
      ], 2);
    };
  }
});
const _hoisted_1$k = { class: "my-3 rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3" };
const _hoisted_2$k = { class: "text-xs whitespace-pre-wrap text-gray-800 max-h-48 overflow-y-auto" };
const _hoisted_3$k = { class: "flex flex-wrap gap-2" };
const _sfc_main$l = /* @__PURE__ */ defineComponent({
  __name: "PlanApprovalCard",
  props: {
    planContent: {}
  },
  emits: ["approve", "edit", "cancel"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$k, [
        _cache[3] || (_cache[3] = createBaseVNode("p", { class: "text-xs font-medium text-blue-800 uppercase tracking-wide" }, "Plan ready for review", -1)),
        createBaseVNode("pre", _hoisted_2$k, toDisplayString(__props.planContent), 1),
        createBaseVNode("div", _hoisted_3$k, [
          createBaseVNode("button", {
            type: "button",
            class: "btn-primary text-xs py-1 px-3",
            onClick: _cache[0] || (_cache[0] = ($event) => emit2("approve"))
          }, " Approve & Run in Agent "),
          createBaseVNode("button", {
            type: "button",
            class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-white",
            onClick: _cache[1] || (_cache[1] = ($event) => emit2("edit"))
          }, " Edit "),
          createBaseVNode("button", {
            type: "button",
            class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-white",
            onClick: _cache[2] || (_cache[2] = ($event) => emit2("cancel"))
          }, " Cancel ")
        ])
      ]);
    };
  }
});
const _hoisted_1$j = { class: "text-xs text-gray-700" };
const _hoisted_2$j = {
  key: 0,
  class: "grid grid-cols-1 gap-2 md:grid-cols-2"
};
const _hoisted_3$j = { class: "text-[10px] whitespace-pre-wrap text-gray-700 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded p-2" };
const _hoisted_4$j = { class: "text-[10px] whitespace-pre-wrap text-gray-700 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded p-2" };
const _hoisted_5$i = {
  key: 1,
  class: "text-[10px] text-gray-600"
};
const _hoisted_6$h = { class: "grid grid-cols-1 gap-2 mt-2 md:grid-cols-2" };
const _hoisted_7$h = { class: "whitespace-pre-wrap text-gray-700 max-h-24 overflow-y-auto bg-white border border-gray-200 rounded p-2" };
const _hoisted_8$h = { class: "whitespace-pre-wrap text-gray-700 max-h-24 overflow-y-auto bg-white border border-gray-200 rounded p-2" };
const _hoisted_9$c = { class: "flex flex-wrap gap-2" };
const _hoisted_10$c = ["disabled"];
const _hoisted_11$a = ["disabled"];
const _sfc_main$k = /* @__PURE__ */ defineComponent({
  __name: "WorkspaceApprovalCard",
  props: {
    summary: {},
    before: {},
    after: {},
    compact: { type: Boolean, default: false },
    approving: { type: Boolean, default: false }
  },
  emits: ["approve", "cancel"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    function formatJson(def2) {
      if (!def2) return "(empty)";
      return JSON.stringify(def2, null, 2);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(["rounded-lg border border-amber-200 bg-amber-50 space-y-3", __props.compact ? "px-4 py-3" : "my-3 p-4"])
      }, [
        _cache[5] || (_cache[5] = createBaseVNode("p", { class: "text-xs font-medium text-amber-900 uppercase tracking-wide" }, " Workspace change pending approval ", -1)),
        createBaseVNode("p", _hoisted_1$j, toDisplayString(__props.summary), 1),
        !__props.compact ? (openBlock(), createElementBlock("div", _hoisted_2$j, [
          createBaseVNode("div", null, [
            _cache[2] || (_cache[2] = createBaseVNode("p", { class: "text-[10px] font-medium text-gray-500 mb-1" }, "Before", -1)),
            createBaseVNode("pre", _hoisted_3$j, toDisplayString(formatJson(__props.before)), 1)
          ]),
          createBaseVNode("div", null, [
            _cache[3] || (_cache[3] = createBaseVNode("p", { class: "text-[10px] font-medium text-gray-500 mb-1" }, "After", -1)),
            createBaseVNode("pre", _hoisted_4$j, toDisplayString(formatJson(__props.after)), 1)
          ])
        ])) : (openBlock(), createElementBlock("details", _hoisted_5$i, [
          _cache[4] || (_cache[4] = createBaseVNode("summary", { class: "cursor-pointer select-none hover:text-gray-800" }, "View diff", -1)),
          createBaseVNode("div", _hoisted_6$h, [
            createBaseVNode("pre", _hoisted_7$h, toDisplayString(formatJson(__props.before)), 1),
            createBaseVNode("pre", _hoisted_8$h, toDisplayString(formatJson(__props.after)), 1)
          ])
        ])),
        createBaseVNode("div", _hoisted_9$c, [
          createBaseVNode("button", {
            type: "button",
            class: "btn-primary text-xs py-1 px-3 disabled:opacity-50",
            disabled: __props.approving,
            onClick: _cache[0] || (_cache[0] = ($event) => emit2("approve"))
          }, toDisplayString(__props.approving ? "Applying…" : "Confirm & Apply"), 9, _hoisted_10$c),
          createBaseVNode("button", {
            type: "button",
            class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50",
            disabled: __props.approving,
            onClick: _cache[1] || (_cache[1] = ($event) => emit2("cancel"))
          }, " Cancel ", 8, _hoisted_11$a)
        ])
      ], 2);
    };
  }
});
async function apiBase$5() {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}
function useLocalChat() {
  async function* streamChatEvents(threadId, message, options) {
    const res = await fetch(`${await apiBase$5()}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        message,
        mode: options.mode,
        skills: options.skills?.length ? options.skills : void 0
      })
    });
    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let currentEvent = "message";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
          continue;
        }
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (currentEvent === "plan_ready") {
            yield { type: "plan_ready", content: String(data.content ?? "") };
          } else if (currentEvent === "done") {
            yield { type: "done" };
          } else if (currentEvent === "tool_start") {
            yield { type: "tool_start", event: data };
          } else if (currentEvent === "tool_end") {
            yield { type: "tool_end", event: data };
          } else {
            yield { type: "message", chunk: data };
          }
        } catch {
        }
      }
    }
  }
  async function* streamChat(threadId, message, options = { mode: "agent" }) {
    for await (const event of streamChatEvents(threadId, message, options)) {
      if (event.type === "message") {
        yield event.chunk;
      }
    }
  }
  async function fetchSkillCatalog() {
    const res = await fetch(`${await apiBase$5()}/v1/skills?detailed=1`);
    if (!res.ok) throw new Error(`Skills fetch failed: ${res.status}`);
    return res.json();
  }
  return { streamChat, streamChatEvents, fetchSkillCatalog };
}
async function apiBase$4() {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}
function resolveScopeRef(v2) {
  const val = unref(v2);
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed || null;
}
function buildScopeQuery(scope) {
  if (scope.kind === "app") return "scope=app";
  if (scope.kind === "free") {
    const workflowId2 = resolveScopeRef(scope.workflowId);
    if (!workflowId2) return null;
    return `scope=free&workflowId=${encodeURIComponent(workflowId2)}`;
  }
  const workflowId = resolveScopeRef(scope.workflowId);
  const stepId = resolveScopeRef(scope.stepId);
  if (!workflowId || !stepId) return null;
  return `scope=step&workflowId=${encodeURIComponent(workflowId)}&stepId=${encodeURIComponent(stepId)}`;
}
function buildCreateBody(scope, title, extra) {
  if (scope.kind === "app") {
    const body2 = { scope: "app" };
    if (title !== void 0) body2.title = title;
    if (extra?.mode) body2.mode = extra.mode;
    if (extra?.skills?.length) body2.skills = extra.skills;
    return body2;
  }
  if (scope.kind === "free") {
    const workflowId2 = resolveScopeRef(scope.workflowId);
    if (!workflowId2) return null;
    const body2 = { scope: "free", workflowId: workflowId2 };
    if (title !== void 0) body2.title = title;
    return body2;
  }
  const workflowId = resolveScopeRef(scope.workflowId);
  const stepId = resolveScopeRef(scope.stepId);
  if (!workflowId || !stepId) return null;
  const body = { scope: "step", workflowId, stepId };
  if (title !== void 0) body.title = title;
  return body;
}
function scopeWatchKey(scope) {
  if (scope.kind === "app") return "app";
  if (scope.kind === "free") {
    return `free:${resolveScopeRef(scope.workflowId) ?? ""}`;
  }
  return `step:${resolveScopeRef(scope.workflowId) ?? ""}:${resolveScopeRef(scope.stepId) ?? ""}`;
}
function useChatMemory(scope) {
  const threads = /* @__PURE__ */ ref([]);
  const activeThreadId = /* @__PURE__ */ ref(null);
  const messages = /* @__PURE__ */ ref([]);
  const loading = /* @__PURE__ */ ref(false);
  const error = /* @__PURE__ */ ref(null);
  let persistTimer;
  async function loadThreads() {
    const query = buildScopeQuery(scope);
    if (!query) {
      threads.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${await apiBase$4()}/v1/chat-memory/threads?${query}`);
      if (!res.ok) throw new Error(`loadThreads failed: ${res.status}`);
      const loadedThreads = await res.json();
      threads.value = loadedThreads.map((t) => ({
        ...t,
        skills: t.skills ?? []
      }));
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  }
  async function createThread(title, extra) {
    const body = buildCreateBody(scope, title, extra);
    if (!body) throw new Error("invalid scope for createThread");
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${await apiBase$4()}/v1/chat-memory/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`createThread failed: ${res.status}`);
      const meta = await res.json();
      await loadThreads();
      await selectThread(meta.id);
      return meta.id;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function selectThread(id) {
    const query = buildScopeQuery(scope);
    if (!query) return null;
    activeThreadId.value = id;
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(
        `${await apiBase$4()}/v1/chat-memory/threads/${encodeURIComponent(id)}?${query}`
      );
      if (!res.ok) throw new Error(`selectThread failed: ${res.status}`);
      const data = await res.json();
      messages.value = data.messages;
      if (data.meta.skills == null) {
        data.meta.skills = [];
      }
      const idx = threads.value.findIndex((t) => t.id === id);
      if (idx >= 0) {
        threads.value[idx] = data.meta;
      }
      return data.meta;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      messages.value = [];
      return null;
    } finally {
      loading.value = false;
    }
  }
  async function persistMessages() {
    const id = activeThreadId.value;
    const query = buildScopeQuery(scope);
    if (!id || !query) return;
    const res = await fetch(
      `${await apiBase$4()}/v1/chat-memory/threads/${encodeURIComponent(id)}/messages?${query}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.value })
      }
    );
    if (!res.ok) throw new Error(`persistMessages failed: ${res.status}`);
  }
  function schedulePersist() {
    if (!activeThreadId.value) return;
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      void persistMessages().catch((err) => {
        error.value = err instanceof Error ? err.message : String(err);
      });
    }, 0);
  }
  async function updateThreadMeta(patch) {
    const id = activeThreadId.value;
    const query = buildScopeQuery(scope);
    if (!id || !query) return;
    error.value = null;
    try {
      const res = await fetch(
        `${await apiBase$4()}/v1/chat-memory/threads/${encodeURIComponent(id)}?${query}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        }
      );
      if (!res.ok) throw new Error(`updateThreadMeta failed: ${res.status}`);
      const meta = await res.json();
      if (meta.skills == null) {
        meta.skills = [];
      }
      const idx = threads.value.findIndex((t) => t.id === id);
      if (idx >= 0) threads.value[idx] = meta;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    }
  }
  async function updateTitle(id, title) {
    const query = buildScopeQuery(scope);
    if (!query) return;
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(
        `${await apiBase$4()}/v1/chat-memory/threads/${encodeURIComponent(id)}?${query}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.slice(0, 60) })
        }
      );
      if (!res.ok) throw new Error(`updateTitle failed: ${res.status}`);
      const meta = await res.json();
      if (meta.skills == null) {
        meta.skills = [];
      }
      const idx = threads.value.findIndex((t) => t.id === id);
      if (idx >= 0) threads.value[idx] = meta;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function removeThread(id) {
    const query = buildScopeQuery(scope);
    if (!query) return;
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(
        `${await apiBase$4()}/v1/chat-memory/threads/${encodeURIComponent(id)}?${query}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`removeThread failed: ${res.status}`);
      threads.value = threads.value.filter((t) => t.id !== id);
      if (activeThreadId.value === id) {
        activeThreadId.value = threads.value[0]?.id ?? null;
        messages.value = [];
        if (activeThreadId.value) {
          await selectThread(activeThreadId.value);
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }
  function ensureAssistantShell() {
    const last = messages.value[messages.value.length - 1];
    if (last?.role !== "assistant") {
      messages.value.push({ role: "assistant", content: "", toolRuns: [] });
    } else if (!last.toolRuns) {
      last.toolRuns = [];
    }
  }
  function addUserMessage(content, attachments) {
    messages.value.push({ role: "user", content, attachments });
    schedulePersist();
  }
  function applyToolStart(event) {
    if (!event || typeof event !== "object") return;
    ensureAssistantShell();
    const last = messages.value[messages.value.length - 1];
    last.toolRuns = upsertToolStart(last.toolRuns ?? [], event);
    schedulePersist();
  }
  function applyToolEnd$1(event) {
    if (!event || typeof event !== "object") return;
    ensureAssistantShell();
    const last = messages.value[messages.value.length - 1];
    last.toolRuns = applyToolEnd(last.toolRuns ?? [], event);
    schedulePersist();
  }
  function addAssistantChunk(content, citations) {
    ensureAssistantShell();
    const last = messages.value[messages.value.length - 1];
    last.content += content;
    if (citations) last.citations = citations;
    schedulePersist();
  }
  watch(
    () => scopeWatchKey(scope),
    () => {
      activeThreadId.value = null;
      messages.value = [];
      void loadThreads();
    },
    { immediate: true }
  );
  return {
    threads,
    activeThreadId,
    messages,
    loading,
    error,
    loadThreads,
    createThread,
    selectThread,
    persistMessages,
    updateTitle,
    updateThreadMeta,
    removeThread,
    addUserMessage,
    addAssistantChunk,
    applyToolStart,
    applyToolEnd: applyToolEnd$1
  };
}
const THREADS_KEY = "desktop:threads";
const META_PREFIX = "desktop:thread-meta:";
const MESSAGES_PREFIX = "messages:";
function readLocalThreads() {
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) => t && typeof t === "object" && typeof t.id === "string" && typeof t.title === "string"
    );
  } catch {
    return [];
  }
}
function readLocalMessages(threadId) {
  try {
    const raw = localStorage.getItem(`${MESSAGES_PREFIX}${threadId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function readLocalMeta(threadId) {
  try {
    const raw = localStorage.getItem(`${META_PREFIX}${threadId}`);
    if (!raw) return { mode: "agent", skills: [] };
    const parsed = JSON.parse(raw);
    const mode = parsed.mode === "ask" || parsed.mode === "plan" || parsed.mode === "agent" ? parsed.mode : "agent";
    const skills = Array.isArray(parsed.skills) ? parsed.skills.filter((s) => typeof s === "string") : [];
    return { mode, skills };
  } catch {
    return { mode: "agent", skills: [] };
  }
}
function clearLocalChatStorage() {
  localStorage.removeItem(THREADS_KEY);
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith(MESSAGES_PREFIX) || key.startsWith(META_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}
async function saveMessagesForThread(apiBase2, threadId, messages) {
  const res = await fetch(
    `${apiBase2}/v1/chat-memory/threads/${encodeURIComponent(threadId)}/messages?scope=app`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    }
  );
  if (!res.ok) {
    throw new Error(`migrate saveMessages failed: ${res.status}`);
  }
}
async function migrateLocalChatIfNeeded(deps) {
  await deps.loadThreads();
  if (deps.getServerThreadCount() > 0) return false;
  const localThreads = readLocalThreads();
  if (localThreads.length === 0) return false;
  const apiBase2 = await deps.fetchApiBase();
  for (const local of localThreads) {
    const meta = readLocalMeta(local.id);
    const messages = readLocalMessages(local.id);
    const threadId = await deps.createThread(local.title, {
      mode: meta.mode,
      skills: meta.skills.length ? meta.skills : void 0
    });
    if (messages.length > 0) {
      await saveMessagesForThread(apiBase2, threadId, messages);
    }
  }
  clearLocalChatStorage();
  await deps.loadThreads();
  return true;
}
async function apiBase$3() {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}
async function apiJson$2(path, init) {
  const res = await fetch(`${await apiBase$3()}${path}`, init);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${path} failed (${res.status}): ${detail}`);
  }
  return res.json();
}
function useWorkspaceConfig() {
  async function fetchWorkspace(workflowId, stepId) {
    return apiJson$2(
      `/v1/workflows/${encodeURIComponent(workflowId)}/workspaces/${encodeURIComponent(stepId)}`
    );
  }
  async function saveWorkspace(workflowId, stepId, definition) {
    return apiJson$2(
      `/v1/workflows/${encodeURIComponent(workflowId)}/workspaces/${encodeURIComponent(stepId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(definition)
      }
    );
  }
  async function fetchRegistry() {
    return apiJson$2("/v1/workspace/registry");
  }
  async function listWorkspaces(workflowId) {
    return apiJson$2(`/v1/workflows/${encodeURIComponent(workflowId)}/workspaces`);
  }
  return {
    fetchWorkspace,
    saveWorkspace,
    fetchRegistry,
    listWorkspaces
  };
}
const WORKSPACE_PENDING_PREFIX = "WORKSPACE_PENDING_APPROVAL\n";
function parsePendingWorkspaceApproval(output) {
  if (!output.startsWith(WORKSPACE_PENDING_PREFIX)) return null;
  try {
    const parsed = JSON.parse(output.slice(WORKSPACE_PENDING_PREFIX.length));
    if (!parsed.workflowId || !parsed.stepId || !parsed.after) return null;
    return parsed;
  } catch {
    return null;
  }
}
function useWorkspaceApproval(onApplied) {
  const { saveWorkspace } = useWorkspaceConfig();
  const pending = /* @__PURE__ */ ref(null);
  const approvalError = /* @__PURE__ */ ref(null);
  const approving = /* @__PURE__ */ ref(false);
  function handleToolEndOutput(output) {
    if (!output) return;
    const parsed = parsePendingWorkspaceApproval(output);
    if (parsed) {
      pending.value = parsed;
      approvalError.value = null;
    }
  }
  async function approvePending() {
    const item = pending.value;
    if (!item) return;
    approving.value = true;
    approvalError.value = null;
    try {
      await saveWorkspace(item.workflowId, item.stepId, item.after);
      pending.value = null;
      onApplied?.(item.workflowId, item.stepId);
    } catch (err) {
      approvalError.value = err instanceof Error ? err.message : String(err);
    } finally {
      approving.value = false;
    }
  }
  function cancelPending() {
    pending.value = null;
    approvalError.value = null;
  }
  return {
    pending,
    approvalError,
    approving,
    handleToolEndOutput,
    approvePending,
    cancelPending
  };
}
function toggleThreadSkill(meta, skillName) {
  const skillsArr = meta.skills ?? [];
  const skills = skillsArr.includes(skillName) ? skillsArr.filter((s) => s !== skillName) : [...skillsArr, skillName];
  return { ...meta, skills };
}
function removeThreadSkill(meta, skillName) {
  const skillsArr = meta.skills ?? [];
  return { ...meta, skills: skillsArr.filter((s) => s !== skillName) };
}
const _hoisted_1$i = { class: "flex flex-1 min-h-0" };
const _hoisted_2$i = { class: "flex flex-col shrink-0 min-h-0" };
const _hoisted_3$i = ["title"];
const _hoisted_4$i = { class: "flex-1 flex flex-col min-w-0" };
const _hoisted_5$h = { class: "flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white" };
const _hoisted_6$g = ["onClick"];
const _hoisted_7$g = { class: "ml-auto text-[10px] text-gray-400" };
const _hoisted_8$g = { class: "flex-1 overflow-y-auto p-6" };
const _hoisted_9$b = {
  key: 0,
  class: "shrink-0 px-6 py-3 border-t border-amber-100 bg-white space-y-1"
};
const _hoisted_10$b = {
  key: 0,
  class: "text-xs text-red-600"
};
const _sfc_main$j = /* @__PURE__ */ defineComponent({
  __name: "Chat",
  props: {
    "workspace": { required: true },
    "workspaceModifiers": {}
  },
  emits: ["update:workspace"],
  setup(__props) {
    const MODES = [
      { id: "ask", label: "Ask" },
      { id: "plan", label: "Plan" },
      { id: "agent", label: "Agent" }
    ];
    const chatMemory = useChatMemory({ kind: "app" });
    const {
      threads,
      activeThreadId,
      messages,
      loadThreads,
      createThread,
      selectThread,
      updateTitle,
      updateThreadMeta,
      addUserMessage,
      addAssistantChunk,
      applyToolStart,
      applyToolEnd: applyToolEnd2
    } = chatMemory;
    const { streamChatEvents, fetchSkillCatalog } = useLocalChat();
    const {
      pending: pendingWorkspaceApproval,
      approvalError: workspaceApprovalError,
      approving: workspaceApproving,
      handleToolEndOutput,
      approvePending: onApproveWorkspaceChange,
      cancelPending: onCancelWorkspaceChange
    } = useWorkspaceApproval();
    const skillCatalog = /* @__PURE__ */ ref([]);
    const threadMeta = /* @__PURE__ */ ref({ mode: "agent", skills: [] });
    const normalizedSelectedSkills = computed(() => threadMeta.value.skills ?? []);
    const sidebarCollapsed = /* @__PURE__ */ ref(false);
    const pendingPlan = /* @__PURE__ */ ref(null);
    const loading = /* @__PURE__ */ ref(false);
    let syncingMeta = false;
    const workspace = useModel(__props, "workspace");
    void fetchSkillCatalog().then((skills) => {
      skillCatalog.value = skills;
    }).catch(() => {
      skillCatalog.value = [];
    });
    function applyThreadMeta(mode, skills) {
      syncingMeta = true;
      threadMeta.value = {
        mode: mode ?? "agent",
        skills: skills ?? []
      };
      syncingMeta = false;
    }
    function activeCheckpointThreadId() {
      const id = activeThreadId.value;
      if (!id) return null;
      return threads.value.find((t) => t.id === id)?.checkpointThreadId ?? null;
    }
    async function ensureActiveThread() {
      if (activeThreadId.value) return;
      if (threads.value.length > 0) {
        const meta = await selectThread(threads.value[0].id);
        if (meta) applyThreadMeta(meta.mode, meta.skills);
        return;
      }
      const id = await createThread("New Chat");
      const thread = threads.value.find((t) => t.id === id);
      applyThreadMeta(thread?.mode, thread?.skills);
    }
    onMounted(async () => {
      await migrateLocalChatIfNeeded({
        fetchApiBase: async () => {
          const port = await window.desktop.getSidecarPort();
          return `http://127.0.0.1:${port}`;
        },
        loadThreads,
        getServerThreadCount: () => threads.value.length,
        createThread
      });
      await loadThreads();
      await ensureActiveThread();
    });
    watch(
      threadMeta,
      (meta) => {
        if (syncingMeta || !activeThreadId.value) return;
        void updateThreadMeta({ mode: meta.mode, skills: meta.skills }).catch(() => {
        });
      },
      { deep: true }
    );
    async function onSelectThread(id) {
      const meta = await selectThread(id);
      if (meta) applyThreadMeta(meta.mode, meta.skills);
      pendingPlan.value = null;
    }
    async function onNewChat() {
      const id = await createThread("New Chat");
      const thread = threads.value.find((t) => t.id === id);
      applyThreadMeta(thread?.mode, thread?.skills);
      pendingPlan.value = null;
    }
    function setMode(mode) {
      threadMeta.value = { ...threadMeta.value, mode };
      pendingPlan.value = null;
    }
    function onToggleSkill(name) {
      threadMeta.value = toggleThreadSkill(threadMeta.value, name);
    }
    function onRemoveSkill(name) {
      threadMeta.value = removeThreadSkill(threadMeta.value, name);
    }
    async function onSend(text) {
      let threadId = activeThreadId.value;
      if (!threadId) {
        threadId = await createThread("New Chat");
        const thread = threads.value.find((t) => t.id === threadId);
        applyThreadMeta(thread?.mode, thread?.skills);
      }
      const checkpointThreadId = activeCheckpointThreadId();
      if (!checkpointThreadId) return;
      addUserMessage(text);
      const lastUser = messages.value[messages.value.length - 1];
      if (lastUser?.role === "user") {
        await updateTitle(threadId, text);
      }
      loading.value = true;
      pendingPlan.value = null;
      try {
        for await (const event of streamChatEvents(checkpointThreadId, text, {
          mode: threadMeta.value.mode,
          skills: threadMeta.value.skills
        })) {
          if (event.type === "message") {
            if (event.chunk.content) {
              addAssistantChunk(event.chunk.content, event.chunk.citations);
            }
          } else if (event.type === "plan_ready") {
            pendingPlan.value = event.content;
          } else if (threadMeta.value.mode === "agent" && event.type === "tool_start") {
            applyToolStart(event.event);
          } else if (threadMeta.value.mode === "agent" && event.type === "tool_end") {
            applyToolEnd2(event.event);
            handleToolEndOutput(event.event.output);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        addAssistantChunk(`Error: ${message}`);
      } finally {
        loading.value = false;
      }
    }
    async function onApprovePlan() {
      if (!pendingPlan.value) return;
      const plan = pendingPlan.value;
      pendingPlan.value = null;
      threadMeta.value = { ...threadMeta.value, mode: "agent" };
      await onSend(
        `Execute the following approved plan step by step. Confirm before destructive changes.

${plan}`
      );
    }
    function onEditPlan() {
      pendingPlan.value = null;
    }
    function onCancelPlan() {
      pendingPlan.value = null;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$i, [
        createBaseVNode("div", _hoisted_2$i, [
          createVNode(_sfc_main$m, {
            class: "flex-1 min-h-0",
            threads: unref(threads),
            "active-id": unref(activeThreadId),
            collapsed: sidebarCollapsed.value,
            "onUpdate:collapsed": _cache[0] || (_cache[0] = ($event) => sidebarCollapsed.value = $event),
            onSelect: onSelectThread,
            onCreate: onNewChat
          }, null, 8, ["threads", "active-id", "collapsed"]),
          createBaseVNode("p", {
            class: "p-2 text-xs text-gray-400 truncate border-t border-gray-200 bg-gray-50",
            title: workspace.value
          }, toDisplayString(workspace.value), 9, _hoisted_3$i)
        ]),
        createBaseVNode("main", _hoisted_4$i, [
          createBaseVNode("div", _hoisted_5$h, [
            (openBlock(), createElementBlock(Fragment, null, renderList(MODES, (m2) => {
              return createBaseVNode("button", {
                key: m2.id,
                type: "button",
                class: normalizeClass([
                  "text-xs px-3 py-1 rounded-full border transition-colors",
                  threadMeta.value.mode === m2.id ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                ]),
                onClick: ($event) => setMode(m2.id)
              }, toDisplayString(m2.label), 11, _hoisted_6$g);
            }), 64)),
            createBaseVNode("span", _hoisted_7$g, toDisplayString(threadMeta.value.mode === "ask" ? "No tools" : threadMeta.value.mode === "plan" ? "Read-only" : "Full agent"), 1)
          ]),
          createBaseVNode("div", _hoisted_8$g, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(messages), (msg, i) => {
              return openBlock(), createBlock(unref(ChatMessage), {
                key: i,
                msg
              }, null, 8, ["msg"]);
            }), 128)),
            pendingPlan.value && threadMeta.value.mode === "plan" ? (openBlock(), createBlock(_sfc_main$l, {
              key: 0,
              "plan-content": pendingPlan.value,
              onApprove: onApprovePlan,
              onEdit: onEditPlan,
              onCancel: onCancelPlan
            }, null, 8, ["plan-content"])) : createCommentVNode("", true)
          ]),
          unref(pendingWorkspaceApproval) && threadMeta.value.mode === "agent" ? (openBlock(), createElementBlock("div", _hoisted_9$b, [
            createVNode(_sfc_main$k, {
              compact: "",
              summary: unref(pendingWorkspaceApproval).summary,
              before: unref(pendingWorkspaceApproval).before,
              after: unref(pendingWorkspaceApproval).after,
              approving: unref(workspaceApproving),
              onApprove: unref(onApproveWorkspaceChange),
              onCancel: unref(onCancelWorkspaceChange)
            }, null, 8, ["summary", "before", "after", "approving", "onApprove", "onCancel"]),
            unref(workspaceApprovalError) ? (openBlock(), createElementBlock("p", _hoisted_10$b, toDisplayString(unref(workspaceApprovalError)), 1)) : createCommentVNode("", true)
          ])) : createCommentVNode("", true),
          createVNode(_sfc_main$n, {
            loading: loading.value,
            skills: skillCatalog.value,
            "selected-skills": normalizedSelectedSkills.value,
            onSend,
            onToggleSkill,
            onRemoveSkill
          }, null, 8, ["loading", "skills", "selected-skills"])
        ])
      ]);
    };
  }
});
const _hoisted_1$h = { class: "w-60 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0" };
const _hoisted_2$h = { class: "p-3 border-b border-gray-200 flex items-center justify-between gap-2" };
const _hoisted_3$h = ["disabled"];
const _hoisted_4$h = {
  key: 0,
  class: "mx-3 mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5"
};
const _hoisted_5$g = {
  key: 0,
  class: "block mt-1 text-amber-900/80"
};
const _hoisted_6$f = {
  key: 1,
  class: "p-3 text-xs text-gray-500"
};
const _hoisted_7$f = {
  key: 2,
  class: "flex-1 overflow-y-auto"
};
const _hoisted_8$f = ["onClick"];
const _hoisted_9$a = { class: "flex items-start justify-between gap-2" };
const _hoisted_10$a = { class: "truncate font-medium text-gray-800" };
const _hoisted_11$9 = {
  key: 0,
  class: "text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 shrink-0"
};
const _hoisted_12$9 = {
  key: 0,
  class: "text-[10px] text-gray-400 mt-0.5 truncate"
};
const _hoisted_13$9 = {
  key: 0,
  class: "p-3 text-xs text-gray-400"
};
const _hoisted_14$8 = { class: "p-3 border-t border-gray-200" };
const _hoisted_15$8 = ["disabled"];
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "LangflowFlowSidebar",
  props: {
    flows: {},
    selectedId: {},
    activeFlowId: {},
    loading: { type: Boolean },
    offline: { type: Boolean },
    offlineDetail: {}
  },
  emits: ["select", "refresh", "create"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    function formatUpdated(iso) {
      if (!iso) return "";
      const d2 = new Date(iso);
      if (Number.isNaN(d2.getTime())) return "";
      return d2.toLocaleString();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("aside", _hoisted_1$h, [
        createBaseVNode("div", _hoisted_2$h, [
          _cache[2] || (_cache[2] = createBaseVNode("p", { class: "text-xs font-medium text-gray-500 uppercase tracking-wide" }, "Flows", -1)),
          createBaseVNode("button", {
            type: "button",
            class: "text-xs text-blue-600 hover:underline disabled:opacity-50",
            disabled: __props.loading || __props.offline,
            onClick: _cache[0] || (_cache[0] = ($event) => emit2("refresh"))
          }, " Refresh ", 8, _hoisted_3$h)
        ]),
        __props.offline ? (openBlock(), createElementBlock("p", _hoisted_4$h, [
          _cache[3] || (_cache[3] = createTextVNode(" Langflow offline — check Settings and start the server. ", -1)),
          __props.offlineDetail ? (openBlock(), createElementBlock("span", _hoisted_5$g, toDisplayString(__props.offlineDetail), 1)) : createCommentVNode("", true)
        ])) : createCommentVNode("", true),
        __props.loading ? (openBlock(), createElementBlock("div", _hoisted_6$f, "Loading flows…")) : (openBlock(), createElementBlock("div", _hoisted_7$f, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.flows, (flow) => {
            return openBlock(), createElementBlock("button", {
              key: flow.id,
              type: "button",
              class: normalizeClass(["w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-gray-100", __props.selectedId === flow.id ? "bg-blue-50" : ""]),
              onClick: ($event) => emit2("select", flow.id)
            }, [
              createBaseVNode("div", _hoisted_9$a, [
                createBaseVNode("span", _hoisted_10$a, toDisplayString(flow.name), 1),
                __props.activeFlowId === flow.id ? (openBlock(), createElementBlock("span", _hoisted_11$9, " Active ")) : createCommentVNode("", true)
              ]),
              flow.updated_at ? (openBlock(), createElementBlock("p", _hoisted_12$9, toDisplayString(formatUpdated(flow.updated_at)), 1)) : createCommentVNode("", true)
            ], 10, _hoisted_8$f);
          }), 128)),
          !__props.flows.length && !__props.offline ? (openBlock(), createElementBlock("p", _hoisted_13$9, " No flows yet. Create one below. ")) : createCommentVNode("", true)
        ])),
        createBaseVNode("div", _hoisted_14$8, [
          createBaseVNode("button", {
            type: "button",
            class: "btn-primary w-full text-xs py-1.5",
            disabled: __props.loading || __props.offline,
            onClick: _cache[1] || (_cache[1] = ($event) => emit2("create"))
          }, " + New Flow ", 8, _hoisted_15$8)
        ])
      ]);
    };
  }
});
const _hoisted_1$g = { class: "flex-1 flex flex-col min-w-0 bg-white" };
const _hoisted_2$g = {
  key: 0,
  class: "flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
};
const _hoisted_3$g = {
  key: 1,
  class: "flex flex-1 items-center justify-center text-sm text-gray-400"
};
const _hoisted_4$g = {
  key: 0,
  class: "mx-4 mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2"
};
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "LangflowWebView",
  props: {
    baseUrl: {},
    flowId: {},
    offline: { type: Boolean }
  },
  emits: ["load-error"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const loadError = /* @__PURE__ */ ref(null);
    const editorSrc = computed(() => {
      if (!props.flowId || props.offline) return "";
      const base = props.baseUrl.replace(/\/$/, "");
      return `${base}/flow/${props.flowId}`;
    });
    watch(
      () => props.flowId,
      () => {
        loadError.value = null;
      }
    );
    function onFailLoad(event) {
      const detail = event.detail;
      const code = detail?.errorCode ?? "unknown";
      const desc = detail?.errorDescription ?? "Failed to load Langflow editor";
      loadError.value = `${desc} (${code})`;
      emit2("load-error", loadError.value);
    }
    return (_ctx, _cache) => {
      const _component_webview = resolveComponent("webview");
      return openBlock(), createElementBlock("div", _hoisted_1$g, [
        __props.offline ? (openBlock(), createElementBlock("div", _hoisted_2$g, [..._cache[0] || (_cache[0] = [
          createBaseVNode("p", { class: "text-sm text-gray-600" }, "Langflow server is not reachable.", -1),
          createBaseVNode("p", { class: "text-xs text-gray-500 max-w-md" }, [
            createTextVNode(" Install and run Langflow locally ("),
            createBaseVNode("code", { class: "bg-gray-100 px-1 rounded" }, "langflow run"),
            createTextVNode("), then set the server URL in Settings. ")
          ], -1)
        ])])) : !__props.flowId ? (openBlock(), createElementBlock("div", _hoisted_3$g, " Select a flow from the sidebar or create a new one. ")) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          loadError.value ? (openBlock(), createElementBlock("p", _hoisted_4$g, toDisplayString(loadError.value), 1)) : createCommentVNode("", true),
          createVNode(_component_webview, {
            src: editorSrc.value,
            class: "flex-1 w-full min-h-0",
            allowpopups: "",
            onDidFailLoad: onFailLoad
          }, null, 8, ["src"])
        ], 64))
      ]);
    };
  }
});
async function apiBase$2() {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}
async function parseError(res) {
  try {
    const body = await res.json();
    if (body.detail) return body.detail;
  } catch {
  }
  return res.statusText || `HTTP ${res.status}`;
}
function useLangflow() {
  async function fetchStatus() {
    const res = await fetch(`${await apiBase$2()}/v1/langflow/status`);
    if (!res.ok) {
      throw new Error(`Langflow status failed (${res.status}): ${await parseError(res)}`);
    }
    return res.json();
  }
  async function fetchFlows() {
    const res = await fetch(`${await apiBase$2()}/v1/langflow/flows`);
    if (!res.ok) {
      throw new Error(`Failed to load flows (${res.status}): ${await parseError(res)}`);
    }
    return res.json();
  }
  async function createFlow(name) {
    const res = await fetch(`${await apiBase$2()}/v1/langflow/flows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(name ? { name } : {})
    });
    if (!res.ok) {
      throw new Error(`Create flow failed (${res.status}): ${await parseError(res)}`);
    }
    return res.json();
  }
  async function setActive(flowId) {
    const res = await fetch(`${await apiBase$2()}/v1/langflow/active`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flowId })
    });
    if (!res.ok) {
      throw new Error(`Set active failed (${res.status}): ${await parseError(res)}`);
    }
  }
  return { fetchStatus, fetchFlows, createFlow, setActive };
}
const _hoisted_1$f = { class: "flex flex-1 min-h-0 flex-col" };
const _hoisted_2$f = {
  key: 0,
  class: "flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
};
const _hoisted_3$f = { class: "flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2" };
const _hoisted_4$f = {
  key: 0,
  class: "text-xs text-gray-400 truncate max-w-xs"
};
const _hoisted_5$f = { class: "ml-auto flex flex-wrap items-center gap-2" };
const _hoisted_6$e = ["disabled"];
const _hoisted_7$e = ["disabled"];
const _hoisted_8$e = { class: "flex flex-1 min-h-0" };
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "LangflowEditor",
  props: {
    workspace: {}
  },
  setup(__props) {
    const props = __props;
    const { fetchStatus, fetchFlows, createFlow, setActive } = useLangflow();
    const loading = /* @__PURE__ */ ref(true);
    const acting = /* @__PURE__ */ ref(false);
    const offline = /* @__PURE__ */ ref(false);
    const status = /* @__PURE__ */ ref(null);
    const flows = /* @__PURE__ */ ref([]);
    const activeFlowId = /* @__PURE__ */ ref();
    const selectedId = /* @__PURE__ */ ref(null);
    const message = /* @__PURE__ */ ref(null);
    onMounted(() => {
      if (props.workspace) {
        void loadAll();
      } else {
        loading.value = false;
      }
    });
    watch(
      () => props.workspace,
      (ws) => {
        if (ws) void loadAll();
        else {
          flows.value = [];
          selectedId.value = null;
          loading.value = false;
        }
      }
    );
    async function loadAll() {
      loading.value = true;
      message.value = null;
      try {
        if (offline.value) {
          await window.desktop.restartLangflow();
        }
        status.value = await fetchStatus();
        offline.value = !status.value.ok;
        if (!offline.value) {
          const data = await fetchFlows();
          flows.value = data.flows;
          activeFlowId.value = data.activeFlowId;
          if (!selectedId.value && data.activeFlowId) {
            selectedId.value = data.activeFlowId;
          } else if (!selectedId.value && data.flows[0]) {
            selectedId.value = data.flows[0].id;
          } else if (selectedId.value && !data.flows.some((f) => f.id === selectedId.value)) {
            selectedId.value = data.flows[0]?.id ?? null;
          }
        }
      } catch (err) {
        offline.value = true;
        const text = err instanceof Error ? err.message : String(err);
        message.value = { type: "error", text };
      } finally {
        loading.value = false;
      }
    }
    function selectFlow(flowId) {
      selectedId.value = flowId;
      message.value = null;
    }
    async function onCreate() {
      acting.value = true;
      message.value = null;
      try {
        const flow = await createFlow(`Flow ${flows.value.length + 1}`);
        flows.value = [flow, ...flows.value];
        selectedId.value = flow.id;
      } catch (err) {
        const text = err instanceof Error ? err.message : String(err);
        message.value = { type: "error", text };
      } finally {
        acting.value = false;
      }
    }
    async function onSetActive() {
      if (!selectedId.value) return;
      acting.value = true;
      message.value = null;
      try {
        await setActive(selectedId.value);
        activeFlowId.value = selectedId.value;
        message.value = {
          type: "success",
          text: `Agent flow saved to .agentflow/langflow/flows/${selectedId.value}.json`
        };
      } catch (err) {
        const text = err instanceof Error ? err.message : String(err);
        message.value = { type: "error", text };
      } finally {
        acting.value = false;
      }
    }
    function openInBrowser() {
      if (!status.value?.baseUrl || !selectedId.value) return;
      const url = `${status.value.baseUrl.replace(/\/$/, "")}/flow/${selectedId.value}`;
      window.open(url, "_blank");
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$f, [
        !__props.workspace ? (openBlock(), createElementBlock("div", _hoisted_2$f, [..._cache[0] || (_cache[0] = [
          createBaseVNode("p", { class: "text-sm text-gray-600" }, "Open a project to design Langflow agent flows.", -1),
          createBaseVNode("p", { class: "text-xs text-gray-500" }, "Use Home to create or open a project folder.", -1)
        ])])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createBaseVNode("header", _hoisted_3$f, [
            _cache[1] || (_cache[1] = createBaseVNode("h1", { class: "text-sm font-semibold text-gray-800" }, "Langflow Editor", -1)),
            _cache[2] || (_cache[2] = createBaseVNode("span", { class: "text-xs text-gray-500" }, "Agent orchestration — not project pipeline authoring", -1)),
            status.value?.baseUrl ? (openBlock(), createElementBlock("span", _hoisted_4$f, toDisplayString(status.value.baseUrl), 1)) : createCommentVNode("", true),
            createBaseVNode("div", _hoisted_5$f, [
              createBaseVNode("button", {
                type: "button",
                class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50",
                disabled: !selectedId.value || offline.value,
                onClick: openInBrowser
              }, " Open in Browser ", 8, _hoisted_6$e),
              createBaseVNode("button", {
                type: "button",
                class: "btn-primary text-xs py-1 px-3",
                disabled: !selectedId.value || acting.value || offline.value,
                onClick: onSetActive
              }, toDisplayString(acting.value ? "Saving…" : "Save Active Flow"), 9, _hoisted_7$e)
            ])
          ]),
          message.value ? (openBlock(), createElementBlock("p", {
            key: 0,
            class: normalizeClass([
              "px-4 py-1 text-xs",
              message.value.type === "success" ? "text-green-800 bg-green-50" : "text-red-700 bg-red-50"
            ])
          }, toDisplayString(message.value.text), 3)) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_8$e, [
            createVNode(_sfc_main$i, {
              flows: flows.value,
              "selected-id": selectedId.value,
              "active-flow-id": activeFlowId.value,
              loading: loading.value || acting.value,
              offline: offline.value,
              "offline-detail": status.value?.detail,
              onSelect: selectFlow,
              onRefresh: loadAll,
              onCreate
            }, null, 8, ["flows", "selected-id", "active-flow-id", "loading", "offline", "offline-detail"]),
            createVNode(_sfc_main$h, {
              "base-url": status.value?.baseUrl ?? "",
              "flow-id": selectedId.value,
              offline: offline.value
            }, null, 8, ["base-url", "flow-id", "offline"])
          ])
        ], 64))
      ]);
    };
  }
});
const _hoisted_1$e = { class: "flex-1 flex flex-col items-center justify-center p-8 bg-gray-50" };
const _hoisted_2$e = { class: "w-full max-w-lg" };
const _hoisted_3$e = {
  key: 0,
  class: "text-sm text-gray-400"
};
const _hoisted_4$e = {
  key: 1,
  class: "text-sm text-gray-400"
};
const _hoisted_5$e = {
  key: 2,
  class: "flex flex-col gap-2"
};
const _hoisted_6$d = ["onClick"];
const _hoisted_7$d = { class: "block text-sm font-medium text-gray-900" };
const _hoisted_8$d = ["title"];
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "ProjectHome",
  emits: ["opened"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    const recentProjects = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(true);
    onMounted(async () => {
      recentProjects.value = await window.desktop.getRecentProjects();
      loading.value = false;
    });
    async function newProject() {
      const dir = await window.desktop.pickProjectDirectory();
      if (!dir) return;
      const workspace = await window.desktop.initProject(dir);
      emit2("opened", workspace);
    }
    async function openProject() {
      const workspace = await window.desktop.pickWorkspace();
      if (workspace) emit2("opened", workspace);
    }
    async function openRecent(dir) {
      const workspace = await window.desktop.openProject(dir);
      emit2("opened", workspace);
    }
    function projectName(dir) {
      const parts = dir.replace(/\/$/, "").split(/[/\\]/);
      return parts[parts.length - 1] || dir;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$e, [
        createBaseVNode("div", _hoisted_2$e, [
          _cache[1] || (_cache[1] = createBaseVNode("h1", { class: "text-2xl font-semibold text-gray-900 mb-2" }, "Projects", -1)),
          _cache[2] || (_cache[2] = createBaseVNode("p", { class: "text-sm text-gray-500 mb-6" }, "Open an existing workflow project or create a new one.", -1)),
          createBaseVNode("div", { class: "flex gap-3 mb-8" }, [
            createBaseVNode("button", {
              class: "btn-primary text-sm",
              onClick: newProject
            }, "New Project"),
            createBaseVNode("button", {
              class: "btn-primary text-sm bg-gray-600 hover:bg-gray-700",
              onClick: openProject
            }, " Open Project ")
          ]),
          createBaseVNode("section", null, [
            _cache[0] || (_cache[0] = createBaseVNode("h2", { class: "text-sm font-medium text-gray-700 mb-3" }, "Recent Projects", -1)),
            loading.value ? (openBlock(), createElementBlock("div", _hoisted_3$e, "Loading...")) : recentProjects.value.length === 0 ? (openBlock(), createElementBlock("p", _hoisted_4$e, " No recent projects yet. ")) : (openBlock(), createElementBlock("ul", _hoisted_5$e, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(recentProjects.value, (dir) => {
                return openBlock(), createElementBlock("li", { key: dir }, [
                  createBaseVNode("button", {
                    class: "w-full text-left px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors",
                    onClick: ($event) => openRecent(dir)
                  }, [
                    createBaseVNode("span", _hoisted_7$d, toDisplayString(projectName(dir)), 1),
                    createBaseVNode("span", {
                      class: "block text-xs text-gray-500 truncate mt-0.5",
                      title: dir
                    }, toDisplayString(dir), 9, _hoisted_8$d)
                  ], 8, _hoisted_6$d)
                ]);
              }), 128))
            ]))
          ])
        ])
      ]);
    };
  }
});
async function apiBase$1() {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}
async function apiJson$1(path, init) {
  const res = await fetch(`${await apiBase$1()}${path}`, init);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${path} failed (${res.status}): ${detail}`);
  }
  return res.json();
}
function useWorkflow() {
  function workflowQuery(workflowId) {
    return workflowId ? `?workflowId=${encodeURIComponent(workflowId)}` : "";
  }
  async function fetchWorkflowList() {
    return apiJson$1("/v1/workflows");
  }
  async function fetchTemplates() {
    return apiJson$1("/v1/workflows/templates");
  }
  async function fetchWorkflow(workflowId) {
    return apiJson$1(`/v1/workflows/current${workflowQuery(workflowId)}`);
  }
  async function fetchState(workflowId) {
    return apiJson$1(`/v1/workflow/state${workflowQuery(workflowId)}`);
  }
  async function saveWorkflow(workflowId, definition) {
    return apiJson$1(`/v1/workflows/${encodeURIComponent(workflowId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(definition)
    });
  }
  async function createFromTemplate(templateId, newId) {
    return apiJson$1("/v1/workflows/from-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, newId })
    });
  }
  async function activateWorkflow(workflowId) {
    return apiJson$1(`/v1/workflows/${encodeURIComponent(workflowId)}/activate`, {
      method: "POST"
    });
  }
  async function deleteWorkflow(workflowId) {
    return apiJson$1(`/v1/workflows/${encodeURIComponent(workflowId)}`, {
      method: "DELETE"
    });
  }
  async function fetchSkills() {
    return apiJson$1("/v1/skills");
  }
  async function fetchResourceContext() {
    return apiJson$1("/v1/resources/context");
  }
  async function fetchTopology() {
    return apiJson$1("/v1/resources/topology");
  }
  async function fetchPhase(stepId) {
    return apiJson$1(`/v1/workflow/phase?stepId=${encodeURIComponent(stepId)}`);
  }
  async function fetchGates(stepId) {
    return apiJson$1(`/v1/workflow/gates?stepId=${encodeURIComponent(stepId)}`);
  }
  async function fetchDeploymentConfig() {
    return apiJson$1("/v1/workspace/deployment");
  }
  async function fetchOpsConfig() {
    return apiJson$1("/v1/ops/config");
  }
  async function fetchOpsSummary() {
    return apiJson$1("/v1/ops/summary");
  }
  async function listWorkspace(relPath, recursive = false) {
    const q2 = new URLSearchParams({ path: relPath });
    if (recursive) q2.set("recursive", "1");
    return apiJson$1(`/v1/workspace/list?${q2}`);
  }
  async function readWorkspaceFile(relPath) {
    return apiJson$1(`/v1/workspace/file?path=${encodeURIComponent(relPath)}`);
  }
  async function writeWorkspaceFile(relPath, content) {
    await apiJson$1("/v1/workspace/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: relPath, content })
    });
  }
  async function deleteWorkspacePath(relPath) {
    await apiJson$1(`/v1/workspace/file?path=${encodeURIComponent(relPath)}`, {
      method: "DELETE"
    });
  }
  async function advance(action, workflowId) {
    return apiJson$1("/v1/workflow/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, workflowId })
    });
  }
  async function* runStep(stepId, skills, workflowId, message) {
    const body = {};
    if (stepId) body.stepId = stepId;
    if (skills?.length) body.skills = skills;
    if (workflowId) body.workflowId = workflowId;
    if (message) body.message = message;
    const res = await fetch(`${await apiBase$1()}/v1/workflow/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok || !res.body) {
      throw new Error(`Workflow run failed: ${res.status}`);
    }
    console.log("runStep", res.body);
    yield* parseSseStream(res.body);
  }
  async function* fileChat(paths, message, skills, stepId, threadId, workflowId) {
    const body = { paths, message };
    if (skills?.length) body.skills = skills;
    if (stepId) body.stepId = stepId;
    if (threadId) body.threadId = threadId;
    if (workflowId) body.workflowId = workflowId;
    const res = await fetch(`${await apiBase$1()}/v1/workspace/file-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok || !res.body) {
      throw new Error(`File chat failed: ${res.status}`);
    }
    yield* parseSseStream(res.body);
  }
  async function* stepChat(message, stepId, workflowId, threadId, skills, mode = "agent") {
    const body = {
      message,
      thread_id: threadId,
      mode,
      stepId,
      workflowId
    };
    if (skills?.length) body.skills = skills;
    const res = await fetch(`${await apiBase$1()}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok || !res.body) {
      throw new Error(`Step chat failed: ${res.status}`);
    }
    yield* parseSseStream(res.body);
  }
  async function initWorkflow(templateId = "default-dev-cicd") {
    const res = await apiJson$1("/v1/workflows/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId })
    });
    return res;
  }
  return {
    fetchWorkflowList,
    fetchTemplates,
    fetchWorkflow,
    fetchState,
    saveWorkflow,
    createFromTemplate,
    initWorkflow,
    activateWorkflow,
    deleteWorkflow,
    fetchSkills,
    fetchResourceContext,
    fetchTopology,
    fetchPhase,
    fetchGates,
    fetchDeploymentConfig,
    fetchOpsConfig,
    fetchOpsSummary,
    listWorkspace,
    readWorkspaceFile,
    writeWorkspaceFile,
    deleteWorkspacePath,
    advance,
    runStep,
    fileChat,
    stepChat
  };
}
function stepReportPath(stepId) {
  const map = {
    test: "test-report.md",
    review: "review-notes.md",
    "test-2": "regression-report.md"
  };
  return map[stepId] ?? null;
}
const _hoisted_1$d = { class: "max-w-lg mx-auto p-8" };
const _hoisted_2$d = { class: "mb-8" };
const _hoisted_3$d = { class: "text-sm text-gray-500 mb-3" };
const _hoisted_4$d = { class: "mb-8" };
const _hoisted_5$d = {
  key: 0,
  class: "mt-4 space-y-2"
};
const _hoisted_6$c = {
  key: 0,
  class: "text-sm"
};
const _hoisted_7$c = ["href"];
const _hoisted_8$c = {
  key: 1,
  class: "text-sm"
};
const _hoisted_9$9 = ["href"];
const _hoisted_10$9 = {
  key: 2,
  class: "text-sm"
};
const _hoisted_11$8 = ["href"];
const _hoisted_12$8 = { class: "mb-8" };
const _hoisted_13$8 = { class: "flex items-center gap-2 text-sm mb-3 cursor-pointer" };
const _hoisted_14$7 = { class: "flex items-center gap-2 text-sm mb-3 cursor-pointer" };
const _hoisted_15$7 = ["checked"];
const _hoisted_16$7 = { class: "text-sm text-gray-500 mb-3" };
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "Settings",
  emits: ["back"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    const workflowApi = useWorkflow();
    const apiKeyStatus = /* @__PURE__ */ ref("");
    const apiKeyInput = /* @__PURE__ */ ref("");
    const resourceServerUrl = /* @__PURE__ */ ref("");
    const workspacePath = /* @__PURE__ */ ref("");
    const opsConfig = /* @__PURE__ */ ref(null);
    const langflowBaseUrl = /* @__PURE__ */ ref("");
    const langflowApiKeyStatus = /* @__PURE__ */ ref("");
    const langflowApiKeyInput = /* @__PURE__ */ ref("");
    const langflowAutoStart = /* @__PURE__ */ ref(true);
    const agentRecursionUnlimited = /* @__PURE__ */ ref(true);
    const agentRecursionLimit = /* @__PURE__ */ ref(200);
    onMounted(async () => {
      apiKeyStatus.value = await window.desktop.getApiKeyStatus();
      resourceServerUrl.value = await window.desktop.getResourceServerUrl();
      workspacePath.value = await window.desktop.getWorkspace();
      langflowBaseUrl.value = await window.desktop.getLangflowBaseUrl();
      langflowApiKeyStatus.value = await window.desktop.getLangflowApiKeyStatus();
      langflowAutoStart.value = await window.desktop.getLangflowAutoStart();
      const recursion = await window.desktop.getAgentRecursionLimit();
      agentRecursionUnlimited.value = recursion.unlimited;
      if (recursion.limit != null) {
        agentRecursionLimit.value = recursion.limit;
      }
      if (resourceServerUrl.value.trim()) {
        try {
          opsConfig.value = await workflowApi.fetchOpsConfig();
        } catch {
          opsConfig.value = null;
        }
      }
    });
    async function saveApiKey() {
      await window.desktop.setApiKey(apiKeyInput.value);
      apiKeyInput.value = "";
      apiKeyStatus.value = await window.desktop.getApiKeyStatus();
    }
    async function clearApiKey() {
      await window.desktop.clearApiKey();
      apiKeyStatus.value = "";
    }
    async function saveResourceServerUrl() {
      await window.desktop.setResourceServerUrl(resourceServerUrl.value);
      opsConfig.value = null;
      if (resourceServerUrl.value.trim()) {
        try {
          opsConfig.value = await workflowApi.fetchOpsConfig();
        } catch {
          opsConfig.value = null;
        }
      }
    }
    const topologyEditorUrl = computed(() => {
      const base = resourceServerUrl.value.trim().replace(/\/$/, "");
      if (!base) return "";
      const project = workspacePath.value.split(/[/\\]/).filter(Boolean).pop() ?? "demo";
      return `${base}/ui/?project=${encodeURIComponent(project)}`;
    });
    async function saveLangflow() {
      await window.desktop.setLangflow(langflowBaseUrl.value, langflowApiKeyInput.value);
      langflowApiKeyInput.value = "";
      langflowApiKeyStatus.value = await window.desktop.getLangflowApiKeyStatus();
    }
    async function toggleLangflowAutoStart() {
      langflowAutoStart.value = !langflowAutoStart.value;
      await window.desktop.setLangflowAutoStart(langflowAutoStart.value);
    }
    async function saveAgentRecursionLimit() {
      await window.desktop.setAgentRecursionLimit({
        unlimited: agentRecursionUnlimited.value,
        limit: agentRecursionLimit.value
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$d, [
        createBaseVNode("button", {
          class: "text-sm text-blue-600 mb-6",
          onClick: _cache[0] || (_cache[0] = ($event) => emit2("back"))
        }, "← Back"),
        _cache[17] || (_cache[17] = createBaseVNode("h1", { class: "text-xl font-semibold mb-4" }, "Settings", -1)),
        createBaseVNode("section", _hoisted_2$d, [
          _cache[7] || (_cache[7] = createBaseVNode("h2", { class: "text-sm font-medium mb-2" }, "DeepSeek API Key", -1)),
          createBaseVNode("p", _hoisted_3$d, " Status: " + toDisplayString(apiKeyStatus.value || "not set"), 1),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => apiKeyInput.value = $event),
            type: "password",
            class: "input-field mb-3 w-full",
            placeholder: "sk-..."
          }, null, 512), [
            [vModelText, apiKeyInput.value]
          ]),
          createBaseVNode("div", { class: "flex gap-2" }, [
            createBaseVNode("button", {
              class: "btn-primary",
              onClick: saveApiKey
            }, "Save Key"),
            createBaseVNode("button", {
              class: "btn-primary bg-gray-500",
              onClick: clearApiKey
            }, "Clear")
          ])
        ]),
        createBaseVNode("section", _hoisted_4$d, [
          _cache[9] || (_cache[9] = createBaseVNode("h2", { class: "text-sm font-medium mb-2" }, "Resource Server URL", -1)),
          _cache[10] || (_cache[10] = createBaseVNode("p", { class: "text-sm text-gray-500 mb-3" }, " Optional team resource config server. AI uses connection details when generating backend configs (application.yml, .env). Leave empty to use project .agentflow/resource-instances.yaml only. ", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => resourceServerUrl.value = $event),
            type: "url",
            class: "input-field mb-3 w-full",
            placeholder: "http://localhost:9000"
          }, null, 512), [
            [vModelText, resourceServerUrl.value]
          ]),
          createBaseVNode("button", {
            class: "btn-primary",
            onClick: saveResourceServerUrl
          }, "Save URL"),
          resourceServerUrl.value.trim() ? (openBlock(), createElementBlock("div", _hoisted_5$d, [
            _cache[8] || (_cache[8] = createBaseVNode("p", { class: "text-xs text-gray-500" }, [
              createTextVNode(" Ops panel URLs are configured on the Resource Server ("),
              createBaseVNode("code", { class: "text-gray-600" }, "RESOURCE_SERVER_PORTAINER_URL"),
              createTextVNode(", "),
              createBaseVNode("code", { class: "text-gray-600" }, "RESOURCE_SERVER_MESHERY_URL"),
              createTextVNode("). ")
            ], -1)),
            opsConfig.value?.portainerUrl ? (openBlock(), createElementBlock("p", _hoisted_6$c, [
              createBaseVNode("a", {
                href: opsConfig.value.portainerUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "text-blue-600"
              }, " Open Portainer (Docker VPS) ", 8, _hoisted_7$c)
            ])) : createCommentVNode("", true),
            opsConfig.value?.mesheryUrl ? (openBlock(), createElementBlock("p", _hoisted_8$c, [
              createBaseVNode("a", {
                href: opsConfig.value.mesheryUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "text-blue-600"
              }, " Open Meshery / Kanvas (Kubernetes) ", 8, _hoisted_9$9)
            ])) : createCommentVNode("", true),
            topologyEditorUrl.value ? (openBlock(), createElementBlock("p", _hoisted_10$9, [
              createBaseVNode("a", {
                href: topologyEditorUrl.value,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "text-gray-600"
              }, " Topology Editor (dev) ", 8, _hoisted_11$8)
            ])) : createCommentVNode("", true)
          ])) : createCommentVNode("", true)
        ]),
        createBaseVNode("section", _hoisted_12$8, [
          _cache[12] || (_cache[12] = createBaseVNode("h2", { class: "text-sm font-medium mb-2" }, "Agent recursion limit", -1)),
          _cache[13] || (_cache[13] = createBaseVNode("p", { class: "text-sm text-gray-500 mb-3" }, ' Max LangGraph steps per agent run (each tool call uses multiple steps). Increase if you see "Recursion limit reached" during long tasks. ', -1)),
          createBaseVNode("label", _hoisted_13$8, [
            withDirectives(createBaseVNode("input", {
              type: "checkbox",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => agentRecursionUnlimited.value = $event)
            }, null, 512), [
              [vModelCheckbox, agentRecursionUnlimited.value]
            ]),
            _cache[11] || (_cache[11] = createTextVNode(" Unlimited (recommended) ", -1))
          ]),
          !agentRecursionUnlimited.value ? withDirectives((openBlock(), createElementBlock("input", {
            key: 0,
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => agentRecursionLimit.value = $event),
            type: "number",
            min: "1",
            class: "input-field mb-3 w-full",
            placeholder: "500"
          }, null, 512)), [
            [
              vModelText,
              agentRecursionLimit.value,
              void 0,
              { number: true }
            ]
          ]) : createCommentVNode("", true),
          createBaseVNode("button", {
            class: "btn-primary",
            onClick: saveAgentRecursionLimit
          }, "Save")
        ]),
        createBaseVNode("section", null, [
          _cache[15] || (_cache[15] = createBaseVNode("h2", { class: "text-sm font-medium mb-2" }, "Langflow Server", -1)),
          _cache[16] || (_cache[16] = createBaseVNode("p", { class: "text-sm text-gray-500 mb-3" }, " URL of your local Langflow instance. When auto-start is on, Desktop spawns Langflow on port 17860 if the URL below is unreachable. ", -1)),
          createBaseVNode("label", _hoisted_14$7, [
            createBaseVNode("input", {
              type: "checkbox",
              checked: langflowAutoStart.value,
              onChange: toggleLangflowAutoStart
            }, null, 40, _hoisted_15$7),
            _cache[14] || (_cache[14] = createTextVNode(" Start Langflow with Agent Flow Desktop ", -1))
          ]),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => langflowBaseUrl.value = $event),
            type: "url",
            class: "input-field mb-3 w-full",
            placeholder: "http://127.0.0.1:7860"
          }, null, 512), [
            [vModelText, langflowBaseUrl.value]
          ]),
          createBaseVNode("p", _hoisted_16$7, " API Key status: " + toDisplayString(langflowApiKeyStatus.value || "not set"), 1),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => langflowApiKeyInput.value = $event),
            type: "password",
            class: "input-field mb-3 w-full",
            placeholder: "Optional Langflow API key"
          }, null, 512), [
            [vModelText, langflowApiKeyInput.value]
          ]),
          createBaseVNode("button", {
            class: "btn-primary",
            onClick: saveLangflow
          }, "Save")
        ])
      ]);
    };
  }
});
const _hoisted_1$c = { class: "flex-1 min-h-0 overflow-auto p-6 bg-gray-50" };
const _hoisted_2$c = {
  key: 0,
  class: "text-center text-sm text-gray-500 py-16"
};
const _hoisted_3$c = {
  key: 1,
  class: "flex flex-wrap gap-4 justify-center items-start"
};
const _hoisted_4$c = ["onClick"];
const _hoisted_5$c = { class: "text-sm font-semibold text-gray-800" };
const _hoisted_6$b = { class: "text-xs text-gray-500" };
const _hoisted_7$b = {
  key: 2,
  class: "mt-8 max-w-xl mx-auto"
};
const _hoisted_8$b = { class: "text-xs text-gray-700 space-y-1 font-mono" };
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "TopologyGraph",
  props: {
    nodes: {},
    edges: {},
    selectedId: {}
  },
  emits: ["select", "add"],
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$c, [
        !__props.nodes.length ? (openBlock(), createElementBlock("div", _hoisted_2$c, [
          _cache[1] || (_cache[1] = createBaseVNode("p", null, "暂无节点。", -1)),
          createBaseVNode("button", {
            type: "button",
            class: "mt-3 text-xs py-1 px-3 border border-blue-400 text-blue-700 rounded hover:bg-blue-50",
            onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("add"))
          }, " + Add node ")
        ])) : (openBlock(), createElementBlock("div", _hoisted_3$c, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.nodes, (node) => {
            return openBlock(), createElementBlock("button", {
              key: node.id,
              type: "button",
              class: normalizeClass(["card px-4 py-3 min-w-28 text-left transition-shadow", __props.selectedId === node.id ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow"]),
              onClick: ($event) => _ctx.$emit("select", node.id)
            }, [
              createBaseVNode("p", _hoisted_5$c, toDisplayString(node.id), 1),
              createBaseVNode("p", _hoisted_6$b, toDisplayString(node.engine ?? node.kind), 1)
            ], 10, _hoisted_4$c);
          }), 128))
        ])),
        __props.edges.length ? (openBlock(), createElementBlock("div", _hoisted_7$b, [
          _cache[2] || (_cache[2] = createBaseVNode("p", { class: "text-xs font-semibold text-gray-500 mb-2" }, "Connections", -1)),
          createBaseVNode("ul", _hoisted_8$b, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.edges, (edge, idx) => {
              return openBlock(), createElementBlock("li", {
                key: `${edge.from}-${edge.to}-${idx}`
              }, toDisplayString(edge.from) + " → " + toDisplayString(edge.to), 1);
            }), 128))
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
async function apiBase() {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}
async function apiJson(path, init) {
  const res = await fetch(`${await apiBase()}${path}`, init);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Request failed: ${res.status}`);
  }
  return res.json();
}
function useTopologyOps() {
  async function bootstrapOps() {
    return apiJson("/v1/workspace/ops/bootstrap");
  }
  async function loadOps() {
    return apiJson("/v1/workspace/ops");
  }
  async function saveOps(topology, ops) {
    return apiJson("/v1/workspace/ops", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topology, ops })
    });
  }
  async function listLogFiles(nodeId) {
    const q2 = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : "";
    return apiJson(`/v1/workspace/ops/logs${q2}`);
  }
  async function readLogFile(filePath) {
    return apiJson(`/v1/workspace/ops/logs?path=${encodeURIComponent(filePath)}`);
  }
  async function fetchLogSnapshot(nodeId) {
    return apiJson("/v1/workspace/ops/logs/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId })
    });
  }
  async function fetchNodeStatus(nodeId) {
    return apiJson(`/v1/workspace/ops/status?nodeId=${encodeURIComponent(nodeId)}`);
  }
  async function deployNode(nodeId) {
    return apiJson("/v1/workspace/ops/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, confirm: true })
    });
  }
  async function deployAll() {
    return apiJson("/v1/workspace/ops/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deployAll: true, confirm: true })
    });
  }
  async function sshExec(hostRef, command) {
    return apiJson("/v1/workspace/ops/ssh/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostRef, command })
    });
  }
  async function listAudit(limit = 50) {
    return apiJson(`/v1/workspace/ops/audit?limit=${limit}`);
  }
  async function syncToServer() {
    return apiJson("/v1/workspace/ops/sync-server", { method: "POST" });
  }
  function followLogs(nodeId, handlers) {
    let es = null;
    void apiBase().then((base) => {
      es = new EventSource(
        `${base}/v1/workspace/ops/logs/stream?nodeId=${encodeURIComponent(nodeId)}`
      );
      es.addEventListener("log", (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.text) handlers.onChunk(data.text);
        } catch {
        }
      });
      es.addEventListener("error", (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.message) handlers.onError?.(data.message);
        } catch {
        }
      });
      es.addEventListener("done", () => {
        handlers.onDone?.();
        es?.close();
      });
    });
    return () => {
      es?.close();
    };
  }
  return {
    bootstrapOps,
    loadOps,
    saveOps,
    listLogFiles,
    readLogFile,
    fetchLogSnapshot,
    fetchNodeStatus,
    deployNode,
    deployAll,
    sshExec,
    followLogs,
    listAudit,
    syncToServer
  };
}
const NODE_KINDS = [
  "service",
  "database",
  "cache",
  "gateway",
  "worker"
];
function isValidNodeId(id) {
  return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id.trim());
}
function defaultAccessForKind(kind, nodeId) {
  if (kind === "database" || kind === "cache") {
    return { mode: "managed-instance", instanceRef: nodeId };
  }
  return {
    mode: "host-ssh",
    hostRef: "vps-dev",
    deployRef: "compose-dev",
    service: nodeId
  };
}
function ensureOpsPlaceholders(ops, node) {
  if (node.access?.mode !== "host-ssh") {
    return ops;
  }
  const next = {
    ...ops,
    hosts: [...ops.hosts],
    deployProfiles: [...ops.deployProfiles]
  };
  const hostRef = node.access.hostRef ?? "vps-dev";
  if (!next.hosts.some((h) => h.id === hostRef)) {
    next.hosts.push({ id: hostRef, host: "", port: 22, user: "deploy" });
  }
  const deployRef = node.access.deployRef ?? "compose-dev";
  if (!next.deployProfiles.some((p2) => p2.id === deployRef)) {
    next.deployProfiles.push({
      id: deployRef,
      type: "docker-compose",
      workdir: "/opt/app",
      commands: {
        status: "docker compose ps",
        deploy: "docker compose up -d --build {{service}}",
        deployAll: "docker compose up -d --build",
        logs: "docker compose logs -f --tail=200 {{service}}",
        logsSnapshot: "docker compose logs --tail=500 {{service}}"
      }
    });
  }
  return next;
}
function removeNodeFromTopology(nodes, edges, nodeId) {
  return {
    nodes: nodes.filter((n) => n.id !== nodeId),
    edges: edges.filter((e) => e.from !== nodeId && e.to !== nodeId)
  };
}
function upsertNode(nodes, node, previousId) {
  const id = previousId ?? node.id;
  const idx = nodes.findIndex((n) => n.id === id);
  if (idx >= 0) {
    const next = [...nodes];
    next[idx] = node;
    return next;
  }
  return [...nodes, node];
}
const _hoisted_1$b = { class: "text-gray-600" };
const _hoisted_2$b = ["disabled"];
const _hoisted_3$b = { class: "text-gray-600" };
const _hoisted_4$b = ["value"];
const _hoisted_5$b = { class: "text-gray-600" };
const _hoisted_6$a = { class: "text-gray-600" };
const _hoisted_7$a = { class: "text-gray-600" };
const _hoisted_8$a = { class: "text-gray-600" };
const _hoisted_9$8 = { class: "text-gray-600" };
const _hoisted_10$8 = ["value"];
const _hoisted_11$7 = ["value"];
const _hoisted_12$7 = { class: "text-gray-600" };
const _hoisted_13$7 = ["value"];
const _hoisted_14$6 = ["value"];
const _hoisted_15$6 = { class: "text-gray-600" };
const _hoisted_16$6 = {
  key: 1,
  class: "text-gray-600"
};
const _hoisted_17$5 = {
  key: 2,
  class: "text-red-600"
};
const _hoisted_18$5 = { class: "flex flex-wrap gap-2 mt-2" };
const _hoisted_19$4 = {
  type: "submit",
  class: "btn-primary text-xs py-1 px-3"
};
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "TopologyNodeForm",
  props: {
    mode: {},
    node: {},
    ops: {}
  },
  emits: ["submit", "cancel", "delete"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const id = /* @__PURE__ */ ref("");
    const kind = /* @__PURE__ */ ref("service");
    const engine = /* @__PURE__ */ ref("");
    const runtime = /* @__PURE__ */ ref("");
    const image = /* @__PURE__ */ ref("");
    const accessMode = /* @__PURE__ */ ref("host-ssh");
    const hostRef = /* @__PURE__ */ ref("vps-dev");
    const deployRef = /* @__PURE__ */ ref("compose-dev");
    const service = /* @__PURE__ */ ref("");
    const instanceRef = /* @__PURE__ */ ref("");
    const formError = /* @__PURE__ */ ref(null);
    function resetFromNode(node) {
      if (!node) return;
      id.value = node.id;
      kind.value = node.kind;
      engine.value = node.engine ?? "";
      runtime.value = node.runtime ?? "";
      image.value = node.image ?? "";
      accessMode.value = node.access?.mode ?? "host-ssh";
      hostRef.value = node.access?.hostRef ?? "vps-dev";
      deployRef.value = node.access?.deployRef ?? "compose-dev";
      service.value = node.access?.service ?? node.id;
      instanceRef.value = node.access?.instanceRef ?? node.id;
    }
    watch(
      () => props.node,
      (node) => {
        if (props.mode === "edit") resetFromNode(node);
      },
      { immediate: true }
    );
    watch(kind, (nextKind) => {
      if (props.mode !== "create") return;
      const access = defaultAccessForKind(nextKind, id.value.trim() || "node");
      accessMode.value = access?.mode ?? "host-ssh";
      hostRef.value = access?.hostRef ?? "vps-dev";
      deployRef.value = access?.deployRef ?? "compose-dev";
      service.value = access?.service ?? id.value.trim();
      instanceRef.value = access?.instanceRef ?? id.value.trim();
    });
    watch(id, (nextId) => {
      if (props.mode !== "create" || !nextId.trim()) return;
      service.value = nextId.trim();
      if (accessMode.value === "managed-instance") {
        instanceRef.value = nextId.trim();
      }
    });
    const hostOptions = computed(() => props.ops?.hosts.map((h) => h.id) ?? []);
    const deployOptions = computed(() => props.ops?.deployProfiles.map((p2) => p2.id) ?? []);
    function buildNode() {
      formError.value = null;
      const nodeId = id.value.trim();
      if (!isValidNodeId(nodeId)) {
        formError.value = "ID must start with a letter and use only letters, numbers, _ or -";
        return null;
      }
      const access = accessMode.value === "managed-instance" ? {
        mode: "managed-instance",
        instanceRef: instanceRef.value.trim() || nodeId
      } : {
        mode: "host-ssh",
        hostRef: hostRef.value.trim() || "vps-dev",
        deployRef: deployRef.value.trim() || "compose-dev",
        service: service.value.trim() || nodeId
      };
      return {
        id: nodeId,
        kind: kind.value,
        engine: engine.value.trim() || void 0,
        runtime: runtime.value.trim() || void 0,
        image: image.value.trim() || null,
        ports: props.node?.ports ?? [],
        access
      };
    }
    function onSubmit() {
      const node = buildNode();
      if (!node) return;
      emit2("submit", node);
    }
    function onDelete() {
      emit2("delete");
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("form", {
        class: "flex flex-col gap-2 text-xs",
        onSubmit: withModifiers(onSubmit, ["prevent"])
      }, [
        createBaseVNode("label", _hoisted_1$b, [
          _cache[11] || (_cache[11] = createTextVNode(" ID ", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => id.value = $event),
            class: "input-field w-full text-xs mt-0.5 font-mono",
            disabled: __props.mode === "edit",
            placeholder: "api",
            required: ""
          }, null, 8, _hoisted_2$b), [
            [vModelText, id.value]
          ])
        ]),
        createBaseVNode("label", _hoisted_3$b, [
          _cache[12] || (_cache[12] = createTextVNode(" Kind ", -1)),
          withDirectives(createBaseVNode("select", {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => kind.value = $event),
            class: "input-field w-full text-xs mt-0.5"
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(NODE_KINDS), (k) => {
              return openBlock(), createElementBlock("option", {
                key: k,
                value: k
              }, toDisplayString(k), 9, _hoisted_4$b);
            }), 128))
          ], 512), [
            [vModelSelect, kind.value]
          ])
        ]),
        createBaseVNode("label", _hoisted_5$b, [
          _cache[13] || (_cache[13] = createTextVNode(" Engine ", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => engine.value = $event),
            class: "input-field w-full text-xs mt-0.5",
            placeholder: "mysql, redis, node…"
          }, null, 512), [
            [vModelText, engine.value]
          ])
        ]),
        createBaseVNode("label", _hoisted_6$a, [
          _cache[14] || (_cache[14] = createTextVNode(" Runtime ", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => runtime.value = $event),
            class: "input-field w-full text-xs mt-0.5",
            placeholder: "node, python…"
          }, null, 512), [
            [vModelText, runtime.value]
          ])
        ]),
        createBaseVNode("label", _hoisted_7$a, [
          _cache[15] || (_cache[15] = createTextVNode(" Image ", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => image.value = $event),
            class: "input-field w-full text-xs mt-0.5 font-mono",
            placeholder: "optional image name"
          }, null, 512), [
            [vModelText, image.value]
          ])
        ]),
        _cache[22] || (_cache[22] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mt-1" }, "Access", -1)),
        createBaseVNode("label", _hoisted_8$a, [
          _cache[17] || (_cache[17] = createTextVNode(" Mode ", -1)),
          withDirectives(createBaseVNode("select", {
            "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => accessMode.value = $event),
            class: "input-field w-full text-xs mt-0.5"
          }, [..._cache[16] || (_cache[16] = [
            createBaseVNode("option", { value: "host-ssh" }, "host-ssh", -1),
            createBaseVNode("option", { value: "managed-instance" }, "managed-instance", -1)
          ])], 512), [
            [vModelSelect, accessMode.value]
          ])
        ]),
        accessMode.value === "host-ssh" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
          createBaseVNode("label", _hoisted_9$8, [
            _cache[18] || (_cache[18] = createTextVNode(" Host ref ", -1)),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => hostRef.value = $event),
              class: "input-field w-full text-xs mt-0.5"
            }, [
              !hostOptions.value.includes(hostRef.value) ? (openBlock(), createElementBlock("option", {
                key: 0,
                value: hostRef.value
              }, toDisplayString(hostRef.value), 9, _hoisted_10$8)) : createCommentVNode("", true),
              (openBlock(true), createElementBlock(Fragment, null, renderList(hostOptions.value, (h) => {
                return openBlock(), createElementBlock("option", {
                  key: h,
                  value: h
                }, toDisplayString(h), 9, _hoisted_11$7);
              }), 128))
            ], 512), [
              [vModelSelect, hostRef.value]
            ])
          ]),
          createBaseVNode("label", _hoisted_12$7, [
            _cache[19] || (_cache[19] = createTextVNode(" Deploy profile ", -1)),
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => deployRef.value = $event),
              class: "input-field w-full text-xs mt-0.5"
            }, [
              !deployOptions.value.includes(deployRef.value) ? (openBlock(), createElementBlock("option", {
                key: 0,
                value: deployRef.value
              }, toDisplayString(deployRef.value), 9, _hoisted_13$7)) : createCommentVNode("", true),
              (openBlock(true), createElementBlock(Fragment, null, renderList(deployOptions.value, (p2) => {
                return openBlock(), createElementBlock("option", {
                  key: p2,
                  value: p2
                }, toDisplayString(p2), 9, _hoisted_14$6);
              }), 128))
            ], 512), [
              [vModelSelect, deployRef.value]
            ])
          ]),
          createBaseVNode("label", _hoisted_15$6, [
            _cache[20] || (_cache[20] = createTextVNode(" Compose service ", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => service.value = $event),
              class: "input-field w-full text-xs mt-0.5 font-mono"
            }, null, 512), [
              [vModelText, service.value]
            ])
          ])
        ], 64)) : (openBlock(), createElementBlock("label", _hoisted_16$6, [
          _cache[21] || (_cache[21] = createTextVNode(" Instance ref ", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => instanceRef.value = $event),
            class: "input-field w-full text-xs mt-0.5 font-mono"
          }, null, 512), [
            [vModelText, instanceRef.value]
          ])
        ])),
        formError.value ? (openBlock(), createElementBlock("p", _hoisted_17$5, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
        createBaseVNode("div", _hoisted_18$5, [
          createBaseVNode("button", _hoisted_19$4, toDisplayString(__props.mode === "create" ? "Add node" : "Apply"), 1),
          __props.mode === "create" ? (openBlock(), createElementBlock("button", {
            key: 0,
            type: "button",
            class: "text-xs py-1 px-3 border border-gray-300 rounded hover:bg-gray-50",
            onClick: _cache[10] || (_cache[10] = ($event) => emit2("cancel"))
          }, " Cancel ")) : createCommentVNode("", true),
          __props.mode === "edit" ? (openBlock(), createElementBlock("button", {
            key: 1,
            type: "button",
            class: "text-xs py-1 px-3 border border-red-300 text-red-700 rounded hover:bg-red-50 ml-auto",
            onClick: onDelete
          }, " Delete node ")) : createCommentVNode("", true)
        ])
      ], 32);
    };
  }
});
const _hoisted_1$a = {
  key: 0,
  class: "w-96 border-l border-gray-200 bg-white flex flex-col min-h-0 shrink-0"
};
const _hoisted_2$a = { class: "px-4 py-3 border-b border-gray-100" };
const _hoisted_3$a = { class: "text-sm font-semibold text-gray-800" };
const _hoisted_4$a = { class: "text-xs text-gray-500" };
const _hoisted_5$a = { class: "flex border-b border-gray-100 text-xs overflow-x-auto" };
const _hoisted_6$9 = ["onClick"];
const _hoisted_7$9 = {
  key: 0,
  class: "flex-1 min-h-0 overflow-auto p-3"
};
const _hoisted_8$9 = {
  key: 1,
  class: "flex-1 flex flex-col min-h-0 p-3 gap-2"
};
const _hoisted_9$7 = { class: "flex flex-wrap gap-2" };
const _hoisted_10$7 = ["disabled"];
const _hoisted_11$6 = {
  key: 0,
  class: "text-xs text-amber-700"
};
const _hoisted_12$6 = { class: "flex-1 text-xs font-mono bg-gray-900 text-gray-100 p-2 rounded overflow-auto m-0 min-h-32" };
const _hoisted_13$6 = { key: 1 };
const _hoisted_14$5 = { class: "text-xs space-y-1 max-h-24 overflow-auto" };
const _hoisted_15$5 = ["onClick"];
const _hoisted_16$5 = {
  key: 0,
  class: "text-xs font-mono text-gray-500"
};
const _hoisted_17$4 = ["href"];
const _hoisted_18$4 = {
  key: 2,
  class: "flex-1 flex flex-col min-h-0 p-3 gap-2"
};
const _hoisted_19$3 = { class: "flex items-center gap-2" };
const _hoisted_20$3 = ["disabled"];
const _hoisted_21$3 = {
  key: 0,
  class: "text-xs text-amber-700"
};
const _hoisted_22$3 = { class: "flex-1 text-xs font-mono bg-gray-50 border border-gray-200 p-2 rounded overflow-auto m-0 min-h-24" };
const _hoisted_23$3 = {
  key: 1,
  class: "border-t pt-2 mt-1"
};
const _hoisted_24$2 = { class: "block text-xs text-gray-600 mb-1" };
const _hoisted_25$2 = ["value"];
const _hoisted_26$2 = { class: "block text-xs text-gray-600 mb-1" };
const _hoisted_27$2 = ["value"];
const _hoisted_28$2 = { class: "block text-xs text-gray-600" };
const _hoisted_29$2 = ["value"];
const _hoisted_30$1 = ["href"];
const _hoisted_31$1 = {
  key: 3,
  class: "border-t pt-2 mt-1"
};
const _hoisted_32$1 = { class: "block text-xs text-gray-600" };
const _hoisted_33 = ["value"];
const _hoisted_34 = {
  key: 3,
  class: "flex-1 flex flex-col min-h-0 p-3 gap-2"
};
const _hoisted_35 = { class: "text-xs text-gray-600" };
const _hoisted_36 = ["value"];
const _hoisted_37 = { class: "text-xs text-gray-600" };
const _hoisted_38 = ["disabled"];
const _hoisted_39 = { class: "flex-1 text-xs font-mono bg-gray-900 text-gray-100 p-2 rounded overflow-auto m-0 min-h-24" };
const _hoisted_40 = {
  key: 1,
  class: "text-sm text-gray-600"
};
const _hoisted_41 = {
  key: 4,
  class: "flex-1 flex flex-col min-h-0 p-3 gap-2"
};
const _hoisted_42 = { class: "flex items-center gap-2 text-xs text-gray-700" };
const _hoisted_43 = ["disabled"];
const _hoisted_44 = {
  key: 0,
  class: "text-xs text-red-600"
};
const _hoisted_45 = { class: "flex-1 text-xs font-mono bg-gray-50 border border-gray-200 p-2 rounded overflow-auto m-0 min-h-24" };
const _hoisted_46 = {
  key: 1,
  class: "text-sm text-gray-600"
};
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "TopologyNodeDrawer",
  props: {
    node: {},
    ops: {}
  },
  emits: ["update:ops", "update:node", "delete:node"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const opsApi = useTopologyOps();
    const activeTab = /* @__PURE__ */ ref("config");
    const logContent = /* @__PURE__ */ ref("");
    const logError2 = /* @__PURE__ */ ref(null);
    const logLoading = /* @__PURE__ */ ref(false);
    const following = /* @__PURE__ */ ref(false);
    const filter = /* @__PURE__ */ ref("");
    const historyFiles = /* @__PURE__ */ ref([]);
    let stopFollow = null;
    const statusOutput = /* @__PURE__ */ ref("");
    const statusError = /* @__PURE__ */ ref(null);
    const statusLoading = /* @__PURE__ */ ref(false);
    const statusReachable = /* @__PURE__ */ ref(null);
    const terminalHostRef = /* @__PURE__ */ ref("");
    const terminalCommand = /* @__PURE__ */ ref("");
    const terminalOutput = /* @__PURE__ */ ref("");
    const terminalLoading = /* @__PURE__ */ ref(false);
    const deployConfirm = /* @__PURE__ */ ref(false);
    const deployOutput = /* @__PURE__ */ ref("");
    const deployLoading = /* @__PURE__ */ ref(false);
    const deployError = /* @__PURE__ */ ref(null);
    const selectedHost = computed(() => {
      if (!props.node?.access?.hostRef || !props.ops) return null;
      return props.ops.hosts.find((h) => h.id === props.node.access.hostRef) ?? null;
    });
    const externalLogUrl = computed(() => {
      return props.node?.access?.logUrl ?? props.ops?.logPolicy.externalLogUrl ?? null;
    });
    function patchHost(field, value) {
      if (!props.ops || !props.node?.access?.hostRef) return;
      const hosts = props.ops.hosts.map(
        (h) => h.id === props.node.access.hostRef ? { ...h, [field]: value } : h
      );
      emit2("update:ops", { ...props.ops, hosts });
    }
    function patchExternalLogUrl(value) {
      if (!props.ops) return;
      emit2("update:ops", {
        ...props.ops,
        logPolicy: {
          ...props.ops.logPolicy,
          externalLogUrl: value.trim() || null
        }
      });
    }
    async function refreshHistory() {
      if (!props.node) {
        historyFiles.value = [];
        return;
      }
      const { files } = await opsApi.listLogFiles(props.node.id);
      historyFiles.value = files;
    }
    async function loadSnapshot() {
      if (!props.node) return;
      logLoading.value = true;
      logError2.value = null;
      try {
        const result = await opsApi.fetchLogSnapshot(props.node.id);
        logContent.value = result.content;
        if (result.error) logError2.value = result.error;
        await refreshHistory();
      } catch (err) {
        logError2.value = err instanceof Error ? err.message : String(err);
      } finally {
        logLoading.value = false;
      }
    }
    function startFollow() {
      if (!props.node || following.value) return;
      following.value = true;
      logError2.value = null;
      stopFollow = opsApi.followLogs(props.node.id, {
        onChunk: (text) => {
          logContent.value += text;
        },
        onError: (message) => {
          logError2.value = message;
        },
        onDone: () => {
          following.value = false;
        }
      });
    }
    function stopFollowing() {
      stopFollow?.();
      stopFollow = null;
      following.value = false;
    }
    async function openHistory(path) {
      const { content } = await opsApi.readLogFile(path);
      logContent.value = content;
      logError2.value = null;
    }
    async function loadStatus() {
      if (!props.node) return;
      statusLoading.value = true;
      statusError.value = null;
      try {
        const result = await opsApi.fetchNodeStatus(props.node.id);
        statusOutput.value = result.output;
        statusReachable.value = result.reachable;
        if (result.error) statusError.value = result.error;
      } catch (err) {
        statusError.value = err instanceof Error ? err.message : String(err);
      } finally {
        statusLoading.value = false;
      }
    }
    async function runTerminal() {
      if (!terminalHostRef.value.trim() || !terminalCommand.value.trim()) return;
      terminalLoading.value = true;
      terminalOutput.value = "";
      try {
        const result = await opsApi.sshExec(terminalHostRef.value.trim(), terminalCommand.value.trim());
        terminalOutput.value = result.output;
        if (result.error) terminalOutput.value += `
[exit ${result.exitCode}] ${result.error}`;
      } catch (err) {
        terminalOutput.value = err instanceof Error ? err.message : String(err);
      } finally {
        terminalLoading.value = false;
      }
    }
    async function runDeploy() {
      if (!props.node || !deployConfirm.value) return;
      deployLoading.value = true;
      deployError.value = null;
      deployOutput.value = "";
      try {
        const result = await opsApi.deployNode(props.node.id);
        deployOutput.value = result.output;
        if (result.error) deployError.value = result.error;
        if (result.logFile) await refreshHistory();
      } catch (err) {
        deployError.value = err instanceof Error ? err.message : String(err);
      } finally {
        deployLoading.value = false;
      }
    }
    const filteredLog = () => {
      const text = logContent.value;
      const q2 = filter.value.trim();
      if (!q2) return text;
      return text.split("\n").filter((line) => line.includes(q2)).join("\n");
    };
    watch(
      () => props.node?.id,
      () => {
        stopFollowing();
        activeTab.value = "config";
        logContent.value = "";
        logError2.value = null;
        filter.value = "";
        statusOutput.value = "";
        statusError.value = null;
        statusReachable.value = null;
        deployConfirm.value = false;
        deployOutput.value = "";
        deployError.value = null;
        terminalHostRef.value = props.node?.access?.hostRef ?? "";
        terminalCommand.value = "";
        terminalOutput.value = "";
        void refreshHistory();
      },
      { immediate: true }
    );
    watch(activeTab, (tab) => {
      if (tab === "status" && props.node) void loadStatus();
    });
    return (_ctx, _cache) => {
      return __props.node ? (openBlock(), createElementBlock("aside", _hoisted_1$a, [
        createBaseVNode("div", _hoisted_2$a, [
          createBaseVNode("h3", _hoisted_3$a, toDisplayString(__props.node.id), 1),
          createBaseVNode("p", _hoisted_4$a, toDisplayString(__props.node.access?.mode ?? __props.node.kind), 1)
        ]),
        createBaseVNode("div", _hoisted_5$a, [
          (openBlock(), createElementBlock(Fragment, null, renderList(["config", "logs", "status", "terminal", "deploy"], (tab) => {
            return createBaseVNode("button", {
              key: tab,
              class: normalizeClass(["px-3 py-2 whitespace-nowrap capitalize", activeTab.value === tab ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"]),
              onClick: ($event) => activeTab.value = tab
            }, toDisplayString(tab), 11, _hoisted_6$9);
          }), 64))
        ]),
        activeTab.value === "config" ? (openBlock(), createElementBlock("div", _hoisted_7$9, [
          createVNode(_sfc_main$c, {
            mode: "edit",
            node: __props.node,
            ops: __props.ops,
            onSubmit: _cache[0] || (_cache[0] = (n) => emit2("update:node", n)),
            onDelete: _cache[1] || (_cache[1] = ($event) => emit2("delete:node"))
          }, null, 8, ["node", "ops"])
        ])) : activeTab.value === "logs" ? (openBlock(), createElementBlock("div", _hoisted_8$9, [
          __props.node.access?.mode === "host-ssh" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createBaseVNode("div", _hoisted_9$7, [
              createBaseVNode("button", {
                class: "btn-primary text-xs py-1 px-2",
                disabled: logLoading.value || following.value,
                onClick: loadSnapshot
              }, toDisplayString(logLoading.value ? "Fetching…" : "Snapshot"), 9, _hoisted_10$7),
              !following.value ? (openBlock(), createElementBlock("button", {
                key: 0,
                class: "text-xs py-1 px-2 border border-gray-300 rounded hover:bg-gray-50",
                onClick: startFollow
              }, " Follow ")) : (openBlock(), createElementBlock("button", {
                key: 1,
                class: "text-xs py-1 px-2 border border-red-300 text-red-700 rounded hover:bg-red-50",
                onClick: stopFollowing
              }, " Stop ")),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filter.value = $event),
                class: "input-field text-xs flex-1 min-w-24 py-1",
                placeholder: "Filter lines…"
              }, null, 512), [
                [vModelText, filter.value]
              ])
            ]),
            logError2.value ? (openBlock(), createElementBlock("p", _hoisted_11$6, toDisplayString(logError2.value), 1)) : createCommentVNode("", true),
            createBaseVNode("pre", _hoisted_12$6, toDisplayString(filteredLog() || "No log content yet."), 1),
            historyFiles.value.length ? (openBlock(), createElementBlock("div", _hoisted_13$6, [
              _cache[10] || (_cache[10] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "History", -1)),
              createBaseVNode("ul", _hoisted_14$5, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(historyFiles.value, (file) => {
                  return openBlock(), createElementBlock("li", {
                    key: file.path
                  }, [
                    createBaseVNode("button", {
                      class: "text-blue-600 hover:underline text-left",
                      onClick: ($event) => openHistory(file.path)
                    }, toDisplayString(file.name), 9, _hoisted_15$5)
                  ]);
                }), 128))
              ])
            ])) : createCommentVNode("", true)
          ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            _cache[11] || (_cache[11] = createBaseVNode("p", { class: "text-sm text-gray-600" }, " Managed instance — use resource-instances.yaml for connection details. ", -1)),
            __props.node.access?.instanceRef ? (openBlock(), createElementBlock("p", _hoisted_16$5, " instanceRef: " + toDisplayString(__props.node.access.instanceRef), 1)) : createCommentVNode("", true),
            externalLogUrl.value ? (openBlock(), createElementBlock("a", {
              key: 1,
              href: externalLogUrl.value,
              target: "_blank",
              rel: "noopener",
              class: "text-xs text-blue-600 hover:underline"
            }, " Open external logs (Grafana/Loki) ", 8, _hoisted_17$4)) : createCommentVNode("", true)
          ], 64))
        ])) : activeTab.value === "status" ? (openBlock(), createElementBlock("div", _hoisted_18$4, [
          createBaseVNode("div", _hoisted_19$3, [
            createBaseVNode("button", {
              class: "btn-primary text-xs py-1 px-2",
              disabled: statusLoading.value,
              onClick: loadStatus
            }, toDisplayString(statusLoading.value ? "Checking…" : "Refresh"), 9, _hoisted_20$3),
            statusReachable.value !== null ? (openBlock(), createElementBlock("span", {
              key: 0,
              class: normalizeClass(["text-xs px-2 py-0.5 rounded", statusReachable.value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"])
            }, toDisplayString(statusReachable.value ? "Reachable" : "Unreachable"), 3)) : createCommentVNode("", true)
          ]),
          statusError.value ? (openBlock(), createElementBlock("p", _hoisted_21$3, toDisplayString(statusError.value), 1)) : createCommentVNode("", true),
          createBaseVNode("pre", _hoisted_22$3, toDisplayString(statusOutput.value || "No status yet."), 1),
          __props.node.access?.mode === "host-ssh" && selectedHost.value && __props.ops ? (openBlock(), createElementBlock("div", _hoisted_23$3, [
            _cache[15] || (_cache[15] = createBaseVNode("p", { class: "text-[10px] uppercase text-gray-500 mb-1" }, "Host (ops.yaml)", -1)),
            createBaseVNode("label", _hoisted_24$2, [
              _cache[12] || (_cache[12] = createTextVNode(" Host ", -1)),
              createBaseVNode("input", {
                class: "input-field w-full text-xs mt-0.5",
                value: selectedHost.value.host ?? "",
                onInput: _cache[3] || (_cache[3] = ($event) => patchHost("host", $event.target.value))
              }, null, 40, _hoisted_25$2)
            ]),
            createBaseVNode("label", _hoisted_26$2, [
              _cache[13] || (_cache[13] = createTextVNode(" User ", -1)),
              createBaseVNode("input", {
                class: "input-field w-full text-xs mt-0.5",
                value: selectedHost.value.user ?? "",
                onInput: _cache[4] || (_cache[4] = ($event) => patchHost("user", $event.target.value))
              }, null, 40, _hoisted_27$2)
            ]),
            createBaseVNode("label", _hoisted_28$2, [
              _cache[14] || (_cache[14] = createTextVNode(" Port ", -1)),
              createBaseVNode("input", {
                type: "number",
                class: "input-field w-full text-xs mt-0.5",
                value: selectedHost.value.port ?? 22,
                onInput: _cache[5] || (_cache[5] = ($event) => patchHost("port", Number($event.target.value)))
              }, null, 40, _hoisted_29$2)
            ])
          ])) : createCommentVNode("", true),
          externalLogUrl.value ? (openBlock(), createElementBlock("a", {
            key: 2,
            href: externalLogUrl.value,
            target: "_blank",
            rel: "noopener",
            class: "text-xs text-blue-600 hover:underline mt-auto"
          }, " Open external logs ", 8, _hoisted_30$1)) : createCommentVNode("", true),
          __props.ops ? (openBlock(), createElementBlock("div", _hoisted_31$1, [
            createBaseVNode("label", _hoisted_32$1, [
              _cache[16] || (_cache[16] = createTextVNode(" Global externalLogUrl (ops.yaml) ", -1)),
              createBaseVNode("input", {
                class: "input-field w-full text-xs mt-0.5 font-mono",
                value: __props.ops.logPolicy.externalLogUrl ?? "",
                placeholder: "https://grafana.example.com/...",
                onInput: _cache[6] || (_cache[6] = ($event) => patchExternalLogUrl($event.target.value))
              }, null, 40, _hoisted_33)
            ])
          ])) : createCommentVNode("", true)
        ])) : activeTab.value === "terminal" ? (openBlock(), createElementBlock("div", _hoisted_34, [
          __props.node.access?.mode === "host-ssh" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createBaseVNode("label", _hoisted_35, [
              _cache[17] || (_cache[17] = createTextVNode(" Host ref ", -1)),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => terminalHostRef.value = $event),
                class: "input-field w-full text-xs mt-0.5"
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(__props.ops?.hosts ?? [], (h) => {
                  return openBlock(), createElementBlock("option", {
                    key: h.id,
                    value: h.id
                  }, toDisplayString(h.id), 9, _hoisted_36);
                }), 128))
              ], 512), [
                [vModelSelect, terminalHostRef.value]
              ])
            ]),
            createBaseVNode("label", _hoisted_37, [
              _cache[18] || (_cache[18] = createTextVNode(" Command ", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => terminalCommand.value = $event),
                class: "input-field w-full text-xs mt-0.5 font-mono",
                placeholder: "docker ps",
                onKeyup: withKeys(runTerminal, ["enter"])
              }, null, 544), [
                [vModelText, terminalCommand.value]
              ])
            ]),
            createBaseVNode("button", {
              class: "btn-primary text-xs py-1 px-2 self-start",
              disabled: terminalLoading.value || !terminalCommand.value.trim(),
              onClick: runTerminal
            }, toDisplayString(terminalLoading.value ? "Running…" : "Run"), 9, _hoisted_38),
            createBaseVNode("pre", _hoisted_39, toDisplayString(terminalOutput.value || "Output will appear here."), 1)
          ], 64)) : (openBlock(), createElementBlock("p", _hoisted_40, "Terminal available for host-ssh nodes only."))
        ])) : (openBlock(), createElementBlock("div", _hoisted_41, [
          __props.node.access?.mode === "host-ssh" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
            createBaseVNode("label", _hoisted_42, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => deployConfirm.value = $event),
                type: "checkbox"
              }, null, 512), [
                [vModelCheckbox, deployConfirm.value]
              ]),
              _cache[19] || (_cache[19] = createTextVNode(" I confirm deploy to this node ", -1))
            ]),
            createBaseVNode("button", {
              class: "btn-primary text-xs py-1 px-2 self-start",
              disabled: !deployConfirm.value || deployLoading.value,
              onClick: runDeploy
            }, toDisplayString(deployLoading.value ? "Deploying…" : "Deploy node"), 9, _hoisted_43),
            deployError.value ? (openBlock(), createElementBlock("p", _hoisted_44, toDisplayString(deployError.value), 1)) : createCommentVNode("", true),
            createBaseVNode("pre", _hoisted_45, toDisplayString(deployOutput.value || "Deploy output will appear here."), 1)
          ], 64)) : (openBlock(), createElementBlock("p", _hoisted_46, "Deploy available for host-ssh nodes only."))
        ]))
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$9 = { class: "border-t border-gray-200 bg-gray-50 shrink-0" };
const _hoisted_2$9 = {
  key: 0,
  class: "max-h-36 overflow-auto px-4 pb-2"
};
const _hoisted_3$9 = {
  key: 0,
  class: "text-xs text-red-600"
};
const _hoisted_4$9 = {
  key: 1,
  class: "text-xs text-gray-400"
};
const _hoisted_5$9 = {
  key: 2,
  class: "text-xs text-gray-400"
};
const _hoisted_6$8 = {
  key: 3,
  class: "text-[11px] font-mono space-y-1"
};
const _hoisted_7$8 = { class: "text-gray-400" };
const _hoisted_8$8 = {
  key: 0,
  class: "text-blue-700"
};
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "TopologyAuditPanel",
  setup(__props, { expose: __expose }) {
    const opsApi = useTopologyOps();
    const entries = /* @__PURE__ */ ref([]);
    const loading = /* @__PURE__ */ ref(false);
    const error = /* @__PURE__ */ ref(null);
    const open = /* @__PURE__ */ ref(false);
    async function refresh() {
      loading.value = true;
      error.value = null;
      try {
        const { entries: list } = await opsApi.listAudit(30);
        entries.value = list;
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      void refresh();
    });
    __expose({ refresh });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$9, [
        createBaseVNode("button", {
          class: "w-full px-4 py-1.5 text-xs text-gray-600 flex items-center justify-between hover:bg-gray-100",
          onClick: _cache[0] || (_cache[0] = ($event) => open.value = !open.value)
        }, [
          createBaseVNode("span", null, "Ops audit (" + toDisplayString(entries.value.length) + ")", 1),
          createBaseVNode("span", null, toDisplayString(open.value ? "▾" : "▸"), 1)
        ]),
        open.value ? (openBlock(), createElementBlock("div", _hoisted_2$9, [
          createBaseVNode("div", { class: "flex justify-end mb-1" }, [
            createBaseVNode("button", {
              class: "text-[10px] text-blue-600 hover:underline",
              onClick: refresh
            }, "Refresh")
          ]),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_3$9, toDisplayString(error.value), 1)) : loading.value ? (openBlock(), createElementBlock("p", _hoisted_4$9, "Loading…")) : !entries.value.length ? (openBlock(), createElementBlock("p", _hoisted_5$9, "No audit entries yet.")) : (openBlock(), createElementBlock("ul", _hoisted_6$8, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(entries.value, (entry, idx) => {
              return openBlock(), createElementBlock("li", {
                key: `${entry.ts}-${idx}`,
                class: "text-gray-700"
              }, [
                createBaseVNode("span", _hoisted_7$8, toDisplayString(entry.ts.slice(0, 19)), 1),
                createTextVNode(" " + toDisplayString(entry.action) + " ", 1),
                entry.node ? (openBlock(), createElementBlock("span", _hoisted_8$8, toDisplayString(entry.node), 1)) : createCommentVNode("", true),
                entry.exitCode != null ? (openBlock(), createElementBlock("span", {
                  key: 1,
                  class: normalizeClass(entry.exitCode === 0 ? "text-green-700" : "text-red-600")
                }, " exit=" + toDisplayString(entry.exitCode), 3)) : createCommentVNode("", true)
              ]);
            }), 128))
          ]))
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1$8 = { class: "flex flex-1 min-h-0 flex-col" };
const _hoisted_2$8 = { class: "px-4 py-2 border-b border-gray-200 bg-white flex items-center gap-3" };
const _hoisted_3$8 = ["disabled"];
const _hoisted_4$8 = ["disabled"];
const _hoisted_5$8 = ["disabled"];
const _hoisted_6$7 = {
  key: 0,
  class: "text-xs text-green-700 bg-green-50 px-4 py-1"
};
const _hoisted_7$7 = {
  key: 1,
  class: "text-xs text-green-700 bg-green-50 px-4 py-1"
};
const _hoisted_8$7 = {
  key: 2,
  class: "text-xs text-green-700 bg-green-50 px-4 py-1"
};
const _hoisted_9$6 = {
  key: 3,
  class: "text-xs text-red-600 bg-red-50 px-4 py-1"
};
const _hoisted_10$6 = {
  key: 4,
  class: "flex-1 flex items-center justify-center text-sm text-gray-400"
};
const _hoisted_11$5 = {
  key: 5,
  class: "flex flex-1 min-h-0 flex-col"
};
const _hoisted_12$5 = { class: "flex flex-1 min-h-0" };
const _hoisted_13$5 = { class: "bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-4 max-h-[90vh] overflow-auto" };
const _hoisted_14$4 = { class: "bg-white rounded-lg shadow-lg p-4 w-full max-w-sm mx-4" };
const _hoisted_15$4 = { class: "text-xs text-gray-600 mb-3" };
const _hoisted_16$4 = { class: "font-mono" };
const _hoisted_17$3 = { class: "flex justify-end gap-2" };
const _hoisted_18$3 = { class: "bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-4" };
const _hoisted_19$2 = { class: "flex items-center gap-2 text-xs text-gray-700 mb-3" };
const _hoisted_20$2 = {
  key: 0,
  class: "text-xs text-red-600 mb-2"
};
const _hoisted_21$2 = {
  key: 1,
  class: "text-xs font-mono bg-gray-50 border p-2 rounded max-h-32 overflow-auto mb-3"
};
const _hoisted_22$2 = { class: "flex justify-end gap-2" };
const _hoisted_23$2 = ["disabled"];
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "TopologyCanvas",
  props: {
    workspace: {}
  },
  setup(__props) {
    const opsApi = useTopologyOps();
    const topology = /* @__PURE__ */ ref(null);
    const ops = /* @__PURE__ */ ref(null);
    const selectedId = /* @__PURE__ */ ref(null);
    const loading = /* @__PURE__ */ ref(true);
    const saving = /* @__PURE__ */ ref(false);
    const error = /* @__PURE__ */ ref(null);
    const saveMessage = /* @__PURE__ */ ref(null);
    const bootstrapMessage = /* @__PURE__ */ ref(null);
    const showDeployAll = /* @__PURE__ */ ref(false);
    const deployAllConfirm = /* @__PURE__ */ ref(false);
    const deployAllLoading = /* @__PURE__ */ ref(false);
    const deployAllOutput = /* @__PURE__ */ ref("");
    const deployAllError = /* @__PURE__ */ ref(null);
    const syncing = /* @__PURE__ */ ref(false);
    const syncMessage = /* @__PURE__ */ ref(null);
    const auditPanel = /* @__PURE__ */ ref(null);
    const showAddNode = /* @__PURE__ */ ref(false);
    const pendingDeleteId = /* @__PURE__ */ ref(null);
    const selectedNode = () => {
      if (!selectedId.value || !topology.value) return null;
      return topology.value.nodes.find((n) => n.id === selectedId.value) ?? null;
    };
    async function load() {
      loading.value = true;
      error.value = null;
      bootstrapMessage.value = null;
      saveMessage.value = null;
      try {
        const bundle = await opsApi.bootstrapOps();
        topology.value = bundle.topology;
        ops.value = bundle.ops;
        if (bundle.created.topology || bundle.created.ops) {
          const parts = [];
          if (bundle.created.topology) parts.push("topology.yaml");
          if (bundle.created.ops) parts.push("ops.yaml");
          bootstrapMessage.value = `已创建 .agentflow/${parts.join("、")}`;
        }
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    async function save() {
      if (!topology.value || !ops.value) return;
      saving.value = true;
      saveMessage.value = null;
      error.value = null;
      try {
        await opsApi.saveOps(topology.value, ops.value);
        saveMessage.value = "Saved topology.yaml & ops.yaml";
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        saving.value = false;
      }
    }
    function onOpsUpdate(next) {
      ops.value = next;
    }
    function onNodeAdd(node) {
      if (!topology.value || !ops.value) return;
      if (topology.value.nodes.some((n) => n.id === node.id)) {
        error.value = `Node "${node.id}" already exists`;
        return;
      }
      topology.value = {
        ...topology.value,
        nodes: [...topology.value.nodes, node]
      };
      ops.value = ensureOpsPlaceholders(ops.value, node);
      selectedId.value = node.id;
      showAddNode.value = false;
      error.value = null;
      saveMessage.value = null;
    }
    function onNodeUpdate(node) {
      if (!topology.value || !ops.value || !selectedId.value) return;
      topology.value = {
        ...topology.value,
        nodes: upsertNode(topology.value.nodes, node, selectedId.value)
      };
      ops.value = ensureOpsPlaceholders(ops.value, node);
      selectedId.value = node.id;
      error.value = null;
      saveMessage.value = null;
    }
    function requestDeleteNode(nodeId) {
      pendingDeleteId.value = nodeId;
    }
    function confirmDeleteNode() {
      if (!topology.value || !pendingDeleteId.value) return;
      const nodeId = pendingDeleteId.value;
      const { nodes, edges } = removeNodeFromTopology(
        topology.value.nodes,
        topology.value.edges,
        nodeId
      );
      topology.value = { ...topology.value, nodes, edges };
      if (selectedId.value === nodeId) selectedId.value = null;
      pendingDeleteId.value = null;
      error.value = null;
      saveMessage.value = null;
    }
    async function runDeployAll() {
      if (!deployAllConfirm.value) return;
      deployAllLoading.value = true;
      deployAllError.value = null;
      deployAllOutput.value = "";
      try {
        const result = await opsApi.deployAll();
        deployAllOutput.value = result.output;
        if (result.error) deployAllError.value = result.error;
        else showDeployAll.value = false;
        void auditPanel.value?.refresh();
      } catch (err) {
        deployAllError.value = err instanceof Error ? err.message : String(err);
      } finally {
        deployAllLoading.value = false;
      }
    }
    async function syncToServer() {
      syncing.value = true;
      syncMessage.value = null;
      error.value = null;
      try {
        await opsApi.syncToServer();
        syncMessage.value = "Synced topology to Resource Server (access fields stripped)";
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        syncing.value = false;
      }
    }
    onMounted(() => {
      void load();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$8, [
        createBaseVNode("div", _hoisted_2$8, [
          _cache[12] || (_cache[12] = createBaseVNode("h2", { class: "text-sm font-semibold text-gray-800" }, "Topology", -1)),
          createBaseVNode("button", {
            class: "text-xs py-1 px-2 border border-blue-400 text-blue-700 rounded hover:bg-blue-50",
            disabled: !topology.value,
            onClick: _cache[0] || (_cache[0] = ($event) => showAddNode.value = true)
          }, " + Add node ", 8, _hoisted_3$8),
          createBaseVNode("button", {
            class: "text-xs py-1 px-2 border border-gray-300 rounded hover:bg-gray-50",
            disabled: saving.value || !topology.value,
            onClick: save
          }, toDisplayString(saving.value ? "Saving…" : "Save"), 9, _hoisted_4$8),
          createBaseVNode("button", {
            class: "text-xs py-1 px-2 border border-gray-300 rounded hover:bg-gray-50",
            disabled: syncing.value || !topology.value,
            onClick: syncToServer
          }, toDisplayString(syncing.value ? "Syncing…" : "Sync to Server"), 9, _hoisted_5$8),
          createBaseVNode("button", {
            class: "text-xs py-1 px-2 border border-amber-400 text-amber-800 rounded hover:bg-amber-50",
            onClick: _cache[1] || (_cache[1] = ($event) => showDeployAll.value = true)
          }, " Deploy All "),
          createBaseVNode("button", {
            class: "text-xs text-gray-500 hover:text-gray-700 ml-auto",
            onClick: load
          }, "Refresh")
        ]),
        bootstrapMessage.value ? (openBlock(), createElementBlock("p", _hoisted_6$7, toDisplayString(bootstrapMessage.value), 1)) : createCommentVNode("", true),
        saveMessage.value ? (openBlock(), createElementBlock("p", _hoisted_7$7, toDisplayString(saveMessage.value), 1)) : createCommentVNode("", true),
        syncMessage.value ? (openBlock(), createElementBlock("p", _hoisted_8$7, toDisplayString(syncMessage.value), 1)) : createCommentVNode("", true),
        error.value ? (openBlock(), createElementBlock("p", _hoisted_9$6, toDisplayString(error.value), 1)) : createCommentVNode("", true),
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_10$6, " Loading topology… ")) : (openBlock(), createElementBlock("div", _hoisted_11$5, [
          createBaseVNode("div", _hoisted_12$5, [
            topology.value ? (openBlock(), createBlock(_sfc_main$d, {
              key: 0,
              nodes: topology.value.nodes,
              edges: topology.value.edges,
              "selected-id": selectedId.value,
              onSelect: _cache[2] || (_cache[2] = ($event) => selectedId.value = $event),
              onAdd: _cache[3] || (_cache[3] = ($event) => showAddNode.value = true)
            }, null, 8, ["nodes", "edges", "selected-id"])) : createCommentVNode("", true),
            createVNode(_sfc_main$b, {
              node: selectedNode(),
              ops: ops.value,
              "onUpdate:ops": onOpsUpdate,
              "onUpdate:node": onNodeUpdate,
              "onDelete:node": _cache[4] || (_cache[4] = () => {
                if (selectedId.value) requestDeleteNode(selectedId.value);
              })
            }, null, 8, ["node", "ops"])
          ]),
          createVNode(_sfc_main$a, {
            ref_key: "auditPanel",
            ref: auditPanel
          }, null, 512)
        ])),
        showAddNode.value ? (openBlock(), createElementBlock("div", {
          key: 6,
          class: "fixed inset-0 bg-black/30 flex items-center justify-center z-50",
          onClick: _cache[6] || (_cache[6] = withModifiers(($event) => showAddNode.value = false, ["self"]))
        }, [
          createBaseVNode("div", _hoisted_13$5, [
            _cache[13] || (_cache[13] = createBaseVNode("h3", { class: "text-sm font-semibold text-gray-800 mb-3" }, "Add node", -1)),
            createVNode(_sfc_main$c, {
              mode: "create",
              ops: ops.value,
              onSubmit: onNodeAdd,
              onCancel: _cache[5] || (_cache[5] = ($event) => showAddNode.value = false)
            }, null, 8, ["ops"])
          ])
        ])) : createCommentVNode("", true),
        pendingDeleteId.value ? (openBlock(), createElementBlock("div", {
          key: 7,
          class: "fixed inset-0 bg-black/30 flex items-center justify-center z-50",
          onClick: _cache[8] || (_cache[8] = withModifiers(($event) => pendingDeleteId.value = null, ["self"]))
        }, [
          createBaseVNode("div", _hoisted_14$4, [
            _cache[16] || (_cache[16] = createBaseVNode("h3", { class: "text-sm font-semibold text-gray-800 mb-2" }, "Delete node", -1)),
            createBaseVNode("p", _hoisted_15$4, [
              _cache[14] || (_cache[14] = createTextVNode(" Remove ", -1)),
              createBaseVNode("code", _hoisted_16$4, toDisplayString(pendingDeleteId.value), 1),
              _cache[15] || (_cache[15] = createTextVNode(" and any edges connected to it? Click Save to persist to topology.yaml. ", -1))
            ]),
            createBaseVNode("div", _hoisted_17$3, [
              createBaseVNode("button", {
                class: "text-xs py-1 px-3 border border-gray-300 rounded",
                onClick: _cache[7] || (_cache[7] = ($event) => pendingDeleteId.value = null)
              }, " Cancel "),
              createBaseVNode("button", {
                class: "text-xs py-1 px-3 border border-red-400 text-red-700 rounded hover:bg-red-50",
                onClick: confirmDeleteNode
              }, " Delete ")
            ])
          ])
        ])) : createCommentVNode("", true),
        showDeployAll.value ? (openBlock(), createElementBlock("div", {
          key: 8,
          class: "fixed inset-0 bg-black/30 flex items-center justify-center z-50",
          onClick: _cache[11] || (_cache[11] = withModifiers(($event) => showDeployAll.value = false, ["self"]))
        }, [
          createBaseVNode("div", _hoisted_18$3, [
            _cache[18] || (_cache[18] = createBaseVNode("h3", { class: "text-sm font-semibold text-gray-800 mb-2" }, "Deploy All", -1)),
            _cache[19] || (_cache[19] = createBaseVNode("p", { class: "text-xs text-gray-600 mb-3" }, [
              createTextVNode(" Runs "),
              createBaseVNode("code", { class: "text-gray-800" }, "deployAll"),
              createTextVNode(" from ops.yaml over SSH. ")
            ], -1)),
            createBaseVNode("label", _hoisted_19$2, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => deployAllConfirm.value = $event),
                type: "checkbox"
              }, null, 512), [
                [vModelCheckbox, deployAllConfirm.value]
              ]),
              _cache[17] || (_cache[17] = createTextVNode(" I confirm deploy to all services ", -1))
            ]),
            deployAllError.value ? (openBlock(), createElementBlock("p", _hoisted_20$2, toDisplayString(deployAllError.value), 1)) : createCommentVNode("", true),
            deployAllOutput.value ? (openBlock(), createElementBlock("pre", _hoisted_21$2, toDisplayString(deployAllOutput.value), 1)) : createCommentVNode("", true),
            createBaseVNode("div", _hoisted_22$2, [
              createBaseVNode("button", {
                class: "text-xs py-1 px-3 border border-gray-300 rounded",
                onClick: _cache[10] || (_cache[10] = ($event) => showDeployAll.value = false)
              }, " Cancel "),
              createBaseVNode("button", {
                class: "btn-primary text-xs py-1 px-3",
                disabled: !deployAllConfirm.value || deployAllLoading.value,
                onClick: runDeployAll
              }, toDisplayString(deployAllLoading.value ? "Deploying…" : "Deploy"), 9, _hoisted_23$2)
            ])
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
function formatFileForChat(path, content) {
  return `--- ${path} ---
${content}
--- end ${path} ---`;
}
async function expandChatMessage(text, attachments, readFile) {
  const blocks = [];
  for (const a of attachments) {
    const file = await readFile(a.path);
    blocks.push(formatFileForChat(a.path, file.content));
  }
  const trimmed = text.trim();
  if (blocks.length && trimmed) return `${blocks.join("\n\n")}

${trimmed}`;
  if (blocks.length) return blocks.join("\n\n");
  return trimmed;
}
function normalizeWorkspacePath(relPath) {
  return relPath.replace(/\\/g, "/").replace(/^\.\//, "");
}
const WRITE_FILE_OUTPUT_RE = /^Wrote (.+?) \(\d+ bytes\)$/;
function parseWriteFilePath(output) {
  if (!output) return null;
  const m2 = output.match(WRITE_FILE_OUTPUT_RE);
  return m2?.[1]?.trim() ?? null;
}
const _hoisted_1$7 = { class: "w-full max-w-lg h-full bg-white shadow-xl flex flex-col" };
const _hoisted_2$7 = { class: "flex items-center justify-between px-4 py-3 border-b border-gray-200" };
const _hoisted_3$7 = {
  key: 0,
  class: "text-[10px] text-gray-400"
};
const _hoisted_4$7 = {
  key: 0,
  class: "flex-1 p-4 text-xs text-gray-500"
};
const _hoisted_5$7 = {
  key: 1,
  class: "flex-1 overflow-y-auto p-4 space-y-4"
};
const _hoisted_6$6 = { class: "block text-xs" };
const _hoisted_7$6 = { class: "flex gap-2" };
const _hoisted_8$6 = ["onUpdate:modelValue"];
const _hoisted_9$5 = ["onUpdate:modelValue"];
const _hoisted_10$5 = ["onUpdate:modelValue"];
const _hoisted_11$4 = { class: "flex gap-1" };
const _hoisted_12$4 = ["disabled", "onClick"];
const _hoisted_13$4 = ["disabled", "onClick"];
const _hoisted_14$3 = ["onClick"];
const _hoisted_15$3 = { class: "flex flex-wrap gap-2 p-4 border-t border-gray-200" };
const _hoisted_16$3 = ["disabled"];
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowConfigDrawer",
  props: {
    show: { type: Boolean },
    workflow: {},
    definition: {},
    saving: { type: Boolean }
  },
  emits: ["close", "save", "activate", "delete"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const draft = /* @__PURE__ */ ref(null);
    watch(
      () => props.definition,
      (def2) => {
        if (def2) {
          draft.value = JSON.parse(JSON.stringify(def2));
        } else {
          draft.value = null;
        }
      },
      { immediate: true }
    );
    function moveStep(index, delta) {
      if (!draft.value) return;
      const next = index + delta;
      if (next < 0 || next >= draft.value.steps.length) return;
      const steps = [...draft.value.steps];
      const [item] = steps.splice(index, 1);
      steps.splice(next, 0, item);
      draft.value = { ...draft.value, steps };
    }
    function addStep() {
      if (!draft.value) return;
      const n = draft.value.steps.length + 1;
      draft.value = {
        ...draft.value,
        steps: [
          ...draft.value.steps,
          {
            id: `step-${n}`,
            title: `Step ${n}`,
            executor: "deepseek",
            skills: [],
            outputs: []
          }
        ]
      };
    }
    function removeStep(index) {
      if (!draft.value || draft.value.steps.length <= 1) return;
      const steps = draft.value.steps.filter((_2, i) => i !== index);
      draft.value = { ...draft.value, steps };
    }
    function onSave() {
      if (draft.value) {
        emit2("save", draft.value);
      }
    }
    return (_ctx, _cache) => {
      return __props.show ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "fixed inset-0 z-40 flex justify-end bg-black/20",
        onClick: _cache[5] || (_cache[5] = withModifiers(($event) => emit2("close"), ["self"]))
      }, [
        createBaseVNode("div", _hoisted_1$7, [
          createBaseVNode("div", _hoisted_2$7, [
            createBaseVNode("div", null, [
              _cache[6] || (_cache[6] = createBaseVNode("h2", { class: "text-sm font-semibold text-gray-800" }, "Workflow config", -1)),
              __props.workflow ? (openBlock(), createElementBlock("p", _hoisted_3$7, toDisplayString(__props.workflow.id), 1)) : createCommentVNode("", true)
            ]),
            createBaseVNode("button", {
              type: "button",
              class: "text-gray-500 hover:text-gray-800",
              onClick: _cache[0] || (_cache[0] = ($event) => emit2("close"))
            }, " × ")
          ]),
          !draft.value ? (openBlock(), createElementBlock("div", _hoisted_4$7, "Loading…")) : (openBlock(), createElementBlock("div", _hoisted_5$7, [
            createBaseVNode("label", _hoisted_6$6, [
              _cache[7] || (_cache[7] = createBaseVNode("span", { class: "text-gray-500" }, "Title", -1)),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => draft.value.title = $event),
                type: "text",
                class: "mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
              }, null, 512), [
                [vModelText, draft.value.title]
              ])
            ]),
            createBaseVNode("div", null, [
              createBaseVNode("div", { class: "flex items-center justify-between mb-2" }, [
                _cache[8] || (_cache[8] = createBaseVNode("span", { class: "text-xs font-medium text-gray-500 uppercase" }, "Pipeline steps", -1)),
                createBaseVNode("button", {
                  type: "button",
                  class: "text-xs text-blue-600",
                  onClick: addStep
                }, "+ Add")
              ]),
              (openBlock(true), createElementBlock(Fragment, null, renderList(draft.value.steps, (step, index) => {
                return openBlock(), createElementBlock("div", {
                  key: `${step.id}-${index}`,
                  class: "border border-gray-200 rounded p-2 mb-2 space-y-2"
                }, [
                  createBaseVNode("div", _hoisted_7$6, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => step.id = $event,
                      type: "text",
                      placeholder: "id",
                      class: "flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                    }, null, 8, _hoisted_8$6), [
                      [vModelText, step.id]
                    ]),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": ($event) => step.title = $event,
                      type: "text",
                      placeholder: "title",
                      class: "flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                    }, null, 8, _hoisted_9$5), [
                      [vModelText, step.title]
                    ])
                  ]),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": ($event) => step.executor = $event,
                    class: "w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  }, [..._cache[9] || (_cache[9] = [
                    createBaseVNode("option", { value: "deepseek" }, "deepseek", -1),
                    createBaseVNode("option", { value: "claude-code" }, "claude-code", -1)
                  ])], 8, _hoisted_10$5), [
                    [vModelSelect, step.executor]
                  ]),
                  createBaseVNode("div", _hoisted_11$4, [
                    createBaseVNode("button", {
                      type: "button",
                      class: "text-[10px] px-2 py-0.5 border rounded",
                      disabled: index === 0,
                      onClick: ($event) => moveStep(index, -1)
                    }, " ↑ ", 8, _hoisted_12$4),
                    createBaseVNode("button", {
                      type: "button",
                      class: "text-[10px] px-2 py-0.5 border rounded",
                      disabled: index === draft.value.steps.length - 1,
                      onClick: ($event) => moveStep(index, 1)
                    }, " ↓ ", 8, _hoisted_13$4),
                    createBaseVNode("button", {
                      type: "button",
                      class: "text-[10px] px-2 py-0.5 border rounded text-red-600 ml-auto",
                      onClick: ($event) => removeStep(index)
                    }, " Delete ", 8, _hoisted_14$3)
                  ])
                ]);
              }), 128))
            ])
          ])),
          createBaseVNode("div", _hoisted_15$3, [
            createBaseVNode("button", {
              type: "button",
              class: "btn-primary text-xs py-1 px-3 disabled:opacity-50",
              disabled: __props.saving || !draft.value,
              onClick: onSave
            }, " Save ", 8, _hoisted_16$3),
            createBaseVNode("button", {
              type: "button",
              class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50",
              onClick: _cache[2] || (_cache[2] = ($event) => emit2("activate"))
            }, " Set as Active "),
            __props.workflow && !__props.workflow.isLegacy ? (openBlock(), createElementBlock("button", {
              key: 0,
              type: "button",
              class: "text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50",
              onClick: _cache[3] || (_cache[3] = ($event) => emit2("delete"))
            }, " Delete ")) : createCommentVNode("", true),
            createBaseVNode("button", {
              type: "button",
              class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 ml-auto",
              onClick: _cache[4] || (_cache[4] = ($event) => emit2("close"))
            }, " Cancel ")
          ])
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
const WORKSPACE_REGISTRY = [
  {
    type: "markdown-doc",
    label: "Markdown Doc",
    description: "Single document editor and preview",
    category: "docs",
    defaultProps: { docsDir: "docs" },
    propsFields: [{ key: "docsDir", label: "Docs directory", type: "string" }]
  },
  {
    type: "architecture-docs",
    label: "Architecture Docs",
    description: "Multi-tab architecture documentation",
    category: "docs",
    defaultProps: { files: [] },
    propsFields: [{ key: "files", label: "Files", type: "file-list" }]
  },
  {
    type: "code-explorer",
    label: "Code Explorer",
    description: "File tree with view and optional edit",
    category: "code",
    defaultProps: { root: ".", writable: false },
    propsFields: [
      { key: "root", label: "Root path", type: "string", required: true },
      { key: "writable", label: "Writable", type: "boolean" }
    ]
  },
  {
    type: "agent-run",
    label: "Agent Run",
    description: "Gates, phase, and run status panel",
    category: "workflow",
    defaultProps: {},
    propsFields: [{ key: "reportPath", label: "Report path", type: "string" }]
  },
  {
    type: "cicd-config",
    label: "CI/CD Config",
    description: "Deployment and ops summary",
    category: "ops",
    defaultProps: {},
    propsFields: []
  },
  {
    type: "fe-architecture-plan",
    label: "FE Architecture Plan",
    description: "Frontend layered architecture planner",
    category: "frontend",
    defaultProps: { output: "docs/fe-architecture.md", layers: ["pages", "components", "composables"] },
    propsFields: [
      { key: "output", label: "Output file", type: "string", required: true },
      { key: "layers", label: "Layers", type: "string[]", required: true }
    ]
  },
  {
    type: "component-splitter",
    label: "Component Splitter",
    description: "Component tree with skill load and manual edit",
    category: "frontend",
    defaultProps: { output: "docs/components.md", skills: [], editable: true },
    propsFields: [
      { key: "output", label: "Output file", type: "string", required: true },
      { key: "skills", label: "Skills", type: "skills" },
      { key: "editable", label: "Editable", type: "boolean" }
    ]
  },
  {
    type: "agent-rules-editor",
    label: "Agent Rules Editor",
    description: "Edit and add AGENTS.md, CLAUDE.md, and similar agent instruction files",
    category: "frontend",
    defaultProps: {
      files: [
        { path: "AGENTS.md", label: "AGENTS.md" },
        { path: "CLAUDE.md", label: "CLAUDE.md" }
      ],
      editable: true
    },
    propsFields: [
      { key: "files", label: "Files", type: "file-list" },
      { key: "editable", label: "Editable", type: "boolean" }
    ]
  },
  {
    type: "style-tokens-editor",
    label: "Style Tokens Editor",
    description: "UnoCSS or Tailwind-like token editor",
    category: "frontend",
    defaultProps: { preset: "unocss", target: "uno.config.ts" },
    propsFields: [
      { key: "preset", label: "Preset", type: "select", required: true, options: ["unocss", "tailwind"] },
      { key: "target", label: "Target file", type: "string", required: true },
      { key: "themeFile", label: "Theme file", type: "string" }
    ]
  },
  {
    type: "langflow-panel",
    label: "Langflow Panel",
    description: "Embed a Langflow flow for agent execution",
    category: "agent",
    defaultProps: { flowId: "", mode: "run" },
    propsFields: [
      { key: "flowId", label: "Flow", type: "langflow-flow", required: true },
      { key: "mode", label: "Mode", type: "select", required: true, options: ["run"] }
    ]
  }
];
function registryEntry(type) {
  return WORKSPACE_REGISTRY.find((entry) => entry.type === type);
}
const scriptRel = function detectScriptRel() {
  const relList = typeof document !== "undefined" && document.createElement("link").relList;
  return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
}();
const assetsURL = function(dep, importerUrl) {
  return new URL(dep, importerUrl).href;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    const links = document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep, importerUrl);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        const isBaseRelative = !!importerUrl;
        if (isBaseRelative) {
          for (let i = links.length - 1; i >= 0; i--) {
            const link2 = links[i];
            if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
              return;
            }
          }
        } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
const WIDGET_COMPONENTS = {
  "markdown-doc": () => __vitePreload(() => import("./MarkdownDocWidget-mA7Itk8l.js"), true ? __vite__mapDeps([0,1,2]) : void 0, import.meta.url),
  "architecture-docs": () => __vitePreload(() => import("./ArchitectureDocsWidget-BfvZVbJ2.js"), true ? __vite__mapDeps([3,2]) : void 0, import.meta.url),
  "code-explorer": () => __vitePreload(() => import("./CodeExplorerWidget-mliUQ01K.js"), true ? [] : void 0, import.meta.url),
  "agent-run": () => __vitePreload(() => import("./AgentRunWidget-CdYYxGa0.js"), true ? __vite__mapDeps([4,2]) : void 0, import.meta.url),
  "cicd-config": () => __vitePreload(() => import("./CicdConfigWidget-BdeZI44k.js"), true ? [] : void 0, import.meta.url),
  "fe-architecture-plan": () => __vitePreload(() => import("./FeArchitecturePlanWidget--PIhACpc.js"), true ? __vite__mapDeps([5,2]) : void 0, import.meta.url),
  "component-splitter": () => __vitePreload(() => import("./ComponentSplitterWidget-Ckb1rrW9.js"), true ? __vite__mapDeps([6,2]) : void 0, import.meta.url),
  "agent-rules-editor": () => __vitePreload(() => import("./AgentRulesEditorWidget-DnPcGgnk.js"), true ? __vite__mapDeps([7,1,2]) : void 0, import.meta.url),
  "style-tokens-editor": () => __vitePreload(() => import("./StyleTokensEditorWidget-DpE2bLlq.js"), true ? [] : void 0, import.meta.url),
  "langflow-panel": () => __vitePreload(() => import("./LangflowPanelWidget-C37u6LDJ.js"), true ? [] : void 0, import.meta.url)
};
function isRegisteredWidgetType(type) {
  return type in WIDGET_COMPONENTS;
}
function bindWidgetProps(comp, api, runtime, workspaceStepId) {
  if (comp.type === "agent-run") {
    const reportPath = comp.props.reportPath ?? runtime?.reportPath ?? null;
    return {
      ...comp.props,
      api,
      stepId: runtime?.stepId ?? workspaceStepId,
      stepTitle: runtime?.stepTitle ?? workspaceStepId,
      status: runtime?.status ?? "pending",
      reportPath,
      running: runtime?.running ?? false,
      liveOutput: runtime?.liveOutput ?? ""
    };
  }
  if (comp.type === "agent-rules-editor") {
    return { api, componentId: comp.id, ...comp.props };
  }
  return { api, ...comp.props };
}
const _hoisted_1$6 = ["data-testid"];
const _hoisted_2$6 = { class: "text-gray-500" };
const _hoisted_3$6 = {
  key: 0,
  class: "text-red-500"
};
const _hoisted_4$6 = ["value", "onInput"];
const _hoisted_5$6 = {
  key: 1,
  class: "mt-1 flex items-center gap-2"
};
const _hoisted_6$5 = ["checked", "onChange"];
const _hoisted_7$5 = ["value", "onChange"];
const _hoisted_8$5 = ["value"];
const _hoisted_9$4 = ["value", "onInput"];
const _hoisted_10$4 = {
  key: 4,
  class: "mt-1 space-y-2"
};
const _hoisted_11$3 = ["data-testid"];
const _hoisted_12$3 = ["value", "onInput"];
const _hoisted_13$3 = ["value", "onInput"];
const _hoisted_14$2 = ["data-testid", "onClick"];
const _hoisted_15$2 = ["onClick"];
const _hoisted_16$2 = {
  key: 5,
  class: "mt-1 flex flex-wrap gap-1"
};
const _hoisted_17$2 = ["onClick"];
const _hoisted_18$2 = ["value", "onInput"];
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "WorkspacePropFields",
  props: {
    fields: {},
    values: {},
    skills: {}
  },
  emits: ["update:prop"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    function emitProp(key, value) {
      emit2("update:prop", { key, value });
    }
    function fieldValue(field) {
      const val = props.values[field.key];
      if (val !== void 0) return val;
      if (field.type === "boolean") return false;
      if (field.type === "string[]" || field.type === "file-list" || field.type === "skills") {
        return [];
      }
      return "";
    }
    function propStringArrayValue(key) {
      const val = props.values[key];
      return Array.isArray(val) ? val.map(String).join("\n") : "";
    }
    function onStringArrayInput(key, raw) {
      const items = raw.split("\n").map((s) => s.trim()).filter(Boolean);
      emitProp(key, items);
    }
    function fileListValue(key) {
      const val = props.values[key];
      if (!Array.isArray(val)) return [];
      return val.map((item) => {
        if (typeof item === "object" && item !== null) {
          const row = item;
          return {
            path: String(row.path ?? ""),
            label: String(row.label ?? "")
          };
        }
        return { path: String(item), label: String(item) };
      });
    }
    function updateFileListRow(key, index, field, value) {
      const rows = fileListValue(key).map((row) => ({ ...row }));
      rows[index] = { ...rows[index], [field]: value };
      emitProp(key, rows);
    }
    function removeFileListRow(key, index) {
      const rows = fileListValue(key).filter((_2, i) => i !== index);
      emitProp(key, rows);
    }
    function addFileListRow(key) {
      const rows = [...fileListValue(key), { path: "", label: "" }];
      emitProp(key, rows);
    }
    function toggleSkillProp(key, skill) {
      const current = props.values[key];
      const list = Array.isArray(current) ? [...current.map(String)] : [];
      const idx = list.indexOf(skill);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(skill);
      }
      emitProp(key, list);
    }
    function skillSelected(key, skill) {
      const current = props.values[key];
      return Array.isArray(current) && current.map(String).includes(skill);
    }
    return (_ctx, _cache) => {
      return openBlock(true), createElementBlock(Fragment, null, renderList(__props.fields, (field) => {
        return openBlock(), createElementBlock("div", {
          key: field.key,
          class: "text-xs",
          "data-testid": `prop-field-${field.key}`
        }, [
          createBaseVNode("span", _hoisted_2$6, [
            createTextVNode(toDisplayString(field.label) + " ", 1),
            field.required ? (openBlock(), createElementBlock("span", _hoisted_3$6, "*")) : createCommentVNode("", true)
          ]),
          field.type === "string" || field.type === "langflow-flow" ? (openBlock(), createElementBlock("input", {
            key: 0,
            value: String(fieldValue(field) ?? ""),
            type: "text",
            class: "mt-1 w-full border border-gray-300 rounded px-2 py-1 text-xs",
            onInput: ($event) => emitProp(field.key, $event.target.value)
          }, null, 40, _hoisted_4$6)) : field.type === "boolean" ? (openBlock(), createElementBlock("label", _hoisted_5$6, [
            createBaseVNode("input", {
              checked: Boolean(fieldValue(field)),
              type: "checkbox",
              onChange: ($event) => emitProp(field.key, $event.target.checked)
            }, null, 40, _hoisted_6$5),
            _cache[0] || (_cache[0] = createBaseVNode("span", { class: "text-gray-600" }, "Enabled", -1))
          ])) : field.type === "select" ? (openBlock(), createElementBlock("select", {
            key: 2,
            value: String(fieldValue(field) ?? ""),
            class: "mt-1 w-full border border-gray-300 rounded px-2 py-1 text-xs",
            onChange: ($event) => emitProp(field.key, $event.target.value)
          }, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(field.options ?? [], (opt) => {
              return openBlock(), createElementBlock("option", {
                key: opt,
                value: opt
              }, toDisplayString(opt), 9, _hoisted_8$5);
            }), 128))
          ], 40, _hoisted_7$5)) : field.type === "string[]" ? (openBlock(), createElementBlock("textarea", {
            key: 3,
            value: propStringArrayValue(field.key),
            rows: "3",
            class: "mt-1 w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono",
            placeholder: "One item per line",
            onInput: ($event) => onStringArrayInput(field.key, $event.target.value)
          }, null, 40, _hoisted_9$4)) : field.type === "file-list" ? (openBlock(), createElementBlock("div", _hoisted_10$4, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(fileListValue(field.key), (row, index) => {
              return openBlock(), createElementBlock("div", {
                key: index,
                class: "space-y-1 border border-gray-200 rounded p-2",
                "data-testid": `file-list-row-${index}`
              }, [
                createBaseVNode("input", {
                  value: row.path,
                  type: "text",
                  placeholder: "Path",
                  class: "w-full border border-gray-300 rounded px-2 py-1 text-xs",
                  onInput: ($event) => updateFileListRow(field.key, index, "path", $event.target.value)
                }, null, 40, _hoisted_12$3),
                createBaseVNode("input", {
                  value: row.label,
                  type: "text",
                  placeholder: "Label",
                  class: "w-full border border-gray-300 rounded px-2 py-1 text-xs",
                  onInput: ($event) => updateFileListRow(field.key, index, "label", $event.target.value)
                }, null, 40, _hoisted_13$3),
                createBaseVNode("button", {
                  type: "button",
                  class: "text-[10px] px-1.5 py-0.5 border rounded text-red-600",
                  "data-testid": `file-list-remove-${index}`,
                  onClick: ($event) => removeFileListRow(field.key, index)
                }, " Remove ", 8, _hoisted_14$2)
              ], 8, _hoisted_11$3);
            }), 128)),
            createBaseVNode("button", {
              type: "button",
              class: "text-[10px] px-1.5 py-0.5 border rounded text-gray-600",
              "data-testid": "file-list-add",
              onClick: ($event) => addFileListRow(field.key)
            }, " Add file ", 8, _hoisted_15$2)
          ])) : field.type === "skills" ? (openBlock(), createElementBlock("div", _hoisted_16$2, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.skills ?? [], (skill) => {
              return openBlock(), createElementBlock("button", {
                key: skill,
                type: "button",
                class: normalizeClass([
                  "text-[10px] px-1.5 py-0.5 rounded-full border",
                  skillSelected(field.key, skill) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"
                ]),
                onClick: ($event) => toggleSkillProp(field.key, skill)
              }, toDisplayString(skill), 11, _hoisted_17$2);
            }), 128)),
            !__props.skills?.length ? (openBlock(), createElementBlock("input", {
              key: 0,
              value: String(fieldValue(field) ?? ""),
              type: "text",
              class: "w-full border border-gray-300 rounded px-2 py-1 text-xs",
              placeholder: "Comma-separated skills",
              onInput: ($event) => emitProp(
                field.key,
                $event.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }, null, 40, _hoisted_18$2)) : createCommentVNode("", true)
          ])) : createCommentVNode("", true)
        ], 8, _hoisted_1$6);
      }), 128);
    };
  }
});
const _hoisted_1$5 = { class: "w-[95vw] max-w-7xl h-[85vh] bg-white shadow-xl rounded-lg flex flex-col" };
const _hoisted_2$5 = { class: "flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-200" };
const _hoisted_3$5 = { class: "flex items-center gap-2 text-xs text-gray-600" };
const _hoisted_4$5 = ["value"];
const _hoisted_5$5 = { class: "flex items-center gap-2 text-xs text-gray-600 ml-auto" };
const _hoisted_6$4 = {
  key: 0,
  class: "px-4 py-1 text-xs text-red-600 bg-red-50"
};
const _hoisted_7$4 = {
  key: 1,
  class: "flex-1 flex items-center justify-center text-xs text-gray-500"
};
const _hoisted_8$4 = {
  key: 2,
  class: "flex flex-1 min-h-0"
};
const _hoisted_9$3 = { class: "w-52 shrink-0 border-r border-gray-200 overflow-y-auto p-3" };
const _hoisted_10$3 = { class: "text-[10px] text-gray-400 uppercase mb-1" };
const _hoisted_11$2 = ["data-testid", "onDblclick", "onClick"];
const _hoisted_12$2 = { class: "font-medium text-gray-800" };
const _hoisted_13$2 = { class: "block text-[10px] text-gray-400 truncate" };
const _hoisted_14$1 = { class: "flex-1 min-w-0 border-r border-gray-200 overflow-y-auto p-3" };
const _hoisted_15$1 = {
  key: 0,
  class: "text-xs text-gray-400"
};
const _hoisted_16$1 = { "data-testid": "selected-list" };
const _hoisted_17$1 = ["data-testid", "onClick", "onDragstart", "onDrop"];
const _hoisted_18$1 = { class: "flex-1 min-w-0 truncate text-xs text-gray-800" };
const _hoisted_19$1 = ["disabled", "data-testid", "onClick"];
const _hoisted_20$1 = ["disabled", "data-testid", "onClick"];
const _hoisted_21$1 = ["data-testid", "onClick"];
const _hoisted_22$1 = { class: "w-64 shrink-0 border-r border-gray-200 overflow-y-auto p-3" };
const _hoisted_23$1 = {
  key: 0,
  class: "text-xs text-gray-400"
};
const _hoisted_24$1 = {
  key: 1,
  class: "space-y-3"
};
const _hoisted_25$1 = { class: "block text-xs" };
const _hoisted_26$1 = ["value"];
const _hoisted_27$1 = {
  class: "w-[40%] min-w-0 shrink-0 overflow-y-auto p-3",
  "data-testid": "preview-column"
};
const _hoisted_28$1 = {
  key: 0,
  class: "text-xs text-gray-400"
};
const _hoisted_29$1 = {
  key: 0,
  class: "rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700",
  "data-testid": "unknown-widget-error"
};
const _hoisted_30 = {
  key: 1,
  class: "rounded border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600",
  "data-testid": "preview-runtime-placeholder"
};
const _hoisted_31 = { class: "flex gap-2 p-4 border-t border-gray-200" };
const _hoisted_32 = ["disabled"];
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "WorkspaceDesigner",
  props: {
    show: { type: Boolean },
    workflowId: {},
    steps: {},
    initialStepId: {},
    skills: {},
    panelApi: {}
  },
  emits: ["close", "saved"],
  setup(__props, { emit: __emit }) {
    const RUNTIME_ONLY_TYPES = /* @__PURE__ */ new Set(["agent-run", "langflow-panel"]);
    const props = __props;
    const emit2 = __emit;
    const { fetchWorkspace, saveWorkspace, fetchRegistry } = useWorkspaceConfig();
    const selectedStepId = /* @__PURE__ */ ref("");
    const layout = /* @__PURE__ */ ref("tabs");
    const components = /* @__PURE__ */ ref([]);
    const selectedComponentId = /* @__PURE__ */ ref(null);
    const registry = /* @__PURE__ */ ref(WORKSPACE_REGISTRY);
    const loading = /* @__PURE__ */ ref(false);
    const saving = /* @__PURE__ */ ref(false);
    const loadError = /* @__PURE__ */ ref(null);
    const dragIndex = /* @__PURE__ */ ref(null);
    const registryByCategory = computed(() => {
      const groups = {};
      for (const entry of registry.value) {
        if (!groups[entry.category]) {
          groups[entry.category] = [];
        }
        groups[entry.category].push(entry);
      }
      return groups;
    });
    const selectedComponent = computed(
      () => components.value.find((c) => c.id === selectedComponentId.value) ?? null
    );
    const selectedEntry = computed(
      () => selectedComponent.value ? registryEntry(selectedComponent.value.type) : void 0
    );
    const previewResolved = /* @__PURE__ */ shallowRef(null);
    const previewKey = computed(() => {
      const comp = selectedComponent.value;
      if (!comp) return "";
      return `${comp.id}-${JSON.stringify(comp.props)}`;
    });
    const previewBindProps = computed(() => {
      const comp = selectedComponent.value;
      if (!comp) return {};
      return bindWidgetProps(comp, props.panelApi ?? {});
    });
    watch(
      () => selectedComponent.value?.type,
      async (type) => {
        previewResolved.value = null;
        if (!type || !isRegisteredWidgetType(type) || RUNTIME_ONLY_TYPES.has(type)) return;
        const loader = WIDGET_COMPONENTS[type];
        const mod = await loader();
        previewResolved.value = mod.default;
      },
      { immediate: true }
    );
    function isUnknownType(type) {
      return !isRegisteredWidgetType(type);
    }
    function isRuntimeOnlyType(type) {
      return RUNTIME_ONLY_TYPES.has(type);
    }
    function runtimePlaceholderMessage(type) {
      if (type === "agent-run") {
        return "Runtime widget — configure props here; run step in Workflow Run.";
      }
      if (type === "langflow-panel") {
        return "Langflow panel — run in Workflow Run or Chat.";
      }
      return null;
    }
    const categoryLabel = (category) => category.charAt(0).toUpperCase() + category.slice(1);
    watch(
      () => [props.show, props.workflowId, props.initialStepId],
      async ([visible, workflowId, initialStepId]) => {
        if (!visible || !workflowId) return;
        selectedStepId.value = initialStepId && props.steps.some((s) => s.id === initialStepId) ? initialStepId : props.steps[0]?.id ?? "";
        try {
          const res = await fetchRegistry();
          registry.value = res.components;
        } catch {
          registry.value = WORKSPACE_REGISTRY;
        }
        if (selectedStepId.value) {
          await loadStepWorkspace(selectedStepId.value);
        }
      },
      { immediate: true }
    );
    watch(selectedStepId, async (stepId, prev) => {
      if (!props.show || !stepId || stepId === prev) return;
      await loadStepWorkspace(stepId);
    });
    async function loadStepWorkspace(stepId) {
      if (!props.workflowId) return;
      loading.value = true;
      loadError.value = null;
      try {
        const ws = await fetchWorkspace(props.workflowId, stepId);
        layout.value = ws.layout;
        components.value = JSON.parse(JSON.stringify(ws.components));
        selectedComponentId.value = components.value[0]?.id ?? null;
      } catch {
        layout.value = "tabs";
        components.value = [];
        selectedComponentId.value = null;
      } finally {
        loading.value = false;
      }
    }
    function addComponent(entry) {
      const id = `${entry.type}-${Date.now()}`;
      const comp = {
        id,
        type: entry.type,
        label: entry.label,
        props: JSON.parse(JSON.stringify(entry.defaultProps))
      };
      components.value = [...components.value, comp];
      selectedComponentId.value = id;
    }
    function removeComponent(index) {
      const removed = components.value[index];
      components.value = components.value.filter((_2, i) => i !== index);
      if (selectedComponentId.value === removed?.id) {
        selectedComponentId.value = components.value[0]?.id ?? null;
      }
    }
    function moveComponent(index, delta) {
      const next = index + delta;
      if (next < 0 || next >= components.value.length) return;
      const items = [...components.value];
      const [item] = items.splice(index, 1);
      items.splice(next, 0, item);
      components.value = items;
    }
    function onDragStart(index) {
      dragIndex.value = index;
    }
    function onDragOver(event) {
      event.preventDefault();
    }
    function onDrop(index) {
      if (dragIndex.value === null || dragIndex.value === index) return;
      const items = [...components.value];
      const [item] = items.splice(dragIndex.value, 1);
      items.splice(index, 0, item);
      components.value = items;
      dragIndex.value = null;
    }
    function updateSelectedComponent(patch) {
      const idx = components.value.findIndex((c) => c.id === selectedComponentId.value);
      if (idx < 0) return;
      components.value[idx] = { ...components.value[idx], ...patch };
    }
    function updateSelectedProp(key, value) {
      const idx = components.value.findIndex((c) => c.id === selectedComponentId.value);
      if (idx < 0) return;
      const comp = components.value[idx];
      components.value[idx] = {
        ...comp,
        props: { ...comp.props, [key]: value }
      };
    }
    function onPropUpdate({ key, value }) {
      updateSelectedProp(key, value);
    }
    async function onSave() {
      if (!props.workflowId || !selectedStepId.value) return;
      saving.value = true;
      loadError.value = null;
      try {
        const definition = {
          version: 1,
          stepId: selectedStepId.value,
          layout: layout.value,
          components: components.value
        };
        const saved = await saveWorkspace(props.workflowId, selectedStepId.value, definition);
        emit2("saved", saved);
      } catch (err) {
        loadError.value = err instanceof Error ? err.message : String(err);
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _cache) => {
      return __props.show ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4",
        "data-testid": "workspace-designer",
        onClick: _cache[5] || (_cache[5] = withModifiers(($event) => emit2("close"), ["self"]))
      }, [
        createBaseVNode("div", _hoisted_1$5, [
          createBaseVNode("div", _hoisted_2$5, [
            _cache[9] || (_cache[9] = createBaseVNode("h2", { class: "text-sm font-semibold text-gray-800" }, "Design workspace", -1)),
            createBaseVNode("label", _hoisted_3$5, [
              _cache[6] || (_cache[6] = createBaseVNode("span", null, "Step", -1)),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedStepId.value = $event),
                "data-testid": "step-selector",
                class: "border border-gray-300 rounded px-2 py-1 text-sm"
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(__props.steps, (step) => {
                  return openBlock(), createElementBlock("option", {
                    key: step.id,
                    value: step.id
                  }, toDisplayString(step.title), 9, _hoisted_4$5);
                }), 128))
              ], 512), [
                [vModelSelect, selectedStepId.value]
              ])
            ]),
            createBaseVNode("label", _hoisted_5$5, [
              _cache[8] || (_cache[8] = createBaseVNode("span", null, "Layout", -1)),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => layout.value = $event),
                "data-testid": "layout-selector",
                class: "border border-gray-300 rounded px-2 py-1 text-sm"
              }, [..._cache[7] || (_cache[7] = [
                createBaseVNode("option", { value: "tabs" }, "tabs", -1),
                createBaseVNode("option", { value: "stack" }, "stack", -1)
              ])], 512), [
                [vModelSelect, layout.value]
              ])
            ]),
            createBaseVNode("button", {
              type: "button",
              class: "text-gray-500 hover:text-gray-800 text-lg leading-none",
              onClick: _cache[2] || (_cache[2] = ($event) => emit2("close"))
            }, " × ")
          ]),
          loadError.value ? (openBlock(), createElementBlock("p", _hoisted_6$4, toDisplayString(loadError.value), 1)) : createCommentVNode("", true),
          loading.value ? (openBlock(), createElementBlock("div", _hoisted_7$4, " Loading workspace… ")) : (openBlock(), createElementBlock("div", _hoisted_8$4, [
            createBaseVNode("section", _hoisted_9$3, [
              _cache[10] || (_cache[10] = createBaseVNode("p", { class: "text-[10px] font-medium text-gray-500 uppercase mb-2" }, "Component library", -1)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(registryByCategory.value, (entries, category) => {
                return openBlock(), createElementBlock("div", {
                  key: category,
                  class: "mb-3"
                }, [
                  createBaseVNode("p", _hoisted_10$3, toDisplayString(categoryLabel(category)), 1),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(entries, (entry) => {
                    return openBlock(), createElementBlock("button", {
                      key: entry.type,
                      type: "button",
                      class: "w-full text-left px-2 py-1.5 mb-1 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-xs",
                      "data-testid": `library-${entry.type}`,
                      onDblclick: ($event) => addComponent(entry),
                      onClick: ($event) => addComponent(entry)
                    }, [
                      createBaseVNode("span", _hoisted_12$2, toDisplayString(entry.label), 1),
                      createBaseVNode("span", _hoisted_13$2, toDisplayString(entry.description), 1)
                    ], 40, _hoisted_11$2);
                  }), 128))
                ]);
              }), 128))
            ]),
            createBaseVNode("section", _hoisted_14$1, [
              _cache[11] || (_cache[11] = createBaseVNode("p", { class: "text-[10px] font-medium text-gray-500 uppercase mb-2" }, "Selected components", -1)),
              !components.value.length ? (openBlock(), createElementBlock("p", _hoisted_15$1, "Add components from the library.")) : createCommentVNode("", true),
              createBaseVNode("ul", _hoisted_16$1, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(components.value, (comp, index) => {
                  return openBlock(), createElementBlock("li", {
                    key: comp.id,
                    draggable: "true",
                    class: normalizeClass([
                      "flex items-center gap-2 px-2 py-2 mb-1 rounded border cursor-move",
                      selectedComponentId.value === comp.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                    ]),
                    "data-testid": `selected-${comp.id}`,
                    onClick: ($event) => selectedComponentId.value = comp.id,
                    onDragstart: ($event) => onDragStart(index),
                    onDragover: onDragOver,
                    onDrop: ($event) => onDrop(index)
                  }, [
                    createBaseVNode("span", _hoisted_18$1, toDisplayString(index + 1) + ". " + toDisplayString(comp.label || comp.type), 1),
                    createBaseVNode("button", {
                      type: "button",
                      class: "text-[10px] px-1.5 py-0.5 border rounded disabled:opacity-40",
                      disabled: index === 0,
                      "data-testid": `move-up-${comp.id}`,
                      onClick: withModifiers(($event) => moveComponent(index, -1), ["stop"])
                    }, " ↑ ", 8, _hoisted_19$1),
                    createBaseVNode("button", {
                      type: "button",
                      class: "text-[10px] px-1.5 py-0.5 border rounded disabled:opacity-40",
                      disabled: index === components.value.length - 1,
                      "data-testid": `move-down-${comp.id}`,
                      onClick: withModifiers(($event) => moveComponent(index, 1), ["stop"])
                    }, " ↓ ", 8, _hoisted_20$1),
                    createBaseVNode("button", {
                      type: "button",
                      class: "text-[10px] px-1.5 py-0.5 border rounded text-red-600",
                      "data-testid": `remove-${comp.id}`,
                      onClick: withModifiers(($event) => removeComponent(index), ["stop"])
                    }, " ✕ ", 8, _hoisted_21$1)
                  ], 42, _hoisted_17$1);
                }), 128))
              ])
            ]),
            createBaseVNode("section", _hoisted_22$1, [
              _cache[13] || (_cache[13] = createBaseVNode("p", { class: "text-[10px] font-medium text-gray-500 uppercase mb-2" }, "Properties", -1)),
              !selectedComponent.value ? (openBlock(), createElementBlock("div", _hoisted_23$1, "Select a component.")) : (openBlock(), createElementBlock("div", _hoisted_24$1, [
                createBaseVNode("label", _hoisted_25$1, [
                  _cache[12] || (_cache[12] = createBaseVNode("span", { class: "text-gray-500" }, "Label", -1)),
                  createBaseVNode("input", {
                    value: selectedComponent.value.label ?? "",
                    type: "text",
                    class: "mt-1 w-full border border-gray-300 rounded px-2 py-1 text-xs",
                    onInput: _cache[3] || (_cache[3] = ($event) => updateSelectedComponent({ label: $event.target.value }))
                  }, null, 40, _hoisted_26$1)
                ]),
                createVNode(_sfc_main$7, {
                  fields: selectedEntry.value?.propsFields ?? [],
                  values: selectedComponent.value.props,
                  skills: __props.skills,
                  "onUpdate:prop": onPropUpdate
                }, null, 8, ["fields", "values", "skills"])
              ]))
            ]),
            createBaseVNode("section", _hoisted_27$1, [
              _cache[14] || (_cache[14] = createBaseVNode("p", { class: "text-[10px] font-medium text-gray-500 uppercase mb-2" }, "Preview", -1)),
              !selectedComponent.value ? (openBlock(), createElementBlock("div", _hoisted_28$1, " Select a component to preview. ")) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                isUnknownType(selectedComponent.value.type) ? (openBlock(), createElementBlock("div", _hoisted_29$1, " Unknown widget type: " + toDisplayString(selectedComponent.value.type), 1)) : isRuntimeOnlyType(selectedComponent.value.type) ? (openBlock(), createElementBlock("div", _hoisted_30, toDisplayString(runtimePlaceholderMessage(selectedComponent.value.type)), 1)) : previewResolved.value ? (openBlock(), createBlock(resolveDynamicComponent(previewResolved.value), mergeProps({
                  key: previewKey.value,
                  "data-testid": "preview-mount",
                  "data-preview-key": previewKey.value
                }, previewBindProps.value), null, 16, ["data-preview-key"])) : createCommentVNode("", true)
              ], 64))
            ])
          ])),
          createBaseVNode("div", _hoisted_31, [
            createBaseVNode("button", {
              type: "button",
              class: "btn-primary text-xs py-1 px-3 disabled:opacity-50",
              "data-testid": "save-workspace",
              disabled: saving.value || !__props.workflowId || !selectedStepId.value,
              onClick: onSave
            }, toDisplayString(saving.value ? "Saving…" : "Save"), 9, _hoisted_32),
            createBaseVNode("button", {
              type: "button",
              class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 ml-auto",
              onClick: _cache[4] || (_cache[4] = ($event) => emit2("close"))
            }, " Cancel ")
          ])
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
const _hoisted_1$4 = { class: "w-52 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0" };
const _hoisted_2$4 = { class: "p-3 border-b border-gray-200 flex items-center justify-between gap-2" };
const _hoisted_3$4 = { class: "max-h-40 overflow-y-auto border-b border-gray-200" };
const _hoisted_4$4 = ["onClick"];
const _hoisted_5$4 = {
  key: 0,
  class: "inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 align-middle",
  title: "Active"
};
const _hoisted_6$3 = ["onClick"];
const _hoisted_7$3 = { class: "p-3 border-b border-gray-200 flex items-center justify-between gap-2" };
const _hoisted_8$3 = ["disabled"];
const _hoisted_9$2 = { class: "flex-1 overflow-y-auto" };
const _hoisted_10$2 = ["onClick"];
const _hoisted_11$1 = { class: "flex items-center justify-between gap-2" };
const _hoisted_12$1 = { class: "truncate" };
const _hoisted_13$1 = {
  key: 0,
  class: "p-3 text-xs text-gray-400"
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowSidebar",
  props: {
    workflows: {},
    steps: {},
    selectedWorkflowId: {},
    activeWorkflowId: {},
    viewingStepId: {}
  },
  emits: ["select-workflow", "config-workflow", "design-workspace", "select-step", "add-workflow"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    const statusLabel = {
      pending: "Pending",
      running: "Running",
      done: "Done",
      failed: "Failed",
      skipped: "Skipped",
      gate_failed: "Gate"
    };
    const statusClass = {
      pending: "bg-gray-100 text-gray-600",
      running: "bg-blue-100 text-blue-700",
      done: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      skipped: "bg-yellow-100 text-yellow-800",
      gate_failed: "bg-orange-100 text-orange-800"
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("aside", _hoisted_1$4, [
        createBaseVNode("div", _hoisted_2$4, [
          _cache[2] || (_cache[2] = createBaseVNode("p", { class: "text-xs font-medium text-gray-500 uppercase tracking-wide" }, "Workflows", -1)),
          createBaseVNode("button", {
            type: "button",
            class: "text-xs text-blue-600 hover:underline",
            title: "Add from template",
            onClick: _cache[0] || (_cache[0] = ($event) => emit2("add-workflow"))
          }, " + ")
        ]),
        createBaseVNode("div", _hoisted_3$4, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.workflows, (wf) => {
            return openBlock(), createElementBlock("div", {
              key: wf.id,
              class: normalizeClass(["flex items-center gap-1 px-2 py-1.5 border-b border-gray-100", __props.selectedWorkflowId === wf.id ? "bg-blue-50" : "hover:bg-gray-100"])
            }, [
              createBaseVNode("button", {
                type: "button",
                class: "flex-1 min-w-0 text-left text-sm px-1 py-0.5 truncate",
                onClick: ($event) => emit2("select-workflow", wf.id)
              }, [
                __props.activeWorkflowId === wf.id ? (openBlock(), createElementBlock("span", _hoisted_5$4)) : createCommentVNode("", true),
                createTextVNode(" " + toDisplayString(wf.title), 1)
              ], 8, _hoisted_4$4),
              createBaseVNode("button", {
                type: "button",
                class: "text-xs px-1.5 py-0.5 text-gray-500 hover:text-gray-800 shrink-0",
                title: "Configure workflow",
                onClick: withModifiers(($event) => emit2("config-workflow", wf.id), ["stop"])
              }, " ⚙ ", 8, _hoisted_6$3)
            ], 2);
          }), 128))
        ]),
        createBaseVNode("div", _hoisted_7$3, [
          _cache[3] || (_cache[3] = createBaseVNode("p", { class: "text-xs font-medium text-gray-500 uppercase tracking-wide" }, "Pipeline Steps", -1)),
          createBaseVNode("button", {
            type: "button",
            class: "text-[10px] text-blue-600 hover:underline shrink-0",
            title: "Design workspace layout",
            disabled: !__props.steps.length,
            onClick: _cache[1] || (_cache[1] = ($event) => emit2("design-workspace"))
          }, " Design ", 8, _hoisted_8$3)
        ]),
        createBaseVNode("div", _hoisted_9$2, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(__props.steps, (step) => {
            return openBlock(), createElementBlock("button", {
              key: step.id,
              type: "button",
              class: normalizeClass(["w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-gray-100", __props.viewingStepId === step.id ? "bg-blue-50" : ""]),
              onClick: ($event) => emit2("select-step", step.id)
            }, [
              createBaseVNode("div", _hoisted_11$1, [
                createBaseVNode("span", _hoisted_12$1, toDisplayString(step.title), 1),
                createBaseVNode("span", {
                  class: normalizeClass(["text-[10px] px-1.5 py-0.5 rounded-full shrink-0", statusClass[step.status]])
                }, toDisplayString(statusLabel[step.status]), 3)
              ])
            ], 10, _hoisted_10$2);
          }), 128)),
          !__props.steps.length ? (openBlock(), createElementBlock("p", _hoisted_13$1, "Select a workflow")) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
const _hoisted_1$3 = { class: "bg-white rounded-lg shadow-lg w-80 max-h-[70vh] flex flex-col" };
const _hoisted_2$3 = { class: "flex items-center justify-between px-4 py-3 border-b border-gray-200" };
const _hoisted_3$3 = {
  key: 0,
  class: "p-4 text-xs text-gray-500"
};
const _hoisted_4$3 = {
  key: 1,
  class: "flex-1 overflow-y-auto"
};
const _hoisted_5$3 = ["onClick"];
const _hoisted_6$2 = { class: "text-sm font-medium text-gray-800" };
const _hoisted_7$2 = { class: "text-[10px] text-gray-400 mt-0.5" };
const _hoisted_8$2 = {
  key: 0,
  class: "p-4 text-xs text-gray-400"
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowTemplatePicker",
  props: {
    show: { type: Boolean },
    templates: {},
    loading: { type: Boolean }
  },
  emits: ["close", "select"],
  setup(__props, { emit: __emit }) {
    const emit2 = __emit;
    return (_ctx, _cache) => {
      return __props.show ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "fixed inset-0 z-50 flex items-center justify-center bg-black/30",
        onClick: _cache[1] || (_cache[1] = withModifiers(($event) => emit2("close"), ["self"]))
      }, [
        createBaseVNode("div", _hoisted_1$3, [
          createBaseVNode("div", _hoisted_2$3, [
            _cache[2] || (_cache[2] = createBaseVNode("h2", { class: "text-sm font-semibold text-gray-800" }, "Add workflow from template", -1)),
            createBaseVNode("button", {
              type: "button",
              class: "text-gray-500 hover:text-gray-800",
              onClick: _cache[0] || (_cache[0] = ($event) => emit2("close"))
            }, " × ")
          ]),
          __props.loading ? (openBlock(), createElementBlock("div", _hoisted_3$3, "Loading templates…")) : (openBlock(), createElementBlock("div", _hoisted_4$3, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(__props.templates, (tpl) => {
              return openBlock(), createElementBlock("button", {
                key: `${tpl.source}-${tpl.id}`,
                type: "button",
                class: "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50",
                onClick: ($event) => emit2("select", tpl.id)
              }, [
                createBaseVNode("div", _hoisted_6$2, toDisplayString(tpl.title), 1),
                createBaseVNode("div", _hoisted_7$2, toDisplayString(tpl.id) + " · " + toDisplayString(tpl.source), 1)
              ], 8, _hoisted_5$3);
            }), 128)),
            !__props.templates.length ? (openBlock(), createElementBlock("p", _hoisted_8$2, "No templates available.")) : createCommentVNode("", true)
          ]))
        ])
      ])) : createCommentVNode("", true);
    };
  }
});
const ARCH_FILES = [
  { path: "docs/architecture.md", label: "Architecture" },
  { path: "AGENTS.md", label: "AGENTS.md" }
];
const LEGACY_WORKSPACES = {
  prd: {
    version: 1,
    stepId: "prd",
    layout: "stack",
    components: [{ id: "doc", type: "markdown-doc", props: { docsDir: "docs" } }]
  },
  architecture: {
    version: 1,
    stepId: "architecture",
    layout: "stack",
    components: [
      {
        id: "arch",
        type: "architecture-docs",
        props: { files: ARCH_FILES }
      }
    ]
  },
  "fe-dev": {
    version: 1,
    stepId: "fe-dev",
    layout: "stack",
    components: [
      {
        id: "code",
        type: "code-explorer",
        label: "Frontend",
        props: { root: "fe", writable: false }
      }
    ]
  },
  "be-dev": {
    version: 1,
    stepId: "be-dev",
    layout: "stack",
    components: [
      {
        id: "code",
        type: "code-explorer",
        label: "Backend",
        props: { root: "backend", writable: false }
      }
    ]
  },
  test: {
    version: 1,
    stepId: "test",
    layout: "stack",
    components: [{ id: "run", type: "agent-run", props: { reportPath: "test-report.md" } }]
  },
  review: {
    version: 1,
    stepId: "review",
    layout: "stack",
    components: [{ id: "run", type: "agent-run", props: { reportPath: "review-notes.md" } }]
  },
  "test-2": {
    version: 1,
    stepId: "test-2",
    layout: "stack",
    components: [{ id: "run", type: "agent-run", props: { reportPath: "regression-report.md" } }]
  },
  cicd: {
    version: 1,
    stepId: "cicd",
    layout: "stack",
    components: [{ id: "cfg", type: "cicd-config", props: {} }]
  }
};
function getLegacyWorkspace(stepId) {
  return LEGACY_WORKSPACES[stepId];
}
const _hoisted_1$2 = { class: "flex flex-col flex-1 min-h-0 overflow-hidden" };
const _hoisted_2$2 = {
  key: 0,
  class: "flex gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2 shrink-0",
  role: "tablist"
};
const _hoisted_3$2 = ["aria-selected", "onClick"];
const _hoisted_4$2 = { class: "flex flex-col flex-1 min-h-0 overflow-hidden" };
const _hoisted_5$2 = {
  key: 0,
  class: "flex flex-col flex-1 min-h-0 overflow-hidden",
  role: "tabpanel"
};
const _hoisted_6$1 = {
  key: 0,
  class: "m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700",
  "data-testid": "unknown-widget-error"
};
const _hoisted_7$1 = {
  key: 1,
  class: "flex-1 min-h-0 overflow-auto divide-y divide-gray-200"
};
const _hoisted_8$1 = {
  key: 0,
  class: "px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border-b border-gray-100"
};
const _hoisted_9$1 = { class: "flex flex-col flex-1 min-h-0" };
const _hoisted_10$1 = {
  key: 0,
  class: "m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700",
  "data-testid": "unknown-widget-error"
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowPanelRenderer",
  props: {
    workspace: {},
    api: {},
    runtime: {}
  },
  setup(__props) {
    const props = __props;
    const activeTabId = /* @__PURE__ */ ref("");
    const resolvedByType = /* @__PURE__ */ shallowRef({});
    const components = computed(() => props.workspace.components);
    watch(
      () => props.workspace.components.map((c) => c.type).join(","),
      async () => {
        const map = {};
        for (const comp of props.workspace.components) {
          if (map[comp.type] || !isRegisteredWidgetType(comp.type)) continue;
          const loader = WIDGET_COMPONENTS[comp.type];
          const mod = await loader();
          map[comp.type] = mod.default;
        }
        resolvedByType.value = map;
      },
      { immediate: true }
    );
    watch(
      () => props.workspace.components,
      (list) => {
        if (!list.length) {
          activeTabId.value = "";
          return;
        }
        if (!list.some((c) => c.id === activeTabId.value)) {
          activeTabId.value = list[0].id;
        }
      },
      { immediate: true, deep: true }
    );
    function tabLabel(comp) {
      return comp.label ?? comp.id;
    }
    function bindProps(comp) {
      return bindWidgetProps(comp, props.api, props.runtime, props.workspace.stepId);
    }
    function isUnknownType(type) {
      return !isRegisteredWidgetType(type);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        __props.workspace.layout === "tabs" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
          components.value.length ? (openBlock(), createElementBlock("div", _hoisted_2$2, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(components.value, (comp) => {
              return openBlock(), createElementBlock("button", {
                key: comp.id,
                type: "button",
                role: "tab",
                class: normalizeClass([
                  "text-xs px-3 py-1.5 rounded-t border border-b-0 transition-colors",
                  activeTabId.value === comp.id ? "bg-white border-gray-200 text-blue-700 font-medium" : "border-transparent text-gray-600 hover:bg-white/70"
                ]),
                "aria-selected": activeTabId.value === comp.id,
                onClick: ($event) => activeTabId.value = comp.id
              }, toDisplayString(tabLabel(comp)), 11, _hoisted_3$2);
            }), 128))
          ])) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_4$2, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(components.value, (comp) => {
              return openBlock(), createElementBlock(Fragment, {
                key: comp.id
              }, [
                activeTabId.value === comp.id ? (openBlock(), createElementBlock("div", _hoisted_5$2, [
                  isUnknownType(comp.type) ? (openBlock(), createElementBlock("div", _hoisted_6$1, " Unknown widget type: " + toDisplayString(comp.type), 1)) : resolvedByType.value[comp.type] ? (openBlock(), createBlock(resolveDynamicComponent(resolvedByType.value[comp.type]), mergeProps({
                    key: 1,
                    ref_for: true
                  }, bindProps(comp)), null, 16)) : createCommentVNode("", true)
                ])) : createCommentVNode("", true)
              ], 64);
            }), 128))
          ])
        ], 64)) : (openBlock(), createElementBlock("div", _hoisted_7$1, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(components.value, (comp) => {
            return openBlock(), createElementBlock("section", {
              key: comp.id,
              class: "flex flex-col min-h-0",
              "data-testid": "stack-section"
            }, [
              comp.label ? (openBlock(), createElementBlock("header", _hoisted_8$1, toDisplayString(comp.label), 1)) : createCommentVNode("", true),
              createBaseVNode("div", _hoisted_9$1, [
                isUnknownType(comp.type) ? (openBlock(), createElementBlock("div", _hoisted_10$1, " Unknown widget type: " + toDisplayString(comp.type), 1)) : resolvedByType.value[comp.type] ? (openBlock(), createBlock(resolveDynamicComponent(resolvedByType.value[comp.type]), mergeProps({
                  key: 1,
                  ref_for: true
                }, bindProps(comp)), null, 16)) : createCommentVNode("", true)
              ])
            ]);
          }), 128))
        ]))
      ]);
    };
  }
});
const _hoisted_1$1 = { class: "flex flex-1 min-h-0 flex-col" };
const _hoisted_2$1 = {
  key: 0,
  class: "flex flex-1 items-center justify-center text-gray-500"
};
const _hoisted_3$1 = {
  key: 1,
  class: "flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
};
const _hoisted_4$1 = {
  key: 0,
  class: "text-gray-600"
};
const _hoisted_5$1 = {
  key: 1,
  class: "text-red-600"
};
const _hoisted_6 = { class: "flex flex-wrap items-center justify-center gap-2" };
const _hoisted_7 = ["disabled"];
const _hoisted_8 = ["disabled"];
const _hoisted_9 = { class: "flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2" };
const _hoisted_10 = { class: "text-sm font-semibold text-gray-800" };
const _hoisted_11 = {
  key: 0,
  class: "text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded"
};
const _hoisted_12 = { class: "ml-auto flex flex-wrap items-center gap-2" };
const _hoisted_13 = ["disabled"];
const _hoisted_14 = ["disabled"];
const _hoisted_15 = ["disabled"];
const _hoisted_16 = {
  key: 0,
  class: "px-4 py-1 text-xs text-red-600 bg-red-50"
};
const _hoisted_17 = { class: "flex flex-1 min-h-0" };
const _hoisted_18 = {
  key: 1,
  class: "flex flex-1 items-center justify-center text-sm text-gray-500"
};
const _hoisted_19 = { class: "flex flex-col flex-1 min-w-0 min-h-0" };
const _hoisted_20 = { class: "flex items-center gap-2 border-b border-gray-200 px-3 py-2" };
const _hoisted_21 = {
  key: 0,
  class: "ml-auto text-[10px] text-gray-400 truncate max-w-[40%]"
};
const _hoisted_22 = {
  key: 0,
  class: "mr-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200"
};
const _hoisted_23 = {
  key: 0,
  class: "flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50"
};
const _hoisted_24 = ["onClick"];
const _hoisted_25 = { class: "flex-1 overflow-y-auto p-4 min-h-0" };
const _hoisted_26 = {
  key: 0,
  class: "text-gray-400 text-xs"
};
const _hoisted_27 = {
  key: 0,
  class: "text-gray-400 text-xs"
};
const _hoisted_28 = {
  key: 1,
  class: "shrink-0 px-4 py-2 border-t border-amber-100 bg-white space-y-1"
};
const _hoisted_29 = {
  key: 0,
  class: "text-xs text-red-600"
};
const CHAT_PERCENT_KEY = "workflow-chat-percent";
const CHAT_LIST_COLLAPSED_KEY = "workflow-chat-list-collapsed";
const CHAT_MIN_PERCENT = 20;
const CHAT_MAX_PERCENT = 70;
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "WorkflowRun",
  props: {
    workspace: {}
  },
  setup(__props) {
    const workflowApi = useWorkflow();
    const { fetchWorkspace, saveWorkspace } = useWorkspaceConfig();
    const {
      fetchWorkflowList,
      fetchTemplates,
      fetchWorkflow,
      fetchState,
      fetchSkills,
      saveWorkflow,
      createFromTemplate,
      initWorkflow,
      activateWorkflow,
      deleteWorkflow,
      advance,
      fileChat,
      stepChat,
      fetchPhase,
      fetchGates,
      fetchDeploymentConfig,
      fetchResourceContext,
      fetchTopology,
      fetchOpsSummary,
      listWorkspace,
      readWorkspaceFile,
      writeWorkspaceFile,
      deleteWorkspacePath
    } = workflowApi;
    const workflows = /* @__PURE__ */ ref([]);
    const selectedWorkflowId = /* @__PURE__ */ ref(null);
    const activeWorkflowId = /* @__PURE__ */ ref(null);
    const showTemplatePicker = /* @__PURE__ */ ref(false);
    const showConfigDrawer = /* @__PURE__ */ ref(false);
    const showWorkspaceDesigner = /* @__PURE__ */ ref(false);
    const configWorkflowId = /* @__PURE__ */ ref(null);
    const configDefinition = /* @__PURE__ */ ref(null);
    const templates = /* @__PURE__ */ ref([]);
    const templatesLoading = /* @__PURE__ */ ref(false);
    const configSaving = /* @__PURE__ */ ref(false);
    const chatMode = /* @__PURE__ */ ref("step");
    const stepChatFileMode = /* @__PURE__ */ ref(false);
    const stepChatInputRef = /* @__PURE__ */ ref(null);
    const freeChatInputRef = /* @__PURE__ */ ref(null);
    function addFileToChat(item) {
      stepChatFileMode.value = true;
      const inputRef = chatMode.value === "step" ? stepChatInputRef : freeChatInputRef;
      inputRef.value?.addAttachment({
        path: item.path,
        label: item.label ?? item.path.split("/").pop() ?? item.path
      });
    }
    async function persistRuleFiles(files, componentId) {
      const workflowId = activeWorkflowId.value;
      const stepId = activeStepId.value;
      const workspace = fetchedWorkspace.value;
      if (!workflowId || !stepId || !workspace) {
        throw new Error("Workspace not loaded");
      }
      const updated = {
        ...workspace,
        components: workspace.components.map(
          (comp) => comp.id === componentId && comp.type === "agent-rules-editor" ? { ...comp, props: { ...comp.props, files } } : comp
        )
      };
      fetchedWorkspace.value = await saveWorkspace(workflowId, stepId, updated);
    }
    const fileWriteListeners = /* @__PURE__ */ new Set();
    function notifyFileWritten(path) {
      const normalized = normalizeWorkspacePath(path);
      for (const fn of fileWriteListeners) fn(normalized);
    }
    function handleWriteFileToolEnd(event) {
      if (event.name !== "write_file" || event.ok === false) return;
      const path = parseWriteFilePath(event.output);
      if (path) notifyFileWritten(path);
    }
    const panelApi = {
      fetchPhase,
      fetchGates,
      fetchDeploymentConfig,
      fetchResourceContext,
      fetchTopology,
      fetchOpsSummary,
      listWorkspace,
      readWorkspaceFile,
      writeWorkspaceFile,
      deleteWorkspacePath,
      addToChat: addFileToChat,
      persistRuleFiles,
      subscribeFileWrites: (fn) => {
        fileWriteListeners.add(fn);
        return () => fileWriteListeners.delete(fn);
      }
    };
    const { streamChatEvents } = useLocalChat();
    const loading = /* @__PURE__ */ ref(true);
    const initLoading = /* @__PURE__ */ ref(false);
    const error = /* @__PURE__ */ ref(null);
    const workflow = /* @__PURE__ */ ref(null);
    const state = /* @__PURE__ */ ref(null);
    const allSkills = /* @__PURE__ */ ref([]);
    const selectedSkills = /* @__PURE__ */ ref([]);
    const viewingStepId = /* @__PURE__ */ ref(null);
    const liveOutput = /* @__PURE__ */ ref({});
    const running = /* @__PURE__ */ ref(false);
    const advancing = /* @__PURE__ */ ref(false);
    const actionError = /* @__PURE__ */ ref(null);
    const WORKSPACE_MUTATING_TOOLS = /* @__PURE__ */ new Set([
      "workspace_add_component",
      "workspace_update_component",
      "workspace_remove_component",
      "workspace_reorder",
      "workspace_set_layout"
    ]);
    const fetchedWorkspace = /* @__PURE__ */ ref(null);
    const workspaceResolved = /* @__PURE__ */ ref(false);
    const {
      pending: pendingWorkspaceApproval,
      approvalError: workspaceApprovalError,
      approving: workspaceApproving,
      handleToolEndOutput,
      approvePending: onApproveWorkspaceChange,
      cancelPending: onCancelWorkspaceChange
    } = useWorkspaceApproval(async (workflowId, stepId) => {
      if (activeWorkflowId.value === workflowId) {
        await refreshWorkspaceForStep(workflowId, stepId);
      }
    });
    const resizeContainer = /* @__PURE__ */ ref(null);
    const chatPercent = /* @__PURE__ */ ref(30);
    const chatListCollapsed = /* @__PURE__ */ ref(false);
    const isResizing = /* @__PURE__ */ ref(false);
    const mainPanelWidth = computed(() => `calc(${100 - chatPercent.value}% - 4px)`);
    const chatPanelWidth = computed(() => `${chatPercent.value}%`);
    function loadChatPercent() {
      const stored = localStorage.getItem(CHAT_PERCENT_KEY);
      if (!stored) return;
      const value = Number(stored);
      if (Number.isFinite(value)) {
        chatPercent.value = Math.min(CHAT_MAX_PERCENT, Math.max(CHAT_MIN_PERCENT, value));
      }
    }
    function saveChatPercent() {
      localStorage.setItem(CHAT_PERCENT_KEY, String(chatPercent.value));
    }
    function loadChatListCollapsed() {
      chatListCollapsed.value = localStorage.getItem(CHAT_LIST_COLLAPSED_KEY) === "true";
    }
    function saveChatListCollapsed() {
      localStorage.setItem(CHAT_LIST_COLLAPSED_KEY, String(chatListCollapsed.value));
    }
    function onResizeMove(e) {
      const el = resizeContainer.value;
      if (!el || !isResizing.value) return;
      const rect = el.getBoundingClientRect();
      const pct = (rect.right - e.clientX) / rect.width * 100;
      chatPercent.value = Math.min(CHAT_MAX_PERCENT, Math.max(CHAT_MIN_PERCENT, pct));
    }
    function stopResize() {
      if (!isResizing.value) return;
      isResizing.value = false;
      document.removeEventListener("mousemove", onResizeMove);
      document.removeEventListener("mouseup", stopResize);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      saveChatPercent();
    }
    function startResize() {
      isResizing.value = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onResizeMove);
      document.addEventListener("mouseup", stopResize);
    }
    const activeStepId = computed(() => viewingStepId.value ?? state.value?.currentStepId ?? null);
    const stepChatMemory = useChatMemory({
      kind: "step",
      workflowId: activeWorkflowId,
      stepId: activeStepId
    });
    const freeChatMemory = useChatMemory({
      kind: "free",
      workflowId: activeWorkflowId
    });
    const freeSending = /* @__PURE__ */ ref(false);
    const activeChatMemory = computed(
      () => chatMode.value === "step" ? stepChatMemory : freeChatMemory
    );
    const activeChatThreads = computed(() => activeChatMemory.value.threads.value);
    const activeChatThreadId = computed(() => activeChatMemory.value.activeThreadId.value);
    async function ensureActiveChatThread() {
      const memory = activeChatMemory.value;
      if (memory.loading.value) return;
      if (memory.activeThreadId.value) return;
      if (memory.threads.value.length > 0) {
        await memory.selectThread(memory.threads.value[0].id);
        return;
      }
      const query = chatMode.value === "step" ? activeWorkflowId.value && activeStepId.value : activeWorkflowId.value;
      if (!query) return;
      try {
        await memory.createThread("New Chat");
      } catch {
      }
    }
    function onSelectChatThread(id) {
      void activeChatMemory.value.selectThread(id);
    }
    function onCreateChatThread() {
      void activeChatMemory.value.createThread("New Chat");
    }
    function activeThreadCheckpointId() {
      const memory = activeChatMemory.value;
      const id = memory.activeThreadId.value;
      if (!id) return null;
      return memory.threads.value.find((t) => t.id === id)?.checkpointThreadId ?? null;
    }
    const canOperateActive = computed(
      () => selectedWorkflowId.value != null && activeWorkflowId.value != null && selectedWorkflowId.value === activeWorkflowId.value
    );
    const sidebarSteps = computed(() => {
      if (!workflow.value || !state.value) return [];
      return workflow.value.steps.map((step) => ({
        id: step.id,
        title: step.title,
        status: state.value.stepStatuses[step.id] ?? "pending"
      }));
    });
    const configWorkflowSummary = computed(
      () => workflows.value.find((w2) => w2.id === configWorkflowId.value) ?? null
    );
    const activeWorkflowTitle = computed(() => {
      const active = workflows.value.find((w2) => w2.id === activeWorkflowId.value);
      return active?.title ?? workflow.value?.title ?? "Workflow";
    });
    const needsWorkflowInit = computed(
      () => !loading.value && !error.value && workflows.value.length === 0
    );
    function isWorkflowSetupError(message) {
      return message.includes("Workflow not found") || message.includes("No workflows configured") || message.includes("/v1/workflow/state") || message.includes("/v1/workflows/current");
    }
    const showInitWorkflowAction = computed(
      () => needsWorkflowInit.value || error.value != null && isWorkflowSetupError(error.value)
    );
    const currentStep = computed(() => {
      const id = activeStepId.value;
      return workflow.value?.steps.find((s) => s.id === id) ?? null;
    });
    const resolvedWorkspace = computed(() => fetchedWorkspace.value);
    const panelRuntime = computed(() => ({
      stepId: activeStepId.value ?? void 0,
      stepTitle: currentStep.value?.title,
      status: currentStepStatus.value,
      reportPath: activeStepId.value ? stepReportPath(activeStepId.value) : null,
      running: running.value && state.value?.currentStepId === activeStepId.value,
      liveOutput: currentLiveOutput.value
    }));
    const currentStepMessages = computed(() => stepChatMemory.messages.value);
    const freeChatMessages = computed(() => freeChatMemory.messages.value);
    const currentLiveOutput = computed(() => {
      const id = activeStepId.value;
      if (!id) return "";
      return liveOutput.value[id] ?? "";
    });
    const currentStepStatus = computed(() => {
      const id = activeStepId.value;
      if (!id || !state.value) return "pending";
      return state.value.stepStatuses[id] ?? "pending";
    });
    onMounted(() => {
      loadChatPercent();
      loadChatListCollapsed();
      void loadData();
    });
    watch(chatListCollapsed, saveChatListCollapsed);
    watch(
      () => [chatMode.value, stepChatMemory.threads.value.length, freeChatMemory.threads.value.length],
      () => {
        void ensureActiveChatThread();
      }
    );
    watch(
      () => stepChatMemory.loading.value || freeChatMemory.loading.value,
      (loading2) => {
        if (!loading2) void ensureActiveChatThread();
      }
    );
    onUnmounted(stopResize);
    watch(
      () => state.value?.currentStepId,
      (id) => {
        if (id && !viewingStepId.value) {
          viewingStepId.value = id;
        }
      }
    );
    watch(
      () => [selectedWorkflowId.value, activeStepId.value],
      async ([workflowId, stepId]) => {
        fetchedWorkspace.value = null;
        workspaceResolved.value = false;
        if (!workflowId || !stepId) {
          workspaceResolved.value = true;
          return;
        }
        try {
          fetchedWorkspace.value = await fetchWorkspace(workflowId, stepId);
        } catch {
          fetchedWorkspace.value = getLegacyWorkspace(stepId) ?? null;
        } finally {
          workspaceResolved.value = true;
        }
      },
      { immediate: true }
    );
    async function loadSelectedWorkflow() {
      const id = selectedWorkflowId.value;
      if (!id) return;
      const [wf, st2] = await Promise.all([fetchWorkflow(id), fetchState(id)]);
      workflow.value = wf;
      state.value = st2;
      if (!viewingStepId.value || !wf.steps.some((s) => s.id === viewingStepId.value)) {
        viewingStepId.value = st2.currentStepId;
      }
    }
    async function loadData() {
      loading.value = true;
      error.value = null;
      try {
        const [list, skills] = await Promise.all([fetchWorkflowList(), fetchSkills()]);
        workflows.value = list.workflows;
        activeWorkflowId.value = list.activeWorkflowId;
        allSkills.value = skills;
        if (list.workflows.length === 0) {
          workflow.value = null;
          state.value = null;
          selectedWorkflowId.value = null;
          return;
        }
        selectedWorkflowId.value = list.activeWorkflowId ?? list.workflows[0].id;
        await loadSelectedWorkflow();
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        loading.value = false;
      }
    }
    async function initWorkflowConfig() {
      initLoading.value = true;
      error.value = null;
      try {
        await initWorkflow("default-dev-cicd");
        await loadData();
      } catch (err) {
        error.value = err instanceof Error ? err.message : String(err);
      } finally {
        initLoading.value = false;
      }
    }
    async function onSelectWorkflow(workflowId) {
      selectedWorkflowId.value = workflowId;
      try {
        await loadSelectedWorkflow();
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      }
    }
    async function openTemplatePicker() {
      showTemplatePicker.value = true;
      templatesLoading.value = true;
      try {
        const res = await fetchTemplates();
        templates.value = res.templates;
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      } finally {
        templatesLoading.value = false;
      }
    }
    async function onTemplateSelect(templateId) {
      showTemplatePicker.value = false;
      try {
        const { workflowId } = await createFromTemplate(templateId);
        const list = await fetchWorkflowList();
        workflows.value = list.workflows;
        activeWorkflowId.value = list.activeWorkflowId;
        selectedWorkflowId.value = workflowId;
        await loadSelectedWorkflow();
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      }
    }
    async function openConfigDrawer(workflowId) {
      configWorkflowId.value = workflowId;
      showConfigDrawer.value = true;
      try {
        configDefinition.value = await fetchWorkflow(workflowId);
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      }
    }
    async function onConfigSave(definition) {
      if (!configWorkflowId.value) return;
      configSaving.value = true;
      actionError.value = null;
      try {
        await saveWorkflow(configWorkflowId.value, definition);
        const list = await fetchWorkflowList();
        workflows.value = list.workflows;
        if (selectedWorkflowId.value === configWorkflowId.value) {
          await loadSelectedWorkflow();
        }
        showConfigDrawer.value = false;
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      } finally {
        configSaving.value = false;
      }
    }
    async function onConfigActivate() {
      if (!configWorkflowId.value) return;
      try {
        await activateWorkflow(configWorkflowId.value);
        const list = await fetchWorkflowList();
        workflows.value = list.workflows;
        activeWorkflowId.value = list.activeWorkflowId;
        selectedWorkflowId.value = configWorkflowId.value;
        await loadSelectedWorkflow();
        showConfigDrawer.value = false;
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      }
    }
    async function onConfigDelete() {
      if (!configWorkflowId.value) return;
      try {
        await deleteWorkflow(configWorkflowId.value);
        const list = await fetchWorkflowList();
        workflows.value = list.workflows;
        activeWorkflowId.value = list.activeWorkflowId;
        selectedWorkflowId.value = list.activeWorkflowId;
        showConfigDrawer.value = false;
        await loadSelectedWorkflow();
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      }
    }
    function selectStep(stepId) {
      viewingStepId.value = stepId;
    }
    function openWorkspaceDesigner() {
      if (!selectedWorkflowId.value) return;
      showWorkspaceDesigner.value = true;
    }
    async function onWorkspaceSaved(definition) {
      if (selectedWorkflowId.value && activeStepId.value === definition.stepId) {
        fetchedWorkspace.value = definition;
      }
      showWorkspaceDesigner.value = false;
    }
    function toggleSkill(name) {
      const idx = selectedSkills.value.indexOf(name);
      if (idx >= 0) {
        selectedSkills.value.splice(idx, 1);
      } else {
        selectedSkills.value.push(name);
      }
    }
    async function refreshWorkspaceForStep(workflowId, stepId) {
      try {
        fetchedWorkspace.value = await fetchWorkspace(workflowId, stepId);
      } catch {
        fetchedWorkspace.value = getLegacyWorkspace(stepId) ?? null;
      }
    }
    async function onAdvance(action) {
      if (!canOperateActive.value || !activeWorkflowId.value) {
        actionError.value = "Switch to the active workflow to run pipeline actions.";
        return;
      }
      advancing.value = true;
      actionError.value = null;
      try {
        state.value = await advance(action, activeWorkflowId.value);
        viewingStepId.value = state.value.currentStepId;
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
      } finally {
        advancing.value = false;
      }
    }
    async function onStepSend(payload) {
      if (!canOperateActive.value || !activeWorkflowId.value) {
        actionError.value = "Switch to the active workflow to run steps.";
        return;
      }
      const stepId = activeStepId.value;
      if (!stepId) return;
      if (!stepChatMemory.activeThreadId.value) {
        await ensureActiveChatThread();
      }
      const threadId = stepChatMemory.activeThreadId.value;
      if (!threadId) return;
      let expanded;
      try {
        expanded = await expandChatMessage(payload.text, payload.attachments, readWorkspaceFile);
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
        return;
      }
      console.log("onStepSend", payload.text, payload.attachments, expanded);
      stepChatMemory.addUserMessage(
        payload.text,
        payload.attachments.map((a) => a.path)
      );
      liveOutput.value[stepId] = "";
      running.value = true;
      actionError.value = null;
      try {
        const skills = selectedSkills.value.length ? selectedSkills.value : void 0;
        const useFileChat = payload.attachments.length > 0;
        stepChatFileMode.value = useFileChat;
        let eventStream;
        if (useFileChat) {
          eventStream = fileChat(
            payload.attachments.map((a) => a.path),
            expanded,
            skills,
            stepId,
            threadId,
            activeWorkflowId.value
          );
        } else {
          eventStream = stepChat(
            expanded,
            stepId,
            activeWorkflowId.value,
            threadId,
            skills,
            "agent"
          );
        }
        for await (const event of eventStream) {
          if (event.type === "message") {
            const content = event.chunk.content ?? "";
            if (content) {
              stepChatMemory.addAssistantChunk(content);
              liveOutput.value[stepId] = (liveOutput.value[stepId] ?? "") + content;
            }
          } else if (event.type === "tool_start") {
            stepChatMemory.applyToolStart(event.event);
          } else if (event.type === "tool_end") {
            stepChatMemory.applyToolEnd(event.event);
            handleWriteFileToolEnd(event.event);
            const toolName = event.event.name;
            const output = event.event.output;
            if (output) {
              handleToolEndOutput(output);
            }
            if (toolName && WORKSPACE_MUTATING_TOOLS.has(toolName) && event.event.ok !== false && activeWorkflowId.value && event.event.output && !parsePendingWorkspaceApproval(event.event.output)) {
              await refreshWorkspaceForStep(activeWorkflowId.value, stepId);
            }
          }
        }
        state.value = await fetchState(activeWorkflowId.value);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        stepChatMemory.addAssistantChunk(`

Error: ${message}`);
        actionError.value = message;
      } finally {
        running.value = false;
      }
    }
    async function onFreeSend(payload) {
      if (!freeChatMemory.activeThreadId.value) {
        await ensureActiveChatThread();
      }
      const checkpointThreadId = activeThreadCheckpointId();
      if (!checkpointThreadId) return;
      let expanded;
      try {
        expanded = await expandChatMessage(payload.text, payload.attachments, readWorkspaceFile);
      } catch (err) {
        actionError.value = err instanceof Error ? err.message : String(err);
        return;
      }
      freeChatMemory.addUserMessage(payload.text, payload.attachments.map((a) => a.path));
      freeSending.value = true;
      try {
        for await (const event of streamChatEvents(checkpointThreadId, expanded, { mode: "agent" })) {
          if (event.type === "message") {
            if (event.chunk.content) {
              freeChatMemory.addAssistantChunk(event.chunk.content, event.chunk.citations);
            }
          } else if (event.type === "tool_start") {
            freeChatMemory.applyToolStart(event.event);
          } else if (event.type === "tool_end") {
            freeChatMemory.applyToolEnd(event.event);
            handleWriteFileToolEnd(event.event);
            handleToolEndOutput(event.event.output);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        freeChatMemory.addAssistantChunk(`Error: ${message}`);
      } finally {
        freeSending.value = false;
      }
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        loading.value ? (openBlock(), createElementBlock("div", _hoisted_2$1, " Loading workflow… ")) : error.value || needsWorkflowInit.value ? (openBlock(), createElementBlock("div", _hoisted_3$1, [
          needsWorkflowInit.value && !error.value ? (openBlock(), createElementBlock("p", _hoisted_4$1, " This project has no workflow configuration yet. ")) : createCommentVNode("", true),
          error.value ? (openBlock(), createElementBlock("p", _hoisted_5$1, toDisplayString(error.value), 1)) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_6, [
            showInitWorkflowAction.value ? (openBlock(), createElementBlock("button", {
              key: 0,
              class: "btn-primary text-sm",
              disabled: initLoading.value,
              onClick: initWorkflowConfig
            }, toDisplayString(initLoading.value ? "Initializing…" : "Initialize workflow config"), 9, _hoisted_7)) : createCommentVNode("", true),
            error.value ? (openBlock(), createElementBlock("button", {
              key: 1,
              class: "btn-primary text-sm bg-gray-600 hover:bg-gray-700",
              disabled: initLoading.value,
              onClick: loadData
            }, " Retry ", 8, _hoisted_8)) : createCommentVNode("", true)
          ])
        ])) : workflow.value && state.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
          createBaseVNode("header", _hoisted_9, [
            createBaseVNode("h1", _hoisted_10, toDisplayString(workflow.value.title), 1),
            !canOperateActive.value ? (openBlock(), createElementBlock("span", _hoisted_11, " View only — active: " + toDisplayString(activeWorkflowTitle.value), 1)) : createCommentVNode("", true),
            createBaseVNode("div", _hoisted_12, [
              createBaseVNode("button", {
                class: "btn-primary text-xs py-1 px-3",
                disabled: advancing.value || running.value || !canOperateActive.value,
                onClick: _cache[0] || (_cache[0] = ($event) => onAdvance("continue"))
              }, " Continue ", 8, _hoisted_13),
              createBaseVNode("button", {
                class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50",
                disabled: advancing.value || running.value || !canOperateActive.value,
                onClick: _cache[1] || (_cache[1] = ($event) => onAdvance("skip"))
              }, " Skip ", 8, _hoisted_14),
              createBaseVNode("button", {
                class: "text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50",
                disabled: advancing.value || running.value || !canOperateActive.value,
                onClick: _cache[2] || (_cache[2] = ($event) => onAdvance("retry"))
              }, " Retry ", 8, _hoisted_15)
            ])
          ]),
          actionError.value ? (openBlock(), createElementBlock("p", _hoisted_16, toDisplayString(actionError.value), 1)) : createCommentVNode("", true),
          createBaseVNode("div", _hoisted_17, [
            createVNode(_sfc_main$5, {
              workflows: workflows.value,
              steps: sidebarSteps.value,
              "selected-workflow-id": selectedWorkflowId.value,
              "active-workflow-id": activeWorkflowId.value,
              "viewing-step-id": activeStepId.value,
              onSelectWorkflow,
              onConfigWorkflow: openConfigDrawer,
              onDesignWorkspace: openWorkspaceDesigner,
              onSelectStep: selectStep,
              onAddWorkflow: openTemplatePicker
            }, null, 8, ["workflows", "steps", "selected-workflow-id", "active-workflow-id", "viewing-step-id"]),
            createBaseVNode("div", {
              ref_key: "resizeContainer",
              ref: resizeContainer,
              class: "flex flex-1 min-w-0 min-h-0"
            }, [
              createBaseVNode("main", {
                class: "flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden border-r border-gray-200",
                style: normalizeStyle({ width: mainPanelWidth.value })
              }, [
                workspaceResolved.value && resolvedWorkspace.value ? (openBlock(), createBlock(_sfc_main$3, {
                  key: 0,
                  workspace: resolvedWorkspace.value,
                  api: panelApi,
                  runtime: panelRuntime.value
                }, null, 8, ["workspace", "runtime"])) : workspaceResolved.value ? (openBlock(), createElementBlock("p", _hoisted_18, " No workspace configured for this step. ")) : createCommentVNode("", true)
              ], 4),
              createBaseVNode("div", {
                class: "w-1 shrink-0 cursor-col-resize bg-gray-200 hover:bg-blue-400 active:bg-blue-500 transition-colors",
                title: "Drag to resize chat panel",
                onMousedown: withModifiers(startResize, ["prevent"])
              }, null, 32),
              createBaseVNode("aside", {
                class: "flex flex-row min-w-0 min-h-0 bg-white shrink-0",
                style: normalizeStyle({ width: chatPanelWidth.value })
              }, [
                createVNode(_sfc_main$m, {
                  threads: activeChatThreads.value,
                  "active-id": activeChatThreadId.value,
                  collapsed: chatListCollapsed.value,
                  "onUpdate:collapsed": _cache[3] || (_cache[3] = ($event) => chatListCollapsed.value = $event),
                  onSelect: onSelectChatThread,
                  onCreate: onCreateChatThread
                }, null, 8, ["threads", "active-id", "collapsed"]),
                createBaseVNode("div", _hoisted_19, [
                  createBaseVNode("div", _hoisted_20, [
                    createBaseVNode("button", {
                      class: normalizeClass([
                        "text-xs px-2 py-1 rounded",
                        chatMode.value === "step" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                      ]),
                      onClick: _cache[4] || (_cache[4] = ($event) => chatMode.value = "step")
                    }, " Step Chat ", 2),
                    createBaseVNode("button", {
                      class: normalizeClass([
                        "text-xs px-2 py-1 rounded",
                        chatMode.value === "free" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                      ]),
                      onClick: _cache[5] || (_cache[5] = ($event) => chatMode.value = "free")
                    }, " Free Chat ", 2),
                    chatMode.value === "step" && currentStep.value ? (openBlock(), createElementBlock("span", _hoisted_21, [
                      stepChatFileMode.value ? (openBlock(), createElementBlock("span", _hoisted_22, " File mode ")) : createCommentVNode("", true),
                      createTextVNode(" " + toDisplayString(currentStep.value.title), 1)
                    ])) : createCommentVNode("", true)
                  ]),
                  chatMode.value === "step" ? (openBlock(), createElementBlock("div", _hoisted_23, [
                    _cache[9] || (_cache[9] = createBaseVNode("span", { class: "text-[10px] text-gray-500 self-center mr-1" }, "Skills:", -1)),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(allSkills.value, (skill) => {
                      return openBlock(), createElementBlock("button", {
                        key: skill,
                        class: normalizeClass([
                          "text-[10px] px-1.5 py-0.5 rounded-full border transition-colors",
                          selectedSkills.value.includes(skill) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                        ]),
                        onClick: ($event) => toggleSkill(skill)
                      }, toDisplayString(skill), 11, _hoisted_24);
                    }), 128))
                  ])) : createCommentVNode("", true),
                  createBaseVNode("div", _hoisted_25, [
                    chatMode.value === "step" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(currentStepMessages.value, (msg, i) => {
                        return openBlock(), createBlock(unref(ChatMessage), {
                          key: `${activeStepId.value}-${i}`,
                          msg
                        }, null, 8, ["msg"]);
                      }), 128)),
                      !running.value && !currentStepMessages.value.length ? (openBlock(), createElementBlock("div", _hoisted_26, " Chat with agent to run " + toDisplayString(currentStep.value?.title ?? "this step") + ". ", 1)) : createCommentVNode("", true)
                    ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(freeChatMessages.value, (msg, i) => {
                        return openBlock(), createBlock(unref(ChatMessage), {
                          key: i,
                          msg
                        }, null, 8, ["msg"]);
                      }), 128)),
                      freeSending.value ? (openBlock(), createElementBlock("div", _hoisted_27, "Thinking…")) : createCommentVNode("", true)
                    ], 64))
                  ]),
                  unref(pendingWorkspaceApproval) ? (openBlock(), createElementBlock("div", _hoisted_28, [
                    createVNode(_sfc_main$k, {
                      compact: "",
                      summary: unref(pendingWorkspaceApproval).summary,
                      before: unref(pendingWorkspaceApproval).before,
                      after: unref(pendingWorkspaceApproval).after,
                      approving: unref(workspaceApproving),
                      onApprove: unref(onApproveWorkspaceChange),
                      onCancel: unref(onCancelWorkspaceChange)
                    }, null, 8, ["summary", "before", "after", "approving", "onApprove", "onCancel"]),
                    unref(workspaceApprovalError) ? (openBlock(), createElementBlock("p", _hoisted_29, toDisplayString(unref(workspaceApprovalError)), 1)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true),
                  chatMode.value === "step" ? (openBlock(), createBlock(unref(_sfc_main$o), {
                    key: 2,
                    ref_key: "stepChatInputRef",
                    ref: stepChatInputRef,
                    loading: running.value,
                    disabled: !canOperateActive.value,
                    onSend: onStepSend
                  }, null, 8, ["loading", "disabled"])) : (openBlock(), createBlock(unref(_sfc_main$o), {
                    key: 3,
                    ref_key: "freeChatInputRef",
                    ref: freeChatInputRef,
                    loading: freeSending.value,
                    onSend: onFreeSend
                  }, null, 8, ["loading"]))
                ])
              ], 4)
            ], 512)
          ]),
          createVNode(_sfc_main$4, {
            show: showTemplatePicker.value,
            templates: templates.value,
            loading: templatesLoading.value,
            onClose: _cache[6] || (_cache[6] = ($event) => showTemplatePicker.value = false),
            onSelect: onTemplateSelect
          }, null, 8, ["show", "templates", "loading"]),
          createVNode(_sfc_main$8, {
            show: showConfigDrawer.value,
            workflow: configWorkflowSummary.value,
            definition: configDefinition.value,
            saving: configSaving.value,
            onClose: _cache[7] || (_cache[7] = ($event) => showConfigDrawer.value = false),
            onSave: onConfigSave,
            onActivate: onConfigActivate,
            onDelete: onConfigDelete
          }, null, 8, ["show", "workflow", "definition", "saving"]),
          createVNode(_sfc_main$6, {
            show: showWorkspaceDesigner.value,
            "workflow-id": selectedWorkflowId.value,
            steps: workflow.value.steps.map((s) => ({ id: s.id, title: s.title })),
            "initial-step-id": activeStepId.value,
            skills: allSkills.value,
            "panel-api": panelApi,
            onClose: _cache[8] || (_cache[8] = ($event) => showWorkspaceDesigner.value = false),
            onSaved: onWorkspaceSaved
          }, null, 8, ["show", "workflow-id", "steps", "initial-step-id", "skills"])
        ], 64)) : createCommentVNode("", true)
      ]);
    };
  }
});
const _hoisted_1 = { class: "flex flex-col h-full" };
const _hoisted_2 = { class: "flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white" };
const _hoisted_3 = { class: "flex gap-2 ml-4" };
const _hoisted_4 = ["onClick"];
const _hoisted_5 = { class: "text-xs text-gray-500 truncate flex-1" };
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AppShell",
  setup(__props) {
    const view = /* @__PURE__ */ ref("home");
    const workspace = /* @__PURE__ */ ref("");
    onMounted(async () => {
      workspace.value = await window.desktop.getWorkspace();
      const recent = await window.desktop.getRecentProjects();
      view.value = workspace.value && recent.includes(workspace.value) ? "workflow" : "home";
    });
    function onProjectOpened(path) {
      workspace.value = path;
      view.value = "workflow";
    }
    const navItems = [
      { id: "home", label: "Home" },
      { id: "workflow", label: "Workflow" },
      { id: "topology", label: "Topology" },
      { id: "chat", label: "Chat" },
      { id: "langflow", label: "Langflow" },
      { id: "settings", label: "Settings" }
    ];
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("header", _hoisted_2, [
          _cache[2] || (_cache[2] = createBaseVNode("strong", null, "Agent Flow Desktop", -1)),
          createBaseVNode("nav", _hoisted_3, [
            (openBlock(), createElementBlock(Fragment, null, renderList(navItems, (item) => {
              return createBaseVNode("button", {
                key: item.id,
                class: normalizeClass(["text-sm px-2 py-1 rounded", view.value === item.id ? "bg-blue-100 text-blue-700" : "text-gray-600"]),
                onClick: ($event) => view.value = item.id
              }, toDisplayString(item.label), 11, _hoisted_4);
            }), 64))
          ]),
          createBaseVNode("span", _hoisted_5, toDisplayString(workspace.value), 1)
        ]),
        view.value === "home" ? (openBlock(), createBlock(_sfc_main$f, {
          key: 0,
          onOpened: onProjectOpened
        })) : view.value === "workflow" ? (openBlock(), createBlock(_sfc_main$2, {
          key: 1,
          workspace: workspace.value
        }, null, 8, ["workspace"])) : view.value === "topology" ? (openBlock(), createBlock(_sfc_main$9, {
          key: 2,
          workspace: workspace.value
        }, null, 8, ["workspace"])) : view.value === "chat" ? (openBlock(), createBlock(_sfc_main$j, {
          key: 3,
          workspace: workspace.value,
          "onUpdate:workspace": _cache[0] || (_cache[0] = ($event) => workspace.value = $event)
        }, null, 8, ["workspace"])) : view.value === "langflow" ? (openBlock(), createBlock(_sfc_main$g, {
          key: 4,
          workspace: workspace.value
        }, null, 8, ["workspace"])) : (openBlock(), createBlock(_sfc_main$e, {
          key: 5,
          onBack: _cache[1] || (_cache[1] = ($event) => view.value = "home")
        }))
      ]);
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1);
    };
  }
});
createApp(_sfc_main).mount("#app");
export {
  Fragment as F,
  Teleport as T,
  _sfc_main$h as _,
  onMounted as a,
  createElementBlock as b,
  createBlock as c,
  defineComponent as d,
  createBaseVNode as e,
  renderList as f,
  createCommentVNode as g,
  createVNode as h,
  computed as i,
  withDirectives as j,
  normalizeStyle as k,
  onUnmounted as l,
  withModifiers as m,
  normalizeClass as n,
  openBlock as o,
  normalizeWorkspacePath as p,
  g as q,
  ref as r,
  createTextVNode as s,
  toDisplayString as t,
  unref as u,
  vModelText as v,
  watch as w,
  useLangflow as x
};
