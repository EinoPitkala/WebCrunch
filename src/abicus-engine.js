// node_modules/neverthrow/dist/index.es.js
var defaultErrorConfig = {
  withStackTrace: false
};
var createNeverThrowError = (message, result, config2 = defaultErrorConfig) => {
  const data = result.isOk() ? { type: "Ok", value: result.value } : { type: "Err", value: result.error };
  const maybeStack = config2.withStackTrace ? new Error().stack : void 0;
  return {
    data,
    message,
    stack: maybeStack
  };
};
function __awaiter(thisArg, _arguments, P3, generator) {
  function adopt(value) {
    return value instanceof P3 ? value : new P3(function(resolve) {
      resolve(value);
    });
  }
  return new (P3 || (P3 = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __values(o2) {
  var s2 = typeof Symbol === "function" && Symbol.iterator, m2 = s2 && o2[s2], i2 = 0;
  if (m2) return m2.call(o2);
  if (o2 && typeof o2.length === "number") return {
    next: function() {
      if (o2 && i2 >= o2.length) o2 = void 0;
      return { value: o2 && o2[i2++], done: !o2 };
    }
  };
  throw new TypeError(s2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __await(v2) {
  return this instanceof __await ? (this.v = v2, this) : new __await(v2);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g2 = generator.apply(thisArg, _arguments || []), i2, q = [];
  return i2 = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i2[Symbol.asyncIterator] = function() {
    return this;
  }, i2;
  function awaitReturn(f2) {
    return function(v2) {
      return Promise.resolve(v2).then(f2, reject);
    };
  }
  function verb(n2, f2) {
    if (g2[n2]) {
      i2[n2] = function(v2) {
        return new Promise(function(a2, b2) {
          q.push([n2, v2, a2, b2]) > 1 || resume(n2, v2);
        });
      };
      if (f2) i2[n2] = f2(i2[n2]);
    }
  }
  function resume(n2, v2) {
    try {
      step(g2[n2](v2));
    } catch (e2) {
      settle(q[0][3], e2);
    }
  }
  function step(r2) {
    r2.value instanceof __await ? Promise.resolve(r2.value.v).then(fulfill, reject) : settle(q[0][2], r2);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f2, v2) {
    if (f2(v2), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
}
function __asyncDelegator(o2) {
  var i2, p2;
  return i2 = {}, verb("next"), verb("throw", function(e2) {
    throw e2;
  }), verb("return"), i2[Symbol.iterator] = function() {
    return this;
  }, i2;
  function verb(n2, f2) {
    i2[n2] = o2[n2] ? function(v2) {
      return (p2 = !p2) ? { value: __await(o2[n2](v2)), done: false } : f2 ? f2(v2) : v2;
    } : f2;
  }
}
function __asyncValues(o2) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m2 = o2[Symbol.asyncIterator], i2;
  return m2 ? m2.call(o2) : (o2 = typeof __values === "function" ? __values(o2) : o2[Symbol.iterator](), i2 = {}, verb("next"), verb("throw"), verb("return"), i2[Symbol.asyncIterator] = function() {
    return this;
  }, i2);
  function verb(n2) {
    i2[n2] = o2[n2] && function(v2) {
      return new Promise(function(resolve, reject) {
        v2 = o2[n2](v2), settle(resolve, reject, v2.done, v2.value);
      });
    };
  }
  function settle(resolve, reject, d2, v2) {
    Promise.resolve(v2).then(function(v3) {
      resolve({ value: v3, done: d2 });
    }, reject);
  }
}
var ResultAsync = class _ResultAsync {
  constructor(res) {
    this._promise = res;
  }
  static fromSafePromise(promise) {
    const newPromise = promise.then((value) => new Ok(value));
    return new _ResultAsync(newPromise);
  }
  static fromPromise(promise, errorFn) {
    const newPromise = promise.then((value) => new Ok(value)).catch((e2) => new Err(errorFn(e2)));
    return new _ResultAsync(newPromise);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromThrowable(fn, errorFn) {
    return (...args) => {
      return new _ResultAsync((() => __awaiter(this, void 0, void 0, function* () {
        try {
          return new Ok(yield fn(...args));
        } catch (error) {
          return new Err(errorFn ? errorFn(error) : error);
        }
      }))());
    };
  }
  static combine(asyncResultList) {
    return combineResultAsyncList(asyncResultList);
  }
  static combineWithAllErrors(asyncResultList) {
    return combineResultAsyncListWithAllErrors(asyncResultList);
  }
  map(f2) {
    return new _ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
      if (res.isErr()) {
        return new Err(res.error);
      }
      return new Ok(yield f2(res.value));
    })));
  }
  andThrough(f2) {
    return new _ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
      if (res.isErr()) {
        return new Err(res.error);
      }
      const newRes = yield f2(res.value);
      if (newRes.isErr()) {
        return new Err(newRes.error);
      }
      return new Ok(res.value);
    })));
  }
  andTee(f2) {
    return new _ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
      if (res.isErr()) {
        return new Err(res.error);
      }
      try {
        yield f2(res.value);
      } catch (e2) {
      }
      return new Ok(res.value);
    })));
  }
  orTee(f2) {
    return new _ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
      if (res.isOk()) {
        return new Ok(res.value);
      }
      try {
        yield f2(res.error);
      } catch (e2) {
      }
      return new Err(res.error);
    })));
  }
  mapErr(f2) {
    return new _ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
      if (res.isOk()) {
        return new Ok(res.value);
      }
      return new Err(yield f2(res.error));
    })));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThen(f2) {
    return new _ResultAsync(this._promise.then((res) => {
      if (res.isErr()) {
        return new Err(res.error);
      }
      const newValue = f2(res.value);
      return newValue instanceof _ResultAsync ? newValue._promise : newValue;
    }));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  orElse(f2) {
    return new _ResultAsync(this._promise.then((res) => __awaiter(this, void 0, void 0, function* () {
      if (res.isErr()) {
        return f2(res.error);
      }
      return new Ok(res.value);
    })));
  }
  match(ok2, _err) {
    return this._promise.then((res) => res.match(ok2, _err));
  }
  unwrapOr(t2) {
    return this._promise.then((res) => res.unwrapOr(t2));
  }
  /**
   * @deprecated will be removed in 9.0.0.
   *
   * You can use `safeTry` without this method.
   * @example
   * ```typescript
   * safeTry(async function* () {
   *   const okValue = yield* yourResult
   * })
   * ```
   * Emulates Rust's `?` operator in `safeTry`'s body. See also `safeTry`.
   */
  safeUnwrap() {
    return __asyncGenerator(this, arguments, function* safeUnwrap_1() {
      return yield __await(yield __await(yield* __asyncDelegator(__asyncValues(yield __await(this._promise.then((res) => res.safeUnwrap()))))));
    });
  }
  // Makes ResultAsync implement PromiseLike<Result>
  then(successCallback, failureCallback) {
    return this._promise.then(successCallback, failureCallback);
  }
  [Symbol.asyncIterator]() {
    return __asyncGenerator(this, arguments, function* _a() {
      const result = yield __await(this._promise);
      if (result.isErr()) {
        yield yield __await(errAsync(result.error));
      }
      return yield __await(result.value);
    });
  }
};
function errAsync(err2) {
  return new ResultAsync(Promise.resolve(new Err(err2)));
}
var fromPromise = ResultAsync.fromPromise;
var fromSafePromise = ResultAsync.fromSafePromise;
var fromAsyncThrowable = ResultAsync.fromThrowable;
var combineResultList = (resultList) => {
  let acc = ok([]);
  for (const result of resultList) {
    if (result.isErr()) {
      acc = err(result.error);
      break;
    } else {
      acc.map((list) => list.push(result.value));
    }
  }
  return acc;
};
var combineResultAsyncList = (asyncResultList) => ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(combineResultList);
var combineResultListWithAllErrors = (resultList) => {
  let acc = ok([]);
  for (const result of resultList) {
    if (result.isErr() && acc.isErr()) {
      acc.error.push(result.error);
    } else if (result.isErr() && acc.isOk()) {
      acc = err([result.error]);
    } else if (result.isOk() && acc.isOk()) {
      acc.value.push(result.value);
    }
  }
  return acc;
};
var combineResultAsyncListWithAllErrors = (asyncResultList) => ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(combineResultListWithAllErrors);
var Result;
(function(Result2) {
  function fromThrowable2(fn, errorFn) {
    return (...args) => {
      try {
        const result = fn(...args);
        return ok(result);
      } catch (e2) {
        return err(errorFn ? errorFn(e2) : e2);
      }
    };
  }
  Result2.fromThrowable = fromThrowable2;
  function combine(resultList) {
    return combineResultList(resultList);
  }
  Result2.combine = combine;
  function combineWithAllErrors(resultList) {
    return combineResultListWithAllErrors(resultList);
  }
  Result2.combineWithAllErrors = combineWithAllErrors;
})(Result || (Result = {}));
function ok(value) {
  return new Ok(value);
}
function err(err2) {
  return new Err(err2);
}
var Ok = class {
  constructor(value) {
    this.value = value;
  }
  isOk() {
    return true;
  }
  isErr() {
    return !this.isOk();
  }
  map(f2) {
    return ok(f2(this.value));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapErr(_f) {
    return ok(this.value);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThen(f2) {
    return f2(this.value);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThrough(f2) {
    return f2(this.value).map((_value) => this.value);
  }
  andTee(f2) {
    try {
      f2(this.value);
    } catch (e2) {
    }
    return ok(this.value);
  }
  orTee(_f) {
    return ok(this.value);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  orElse(_f) {
    return ok(this.value);
  }
  asyncAndThen(f2) {
    return f2(this.value);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  asyncAndThrough(f2) {
    return f2(this.value).map(() => this.value);
  }
  asyncMap(f2) {
    return ResultAsync.fromSafePromise(f2(this.value));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unwrapOr(_v) {
    return this.value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match(ok2, _err) {
    return ok2(this.value);
  }
  safeUnwrap() {
    const value = this.value;
    return (function* () {
      return value;
    })();
  }
  _unsafeUnwrap(_2) {
    return this.value;
  }
  _unsafeUnwrapErr(config2) {
    throw createNeverThrowError("Called `_unsafeUnwrapErr` on an Ok", this, config2);
  }
  // eslint-disable-next-line @typescript-eslint/no-this-alias, require-yield
  *[Symbol.iterator]() {
    return this.value;
  }
};
var Err = class {
  constructor(error) {
    this.error = error;
  }
  isOk() {
    return false;
  }
  isErr() {
    return !this.isOk();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  map(_f) {
    return err(this.error);
  }
  mapErr(f2) {
    return err(f2(this.error));
  }
  andThrough(_f) {
    return err(this.error);
  }
  andTee(_f) {
    return err(this.error);
  }
  orTee(f2) {
    try {
      f2(this.error);
    } catch (e2) {
    }
    return err(this.error);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThen(_f) {
    return err(this.error);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  orElse(f2) {
    return f2(this.error);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asyncAndThen(_f) {
    return errAsync(this.error);
  }
  asyncAndThrough(_f) {
    return errAsync(this.error);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  asyncMap(_f) {
    return errAsync(this.error);
  }
  unwrapOr(v2) {
    return v2;
  }
  match(_ok, err2) {
    return err2(this.error);
  }
  safeUnwrap() {
    const error = this.error;
    return (function* () {
      yield err(error);
      throw new Error("Do not use this generator out of `safeTry`");
    })();
  }
  _unsafeUnwrap(config2) {
    throw createNeverThrowError("Called `_unsafeUnwrap` on an Err", this, config2);
  }
  _unsafeUnwrapErr(_2) {
    return this.error;
  }
  *[Symbol.iterator]() {
    const self = this;
    yield self;
    return self;
  }
};
var fromThrowable = Result.fromThrowable;

// node_modules/decimal.js/decimal.mjs
var EXP_LIMIT = 9e15;
var MAX_DIGITS = 1e9;
var NUMERALS = "0123456789abcdef";
var LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
var PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
var DEFAULTS = {
  // These values must be integers within the stated ranges (inclusive).
  // Most of these values can be changed at run-time using the `Decimal.config` method.
  // The maximum number of significant digits of the result of a calculation or base conversion.
  // E.g. `Decimal.config({ precision: 20 });`
  precision: 20,
  // 1 to MAX_DIGITS
  // The rounding mode used when rounding to `precision`.
  //
  // ROUND_UP         0 Away from zero.
  // ROUND_DOWN       1 Towards zero.
  // ROUND_CEIL       2 Towards +Infinity.
  // ROUND_FLOOR      3 Towards -Infinity.
  // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
  // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
  // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
  // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
  // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
  //
  // E.g.
  // `Decimal.rounding = 4;`
  // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
  rounding: 4,
  // 0 to 8
  // The modulo mode used when calculating the modulus: a mod n.
  // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
  // The remainder (r) is calculated as: r = a - n * q.
  //
  // UP         0 The remainder is positive if the dividend is negative, else is negative.
  // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
  // FLOOR      3 The remainder has the same sign as the divisor (Python %).
  // HALF_EVEN  6 The IEEE 754 remainder function.
  // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
  //
  // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
  // division (9) are commonly used for the modulus operation. The other rounding modes can also
  // be used, but they may not give useful results.
  modulo: 1,
  // 0 to 9
  // The exponent value at and beneath which `toString` returns exponential notation.
  // JavaScript numbers: -7
  toExpNeg: -7,
  // 0 to -EXP_LIMIT
  // The exponent value at and above which `toString` returns exponential notation.
  // JavaScript numbers: 21
  toExpPos: 21,
  // 0 to EXP_LIMIT
  // The minimum exponent value, beneath which underflow to zero occurs.
  // JavaScript numbers: -324  (5e-324)
  minE: -EXP_LIMIT,
  // -1 to -EXP_LIMIT
  // The maximum exponent value, above which overflow to Infinity occurs.
  // JavaScript numbers: 308  (1.7976931348623157e+308)
  maxE: EXP_LIMIT,
  // 1 to EXP_LIMIT
  // Whether to use cryptographically-secure random number generation, if available.
  crypto: false
  // true/false
};
var inexact;
var quadrant;
var external = true;
var decimalError = "[DecimalError] ";
var invalidArgument = decimalError + "Invalid argument: ";
var precisionLimitExceeded = decimalError + "Precision limit exceeded";
var cryptoUnavailable = decimalError + "crypto unavailable";
var tag = "[object Decimal]";
var mathfloor = Math.floor;
var mathpow = Math.pow;
var isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
var isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
var isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
var isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
var BASE = 1e7;
var LOG_BASE = 7;
var MAX_SAFE_INTEGER = 9007199254740991;
var LN10_PRECISION = LN10.length - 1;
var PI_PRECISION = PI.length - 1;
var P = { toStringTag: tag };
P.absoluteValue = P.abs = function() {
  var x2 = new this.constructor(this);
  if (x2.s < 0) x2.s = 1;
  return finalise(x2);
};
P.ceil = function() {
  return finalise(new this.constructor(this), this.e + 1, 2);
};
P.clampedTo = P.clamp = function(min2, max2) {
  var k2, x2 = this, Ctor = x2.constructor;
  min2 = new Ctor(min2);
  max2 = new Ctor(max2);
  if (!min2.s || !max2.s) return new Ctor(NaN);
  if (min2.gt(max2)) throw Error(invalidArgument + max2);
  k2 = x2.cmp(min2);
  return k2 < 0 ? min2 : x2.cmp(max2) > 0 ? max2 : new Ctor(x2);
};
P.comparedTo = P.cmp = function(y2) {
  var i2, j2, xdL, ydL, x2 = this, xd = x2.d, yd = (y2 = new x2.constructor(y2)).d, xs = x2.s, ys = y2.s;
  if (!xd || !yd) {
    return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
  }
  if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;
  if (xs !== ys) return xs;
  if (x2.e !== y2.e) return x2.e > y2.e ^ xs < 0 ? 1 : -1;
  xdL = xd.length;
  ydL = yd.length;
  for (i2 = 0, j2 = xdL < ydL ? xdL : ydL; i2 < j2; ++i2) {
    if (xd[i2] !== yd[i2]) return xd[i2] > yd[i2] ^ xs < 0 ? 1 : -1;
  }
  return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
};
P.cosine = P.cos = function() {
  var pr, rm, x2 = this, Ctor = x2.constructor;
  if (!x2.d) return new Ctor(NaN);
  if (!x2.d[0]) return new Ctor(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x2.e, x2.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x2 = cosine(Ctor, toLessThanHalfPi(Ctor, x2));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 3 ? x2.neg() : x2, pr, rm, true);
};
P.cubeRoot = P.cbrt = function() {
  var e2, m2, n2, r2, rep, s2, sd, t2, t3, t3plusx, x2 = this, Ctor = x2.constructor;
  if (!x2.isFinite() || x2.isZero()) return new Ctor(x2);
  external = false;
  s2 = x2.s * mathpow(x2.s * x2, 1 / 3);
  if (!s2 || Math.abs(s2) == 1 / 0) {
    n2 = digitsToString(x2.d);
    e2 = x2.e;
    if (s2 = (e2 - n2.length + 1) % 3) n2 += s2 == 1 || s2 == -2 ? "0" : "00";
    s2 = mathpow(n2, 1 / 3);
    e2 = mathfloor((e2 + 1) / 3) - (e2 % 3 == (e2 < 0 ? -1 : 2));
    if (s2 == 1 / 0) {
      n2 = "5e" + e2;
    } else {
      n2 = s2.toExponential();
      n2 = n2.slice(0, n2.indexOf("e") + 1) + e2;
    }
    r2 = new Ctor(n2);
    r2.s = x2.s;
  } else {
    r2 = new Ctor(s2.toString());
  }
  sd = (e2 = Ctor.precision) + 3;
  for (; ; ) {
    t2 = r2;
    t3 = t2.times(t2).times(t2);
    t3plusx = t3.plus(x2);
    r2 = divide(t3plusx.plus(x2).times(t2), t3plusx.plus(t3), sd + 2, 1);
    if (digitsToString(t2.d).slice(0, sd) === (n2 = digitsToString(r2.d)).slice(0, sd)) {
      n2 = n2.slice(sd - 3, sd + 1);
      if (n2 == "9999" || !rep && n2 == "4999") {
        if (!rep) {
          finalise(t2, e2 + 1, 0);
          if (t2.times(t2).times(t2).eq(x2)) {
            r2 = t2;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n2 || !+n2.slice(1) && n2.charAt(0) == "5") {
          finalise(r2, e2 + 1, 1);
          m2 = !r2.times(r2).times(r2).eq(x2);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r2, e2, Ctor.rounding, m2);
};
P.decimalPlaces = P.dp = function() {
  var w2, d2 = this.d, n2 = NaN;
  if (d2) {
    w2 = d2.length - 1;
    n2 = (w2 - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
    w2 = d2[w2];
    if (w2) for (; w2 % 10 == 0; w2 /= 10) n2--;
    if (n2 < 0) n2 = 0;
  }
  return n2;
};
P.dividedBy = P.div = function(y2) {
  return divide(this, new this.constructor(y2));
};
P.dividedToIntegerBy = P.divToInt = function(y2) {
  var x2 = this, Ctor = x2.constructor;
  return finalise(divide(x2, new Ctor(y2), 0, 1, 1), Ctor.precision, Ctor.rounding);
};
P.equals = P.eq = function(y2) {
  return this.cmp(y2) === 0;
};
P.floor = function() {
  return finalise(new this.constructor(this), this.e + 1, 3);
};
P.greaterThan = P.gt = function(y2) {
  return this.cmp(y2) > 0;
};
P.greaterThanOrEqualTo = P.gte = function(y2) {
  var k2 = this.cmp(y2);
  return k2 == 1 || k2 === 0;
};
P.hyperbolicCosine = P.cosh = function() {
  var k2, n2, pr, rm, len, x2 = this, Ctor = x2.constructor, one = new Ctor(1);
  if (!x2.isFinite()) return new Ctor(x2.s ? 1 / 0 : NaN);
  if (x2.isZero()) return one;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x2.e, x2.sd()) + 4;
  Ctor.rounding = 1;
  len = x2.d.length;
  if (len < 32) {
    k2 = Math.ceil(len / 3);
    n2 = (1 / tinyPow(4, k2)).toString();
  } else {
    k2 = 16;
    n2 = "2.3283064365386962890625e-10";
  }
  x2 = taylorSeries(Ctor, 1, x2.times(n2), new Ctor(1), true);
  var cosh2_x, i2 = k2, d8 = new Ctor(8);
  for (; i2--; ) {
    cosh2_x = x2.times(x2);
    x2 = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
  }
  return finalise(x2, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.hyperbolicSine = P.sinh = function() {
  var k2, pr, rm, len, x2 = this, Ctor = x2.constructor;
  if (!x2.isFinite() || x2.isZero()) return new Ctor(x2);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x2.e, x2.sd()) + 4;
  Ctor.rounding = 1;
  len = x2.d.length;
  if (len < 3) {
    x2 = taylorSeries(Ctor, 2, x2, x2, true);
  } else {
    k2 = 1.4 * Math.sqrt(len);
    k2 = k2 > 16 ? 16 : k2 | 0;
    x2 = x2.times(1 / tinyPow(5, k2));
    x2 = taylorSeries(Ctor, 2, x2, x2, true);
    var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
    for (; k2--; ) {
      sinh2_x = x2.times(x2);
      x2 = x2.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
    }
  }
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(x2, pr, rm, true);
};
P.hyperbolicTangent = P.tanh = function() {
  var pr, rm, x2 = this, Ctor = x2.constructor;
  if (!x2.isFinite()) return new Ctor(x2.s);
  if (x2.isZero()) return new Ctor(x2);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 7;
  Ctor.rounding = 1;
  return divide(x2.sinh(), x2.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
};
P.inverseCosine = P.acos = function() {
  var x2 = this, Ctor = x2.constructor, k2 = x2.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
  if (k2 !== -1) {
    return k2 === 0 ? x2.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
  }
  if (x2.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x2 = new Ctor(1).minus(x2).div(x2.plus(1)).sqrt().atan();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x2.times(2);
};
P.inverseHyperbolicCosine = P.acosh = function() {
  var pr, rm, x2 = this, Ctor = x2.constructor;
  if (x2.lte(1)) return new Ctor(x2.eq(1) ? 0 : NaN);
  if (!x2.isFinite()) return new Ctor(x2);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(Math.abs(x2.e), x2.sd()) + 4;
  Ctor.rounding = 1;
  external = false;
  x2 = x2.times(x2).minus(1).sqrt().plus(x2);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x2.ln();
};
P.inverseHyperbolicSine = P.asinh = function() {
  var pr, rm, x2 = this, Ctor = x2.constructor;
  if (!x2.isFinite() || x2.isZero()) return new Ctor(x2);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 2 * Math.max(Math.abs(x2.e), x2.sd()) + 6;
  Ctor.rounding = 1;
  external = false;
  x2 = x2.times(x2).plus(1).sqrt().plus(x2);
  external = true;
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x2.ln();
};
P.inverseHyperbolicTangent = P.atanh = function() {
  var pr, rm, wpr, xsd, x2 = this, Ctor = x2.constructor;
  if (!x2.isFinite()) return new Ctor(NaN);
  if (x2.e >= 0) return new Ctor(x2.abs().eq(1) ? x2.s / 0 : x2.isZero() ? x2 : NaN);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  xsd = x2.sd();
  if (Math.max(xsd, pr) < 2 * -x2.e - 1) return finalise(new Ctor(x2), pr, rm, true);
  Ctor.precision = wpr = xsd - x2.e;
  x2 = divide(x2.plus(1), new Ctor(1).minus(x2), wpr + pr, 1);
  Ctor.precision = pr + 4;
  Ctor.rounding = 1;
  x2 = x2.ln();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x2.times(0.5);
};
P.inverseSine = P.asin = function() {
  var halfPi, k2, pr, rm, x2 = this, Ctor = x2.constructor;
  if (x2.isZero()) return new Ctor(x2);
  k2 = x2.abs().cmp(1);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (k2 !== -1) {
    if (k2 === 0) {
      halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
      halfPi.s = x2.s;
      return halfPi;
    }
    return new Ctor(NaN);
  }
  Ctor.precision = pr + 6;
  Ctor.rounding = 1;
  x2 = x2.div(new Ctor(1).minus(x2.times(x2)).sqrt().plus(1)).atan();
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return x2.times(2);
};
P.inverseTangent = P.atan = function() {
  var i2, j2, k2, n2, px, t2, r2, wpr, x2, x3 = this, Ctor = x3.constructor, pr = Ctor.precision, rm = Ctor.rounding;
  if (!x3.isFinite()) {
    if (!x3.s) return new Ctor(NaN);
    if (pr + 4 <= PI_PRECISION) {
      r2 = getPi(Ctor, pr + 4, rm).times(0.5);
      r2.s = x3.s;
      return r2;
    }
  } else if (x3.isZero()) {
    return new Ctor(x3);
  } else if (x3.abs().eq(1) && pr + 4 <= PI_PRECISION) {
    r2 = getPi(Ctor, pr + 4, rm).times(0.25);
    r2.s = x3.s;
    return r2;
  }
  Ctor.precision = wpr = pr + 10;
  Ctor.rounding = 1;
  k2 = Math.min(28, wpr / LOG_BASE + 2 | 0);
  for (i2 = k2; i2; --i2) x3 = x3.div(x3.times(x3).plus(1).sqrt().plus(1));
  external = false;
  j2 = Math.ceil(wpr / LOG_BASE);
  n2 = 1;
  x2 = x3.times(x3);
  r2 = new Ctor(x3);
  px = x3;
  for (; i2 !== -1; ) {
    px = px.times(x2);
    t2 = r2.minus(px.div(n2 += 2));
    px = px.times(x2);
    r2 = t2.plus(px.div(n2 += 2));
    if (r2.d[j2] !== void 0) for (i2 = j2; r2.d[i2] === t2.d[i2] && i2--; ) ;
  }
  if (k2) r2 = r2.times(2 << k2 - 1);
  external = true;
  return finalise(r2, Ctor.precision = pr, Ctor.rounding = rm, true);
};
P.isFinite = function() {
  return !!this.d;
};
P.isInteger = P.isInt = function() {
  return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
};
P.isNaN = function() {
  return !this.s;
};
P.isNegative = P.isNeg = function() {
  return this.s < 0;
};
P.isPositive = P.isPos = function() {
  return this.s > 0;
};
P.isZero = function() {
  return !!this.d && this.d[0] === 0;
};
P.lessThan = P.lt = function(y2) {
  return this.cmp(y2) < 0;
};
P.lessThanOrEqualTo = P.lte = function(y2) {
  return this.cmp(y2) < 1;
};
P.logarithm = P.log = function(base) {
  var isBase10, d2, denominator, k2, inf, num, sd, r2, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
  if (base == null) {
    base = new Ctor(10);
    isBase10 = true;
  } else {
    base = new Ctor(base);
    d2 = base.d;
    if (base.s < 0 || !d2 || !d2[0] || base.eq(1)) return new Ctor(NaN);
    isBase10 = base.eq(10);
  }
  d2 = arg.d;
  if (arg.s < 0 || !d2 || !d2[0] || arg.eq(1)) {
    return new Ctor(d2 && !d2[0] ? -1 / 0 : arg.s != 1 ? NaN : d2 ? 0 : 1 / 0);
  }
  if (isBase10) {
    if (d2.length > 1) {
      inf = true;
    } else {
      for (k2 = d2[0]; k2 % 10 === 0; ) k2 /= 10;
      inf = k2 !== 1;
    }
  }
  external = false;
  sd = pr + guard;
  num = naturalLogarithm(arg, sd);
  denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
  r2 = divide(num, denominator, sd, 1);
  if (checkRoundingDigits(r2.d, k2 = pr, rm)) {
    do {
      sd += 10;
      num = naturalLogarithm(arg, sd);
      denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
      r2 = divide(num, denominator, sd, 1);
      if (!inf) {
        if (+digitsToString(r2.d).slice(k2 + 1, k2 + 15) + 1 == 1e14) {
          r2 = finalise(r2, pr + 1, 0);
        }
        break;
      }
    } while (checkRoundingDigits(r2.d, k2 += 10, rm));
  }
  external = true;
  return finalise(r2, pr, rm);
};
P.minus = P.sub = function(y2) {
  var d2, e2, i2, j2, k2, len, pr, rm, xd, xe, xLTy, yd, x2 = this, Ctor = x2.constructor;
  y2 = new Ctor(y2);
  if (!x2.d || !y2.d) {
    if (!x2.s || !y2.s) y2 = new Ctor(NaN);
    else if (x2.d) y2.s = -y2.s;
    else y2 = new Ctor(y2.d || x2.s !== y2.s ? x2 : NaN);
    return y2;
  }
  if (x2.s != y2.s) {
    y2.s = -y2.s;
    return x2.plus(y2);
  }
  xd = x2.d;
  yd = y2.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (yd[0]) y2.s = -y2.s;
    else if (xd[0]) y2 = new Ctor(x2);
    else return new Ctor(rm === 3 ? -0 : 0);
    return external ? finalise(y2, pr, rm) : y2;
  }
  e2 = mathfloor(y2.e / LOG_BASE);
  xe = mathfloor(x2.e / LOG_BASE);
  xd = xd.slice();
  k2 = xe - e2;
  if (k2) {
    xLTy = k2 < 0;
    if (xLTy) {
      d2 = xd;
      k2 = -k2;
      len = yd.length;
    } else {
      d2 = yd;
      e2 = xe;
      len = xd.length;
    }
    i2 = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
    if (k2 > i2) {
      k2 = i2;
      d2.length = 1;
    }
    d2.reverse();
    for (i2 = k2; i2--; ) d2.push(0);
    d2.reverse();
  } else {
    i2 = xd.length;
    len = yd.length;
    xLTy = i2 < len;
    if (xLTy) len = i2;
    for (i2 = 0; i2 < len; i2++) {
      if (xd[i2] != yd[i2]) {
        xLTy = xd[i2] < yd[i2];
        break;
      }
    }
    k2 = 0;
  }
  if (xLTy) {
    d2 = xd;
    xd = yd;
    yd = d2;
    y2.s = -y2.s;
  }
  len = xd.length;
  for (i2 = yd.length - len; i2 > 0; --i2) xd[len++] = 0;
  for (i2 = yd.length; i2 > k2; ) {
    if (xd[--i2] < yd[i2]) {
      for (j2 = i2; j2 && xd[--j2] === 0; ) xd[j2] = BASE - 1;
      --xd[j2];
      xd[i2] += BASE;
    }
    xd[i2] -= yd[i2];
  }
  for (; xd[--len] === 0; ) xd.pop();
  for (; xd[0] === 0; xd.shift()) --e2;
  if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);
  y2.d = xd;
  y2.e = getBase10Exponent(xd, e2);
  return external ? finalise(y2, pr, rm) : y2;
};
P.modulo = P.mod = function(y2) {
  var q, x2 = this, Ctor = x2.constructor;
  y2 = new Ctor(y2);
  if (!x2.d || !y2.s || y2.d && !y2.d[0]) return new Ctor(NaN);
  if (!y2.d || x2.d && !x2.d[0]) {
    return finalise(new Ctor(x2), Ctor.precision, Ctor.rounding);
  }
  external = false;
  if (Ctor.modulo == 9) {
    q = divide(x2, y2.abs(), 0, 3, 1);
    q.s *= y2.s;
  } else {
    q = divide(x2, y2, 0, Ctor.modulo, 1);
  }
  q = q.times(y2);
  external = true;
  return x2.minus(q);
};
P.naturalExponential = P.exp = function() {
  return naturalExponential(this);
};
P.naturalLogarithm = P.ln = function() {
  return naturalLogarithm(this);
};
P.negated = P.neg = function() {
  var x2 = new this.constructor(this);
  x2.s = -x2.s;
  return finalise(x2);
};
P.plus = P.add = function(y2) {
  var carry, d2, e2, i2, k2, len, pr, rm, xd, yd, x2 = this, Ctor = x2.constructor;
  y2 = new Ctor(y2);
  if (!x2.d || !y2.d) {
    if (!x2.s || !y2.s) y2 = new Ctor(NaN);
    else if (!x2.d) y2 = new Ctor(y2.d || x2.s === y2.s ? x2 : NaN);
    return y2;
  }
  if (x2.s != y2.s) {
    y2.s = -y2.s;
    return x2.minus(y2);
  }
  xd = x2.d;
  yd = y2.d;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (!yd[0]) y2 = new Ctor(x2);
    return external ? finalise(y2, pr, rm) : y2;
  }
  k2 = mathfloor(x2.e / LOG_BASE);
  e2 = mathfloor(y2.e / LOG_BASE);
  xd = xd.slice();
  i2 = k2 - e2;
  if (i2) {
    if (i2 < 0) {
      d2 = xd;
      i2 = -i2;
      len = yd.length;
    } else {
      d2 = yd;
      e2 = k2;
      len = xd.length;
    }
    k2 = Math.ceil(pr / LOG_BASE);
    len = k2 > len ? k2 + 1 : len + 1;
    if (i2 > len) {
      i2 = len;
      d2.length = 1;
    }
    d2.reverse();
    for (; i2--; ) d2.push(0);
    d2.reverse();
  }
  len = xd.length;
  i2 = yd.length;
  if (len - i2 < 0) {
    i2 = len;
    d2 = yd;
    yd = xd;
    xd = d2;
  }
  for (carry = 0; i2; ) {
    carry = (xd[--i2] = xd[i2] + yd[i2] + carry) / BASE | 0;
    xd[i2] %= BASE;
  }
  if (carry) {
    xd.unshift(carry);
    ++e2;
  }
  for (len = xd.length; xd[--len] == 0; ) xd.pop();
  y2.d = xd;
  y2.e = getBase10Exponent(xd, e2);
  return external ? finalise(y2, pr, rm) : y2;
};
P.precision = P.sd = function(z2) {
  var k2, x2 = this;
  if (z2 !== void 0 && z2 !== !!z2 && z2 !== 1 && z2 !== 0) throw Error(invalidArgument + z2);
  if (x2.d) {
    k2 = getPrecision(x2.d);
    if (z2 && x2.e + 1 > k2) k2 = x2.e + 1;
  } else {
    k2 = NaN;
  }
  return k2;
};
P.round = function() {
  var x2 = this, Ctor = x2.constructor;
  return finalise(new Ctor(x2), x2.e + 1, Ctor.rounding);
};
P.sine = P.sin = function() {
  var pr, rm, x2 = this, Ctor = x2.constructor;
  if (!x2.isFinite()) return new Ctor(NaN);
  if (x2.isZero()) return new Ctor(x2);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + Math.max(x2.e, x2.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x2 = sine(Ctor, toLessThanHalfPi(Ctor, x2));
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant > 2 ? x2.neg() : x2, pr, rm, true);
};
P.squareRoot = P.sqrt = function() {
  var m2, n2, sd, r2, rep, t2, x2 = this, d2 = x2.d, e2 = x2.e, s2 = x2.s, Ctor = x2.constructor;
  if (s2 !== 1 || !d2 || !d2[0]) {
    return new Ctor(!s2 || s2 < 0 && (!d2 || d2[0]) ? NaN : d2 ? x2 : 1 / 0);
  }
  external = false;
  s2 = Math.sqrt(+x2);
  if (s2 == 0 || s2 == 1 / 0) {
    n2 = digitsToString(d2);
    if ((n2.length + e2) % 2 == 0) n2 += "0";
    s2 = Math.sqrt(n2);
    e2 = mathfloor((e2 + 1) / 2) - (e2 < 0 || e2 % 2);
    if (s2 == 1 / 0) {
      n2 = "5e" + e2;
    } else {
      n2 = s2.toExponential();
      n2 = n2.slice(0, n2.indexOf("e") + 1) + e2;
    }
    r2 = new Ctor(n2);
  } else {
    r2 = new Ctor(s2.toString());
  }
  sd = (e2 = Ctor.precision) + 3;
  for (; ; ) {
    t2 = r2;
    r2 = t2.plus(divide(x2, t2, sd + 2, 1)).times(0.5);
    if (digitsToString(t2.d).slice(0, sd) === (n2 = digitsToString(r2.d)).slice(0, sd)) {
      n2 = n2.slice(sd - 3, sd + 1);
      if (n2 == "9999" || !rep && n2 == "4999") {
        if (!rep) {
          finalise(t2, e2 + 1, 0);
          if (t2.times(t2).eq(x2)) {
            r2 = t2;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n2 || !+n2.slice(1) && n2.charAt(0) == "5") {
          finalise(r2, e2 + 1, 1);
          m2 = !r2.times(r2).eq(x2);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r2, e2, Ctor.rounding, m2);
};
P.tangent = P.tan = function() {
  var pr, rm, x2 = this, Ctor = x2.constructor;
  if (!x2.isFinite()) return new Ctor(NaN);
  if (x2.isZero()) return new Ctor(x2);
  pr = Ctor.precision;
  rm = Ctor.rounding;
  Ctor.precision = pr + 10;
  Ctor.rounding = 1;
  x2 = x2.sin();
  x2.s = 1;
  x2 = divide(x2, new Ctor(1).minus(x2.times(x2)).sqrt(), pr + 10, 0);
  Ctor.precision = pr;
  Ctor.rounding = rm;
  return finalise(quadrant == 2 || quadrant == 4 ? x2.neg() : x2, pr, rm, true);
};
P.times = P.mul = function(y2) {
  var carry, e2, i2, k2, r2, rL, t2, xdL, ydL, x2 = this, Ctor = x2.constructor, xd = x2.d, yd = (y2 = new Ctor(y2)).d;
  y2.s *= x2.s;
  if (!xd || !xd[0] || !yd || !yd[0]) {
    return new Ctor(!y2.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y2.s / 0 : y2.s * 0);
  }
  e2 = mathfloor(x2.e / LOG_BASE) + mathfloor(y2.e / LOG_BASE);
  xdL = xd.length;
  ydL = yd.length;
  if (xdL < ydL) {
    r2 = xd;
    xd = yd;
    yd = r2;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }
  r2 = [];
  rL = xdL + ydL;
  for (i2 = rL; i2--; ) r2.push(0);
  for (i2 = ydL; --i2 >= 0; ) {
    carry = 0;
    for (k2 = xdL + i2; k2 > i2; ) {
      t2 = r2[k2] + yd[i2] * xd[k2 - i2 - 1] + carry;
      r2[k2--] = t2 % BASE | 0;
      carry = t2 / BASE | 0;
    }
    r2[k2] = (r2[k2] + carry) % BASE | 0;
  }
  for (; !r2[--rL]; ) r2.pop();
  if (carry) ++e2;
  else r2.shift();
  y2.d = r2;
  y2.e = getBase10Exponent(r2, e2);
  return external ? finalise(y2, Ctor.precision, Ctor.rounding) : y2;
};
P.toBinary = function(sd, rm) {
  return toStringBinary(this, 2, sd, rm);
};
P.toDecimalPlaces = P.toDP = function(dp, rm) {
  var x2 = this, Ctor = x2.constructor;
  x2 = new Ctor(x2);
  if (dp === void 0) return x2;
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);
  return finalise(x2, dp + x2.e + 1, rm);
};
P.toExponential = function(dp, rm) {
  var str, x2 = this, Ctor = x2.constructor;
  if (dp === void 0) {
    str = finiteToString(x2, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x2 = finalise(new Ctor(x2), dp + 1, rm);
    str = finiteToString(x2, true, dp + 1);
  }
  return x2.isNeg() && !x2.isZero() ? "-" + str : str;
};
P.toFixed = function(dp, rm) {
  var str, y2, x2 = this, Ctor = x2.constructor;
  if (dp === void 0) {
    str = finiteToString(x2);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    y2 = finalise(new Ctor(x2), dp + x2.e + 1, rm);
    str = finiteToString(y2, false, dp + y2.e + 1);
  }
  return x2.isNeg() && !x2.isZero() ? "-" + str : str;
};
P.toFraction = function(maxD) {
  var d2, d0, d1, d22, e2, k2, n2, n0, n1, pr, q, r2, x2 = this, xd = x2.d, Ctor = x2.constructor;
  if (!xd) return new Ctor(x2);
  n1 = d0 = new Ctor(1);
  d1 = n0 = new Ctor(0);
  d2 = new Ctor(d1);
  e2 = d2.e = getPrecision(xd) - x2.e - 1;
  k2 = e2 % LOG_BASE;
  d2.d[0] = mathpow(10, k2 < 0 ? LOG_BASE + k2 : k2);
  if (maxD == null) {
    maxD = e2 > 0 ? d2 : n1;
  } else {
    n2 = new Ctor(maxD);
    if (!n2.isInt() || n2.lt(n1)) throw Error(invalidArgument + n2);
    maxD = n2.gt(d2) ? e2 > 0 ? d2 : n1 : n2;
  }
  external = false;
  n2 = new Ctor(digitsToString(xd));
  pr = Ctor.precision;
  Ctor.precision = e2 = xd.length * LOG_BASE * 2;
  for (; ; ) {
    q = divide(n2, d2, 0, 1, 1);
    d22 = d0.plus(q.times(d1));
    if (d22.cmp(maxD) == 1) break;
    d0 = d1;
    d1 = d22;
    d22 = n1;
    n1 = n0.plus(q.times(d22));
    n0 = d22;
    d22 = d2;
    d2 = n2.minus(q.times(d22));
    n2 = d22;
  }
  d22 = divide(maxD.minus(d0), d1, 0, 1, 1);
  n0 = n0.plus(d22.times(n1));
  d0 = d0.plus(d22.times(d1));
  n0.s = n1.s = x2.s;
  r2 = divide(n1, d1, e2, 1).minus(x2).abs().cmp(divide(n0, d0, e2, 1).minus(x2).abs()) < 1 ? [n1, d1] : [n0, d0];
  Ctor.precision = pr;
  external = true;
  return r2;
};
P.toHexadecimal = P.toHex = function(sd, rm) {
  return toStringBinary(this, 16, sd, rm);
};
P.toNearest = function(y2, rm) {
  var x2 = this, Ctor = x2.constructor;
  x2 = new Ctor(x2);
  if (y2 == null) {
    if (!x2.d) return x2;
    y2 = new Ctor(1);
    rm = Ctor.rounding;
  } else {
    y2 = new Ctor(y2);
    if (rm === void 0) {
      rm = Ctor.rounding;
    } else {
      checkInt32(rm, 0, 8);
    }
    if (!x2.d) return y2.s ? x2 : y2;
    if (!y2.d) {
      if (y2.s) y2.s = x2.s;
      return y2;
    }
  }
  if (y2.d[0]) {
    external = false;
    x2 = divide(x2, y2, 0, rm, 1).times(y2);
    external = true;
    finalise(x2);
  } else {
    y2.s = x2.s;
    x2 = y2;
  }
  return x2;
};
P.toNumber = function() {
  return +this;
};
P.toOctal = function(sd, rm) {
  return toStringBinary(this, 8, sd, rm);
};
P.toPower = P.pow = function(y2) {
  var e2, k2, pr, r2, rm, s2, x2 = this, Ctor = x2.constructor, yn = +(y2 = new Ctor(y2));
  if (!x2.d || !y2.d || !x2.d[0] || !y2.d[0]) return new Ctor(mathpow(+x2, yn));
  x2 = new Ctor(x2);
  if (x2.eq(1)) return x2;
  pr = Ctor.precision;
  rm = Ctor.rounding;
  if (y2.eq(1)) return finalise(x2, pr, rm);
  e2 = mathfloor(y2.e / LOG_BASE);
  if (e2 >= y2.d.length - 1 && (k2 = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
    r2 = intPow(Ctor, x2, k2, pr);
    return y2.s < 0 ? new Ctor(1).div(r2) : finalise(r2, pr, rm);
  }
  s2 = x2.s;
  if (s2 < 0) {
    if (e2 < y2.d.length - 1) return new Ctor(NaN);
    if ((y2.d[e2] & 1) == 0) s2 = 1;
    if (x2.e == 0 && x2.d[0] == 1 && x2.d.length == 1) {
      x2.s = s2;
      return x2;
    }
  }
  k2 = mathpow(+x2, yn);
  e2 = k2 == 0 || !isFinite(k2) ? mathfloor(yn * (Math.log("0." + digitsToString(x2.d)) / Math.LN10 + x2.e + 1)) : new Ctor(k2 + "").e;
  if (e2 > Ctor.maxE + 1 || e2 < Ctor.minE - 1) return new Ctor(e2 > 0 ? s2 / 0 : 0);
  external = false;
  Ctor.rounding = x2.s = 1;
  k2 = Math.min(12, (e2 + "").length);
  r2 = naturalExponential(y2.times(naturalLogarithm(x2, pr + k2)), pr);
  if (r2.d) {
    r2 = finalise(r2, pr + 5, 1);
    if (checkRoundingDigits(r2.d, pr, rm)) {
      e2 = pr + 10;
      r2 = finalise(naturalExponential(y2.times(naturalLogarithm(x2, e2 + k2)), e2), e2 + 5, 1);
      if (+digitsToString(r2.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
        r2 = finalise(r2, pr + 1, 0);
      }
    }
  }
  r2.s = s2;
  external = true;
  Ctor.rounding = rm;
  return finalise(r2, pr, rm);
};
P.toPrecision = function(sd, rm) {
  var str, x2 = this, Ctor = x2.constructor;
  if (sd === void 0) {
    str = finiteToString(x2, x2.e <= Ctor.toExpNeg || x2.e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    x2 = finalise(new Ctor(x2), sd, rm);
    str = finiteToString(x2, sd <= x2.e || x2.e <= Ctor.toExpNeg, sd);
  }
  return x2.isNeg() && !x2.isZero() ? "-" + str : str;
};
P.toSignificantDigits = P.toSD = function(sd, rm) {
  var x2 = this, Ctor = x2.constructor;
  if (sd === void 0) {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
  }
  return finalise(new Ctor(x2), sd, rm);
};
P.toString = function() {
  var x2 = this, Ctor = x2.constructor, str = finiteToString(x2, x2.e <= Ctor.toExpNeg || x2.e >= Ctor.toExpPos);
  return x2.isNeg() && !x2.isZero() ? "-" + str : str;
};
P.truncated = P.trunc = function() {
  return finalise(new this.constructor(this), this.e + 1, 1);
};
P.valueOf = P.toJSON = function() {
  var x2 = this, Ctor = x2.constructor, str = finiteToString(x2, x2.e <= Ctor.toExpNeg || x2.e >= Ctor.toExpPos);
  return x2.isNeg() ? "-" + str : str;
};
function digitsToString(d2) {
  var i2, k2, ws, indexOfLastWord = d2.length - 1, str = "", w2 = d2[0];
  if (indexOfLastWord > 0) {
    str += w2;
    for (i2 = 1; i2 < indexOfLastWord; i2++) {
      ws = d2[i2] + "";
      k2 = LOG_BASE - ws.length;
      if (k2) str += getZeroString(k2);
      str += ws;
    }
    w2 = d2[i2];
    ws = w2 + "";
    k2 = LOG_BASE - ws.length;
    if (k2) str += getZeroString(k2);
  } else if (w2 === 0) {
    return "0";
  }
  for (; w2 % 10 === 0; ) w2 /= 10;
  return str + w2;
}
function checkInt32(i2, min2, max2) {
  if (i2 !== ~~i2 || i2 < min2 || i2 > max2) {
    throw Error(invalidArgument + i2);
  }
}
function checkRoundingDigits(d2, i2, rm, repeating) {
  var di, k2, r2, rd;
  for (k2 = d2[0]; k2 >= 10; k2 /= 10) --i2;
  if (--i2 < 0) {
    i2 += LOG_BASE;
    di = 0;
  } else {
    di = Math.ceil((i2 + 1) / LOG_BASE);
    i2 %= LOG_BASE;
  }
  k2 = mathpow(10, LOG_BASE - i2);
  rd = d2[di] % k2 | 0;
  if (repeating == null) {
    if (i2 < 3) {
      if (i2 == 0) rd = rd / 100 | 0;
      else if (i2 == 1) rd = rd / 10 | 0;
      r2 = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 5e4 || rd == 0;
    } else {
      r2 = (rm < 4 && rd + 1 == k2 || rm > 3 && rd + 1 == k2 / 2) && (d2[di + 1] / k2 / 100 | 0) == mathpow(10, i2 - 2) - 1 || (rd == k2 / 2 || rd == 0) && (d2[di + 1] / k2 / 100 | 0) == 0;
    }
  } else {
    if (i2 < 4) {
      if (i2 == 0) rd = rd / 1e3 | 0;
      else if (i2 == 1) rd = rd / 100 | 0;
      else if (i2 == 2) rd = rd / 10 | 0;
      r2 = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
    } else {
      r2 = ((repeating || rm < 4) && rd + 1 == k2 || !repeating && rm > 3 && rd + 1 == k2 / 2) && (d2[di + 1] / k2 / 1e3 | 0) == mathpow(10, i2 - 3) - 1;
    }
  }
  return r2;
}
function convertBase(str, baseIn, baseOut) {
  var j2, arr = [0], arrL, i2 = 0, strL = str.length;
  for (; i2 < strL; ) {
    for (arrL = arr.length; arrL--; ) arr[arrL] *= baseIn;
    arr[0] += NUMERALS.indexOf(str.charAt(i2++));
    for (j2 = 0; j2 < arr.length; j2++) {
      if (arr[j2] > baseOut - 1) {
        if (arr[j2 + 1] === void 0) arr[j2 + 1] = 0;
        arr[j2 + 1] += arr[j2] / baseOut | 0;
        arr[j2] %= baseOut;
      }
    }
  }
  return arr.reverse();
}
function cosine(Ctor, x2) {
  var k2, len, y2;
  if (x2.isZero()) return x2;
  len = x2.d.length;
  if (len < 32) {
    k2 = Math.ceil(len / 3);
    y2 = (1 / tinyPow(4, k2)).toString();
  } else {
    k2 = 16;
    y2 = "2.3283064365386962890625e-10";
  }
  Ctor.precision += k2;
  x2 = taylorSeries(Ctor, 1, x2.times(y2), new Ctor(1));
  for (var i2 = k2; i2--; ) {
    var cos2x = x2.times(x2);
    x2 = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
  }
  Ctor.precision -= k2;
  return x2;
}
var divide = /* @__PURE__ */ (function() {
  function multiplyInteger(x2, k2, base) {
    var temp, carry = 0, i2 = x2.length;
    for (x2 = x2.slice(); i2--; ) {
      temp = x2[i2] * k2 + carry;
      x2[i2] = temp % base | 0;
      carry = temp / base | 0;
    }
    if (carry) x2.unshift(carry);
    return x2;
  }
  function compare(a2, b2, aL, bL) {
    var i2, r2;
    if (aL != bL) {
      r2 = aL > bL ? 1 : -1;
    } else {
      for (i2 = r2 = 0; i2 < aL; i2++) {
        if (a2[i2] != b2[i2]) {
          r2 = a2[i2] > b2[i2] ? 1 : -1;
          break;
        }
      }
    }
    return r2;
  }
  function subtract(a2, b2, aL, base) {
    var i2 = 0;
    for (; aL--; ) {
      a2[aL] -= i2;
      i2 = a2[aL] < b2[aL] ? 1 : 0;
      a2[aL] = i2 * base + a2[aL] - b2[aL];
    }
    for (; !a2[0] && a2.length > 1; ) a2.shift();
  }
  return function(x2, y2, pr, rm, dp, base) {
    var cmp, e2, i2, k2, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t2, xi, xL, yd0, yL, yz, Ctor = x2.constructor, sign2 = x2.s == y2.s ? 1 : -1, xd = x2.d, yd = y2.d;
    if (!xd || !xd[0] || !yd || !yd[0]) {
      return new Ctor(
        // Return NaN if either NaN, or both Infinity or 0.
        !x2.s || !y2.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : (
          // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign2 * 0 : sign2 / 0
        )
      );
    }
    if (base) {
      logBase = 1;
      e2 = x2.e - y2.e;
    } else {
      base = BASE;
      logBase = LOG_BASE;
      e2 = mathfloor(x2.e / logBase) - mathfloor(y2.e / logBase);
    }
    yL = yd.length;
    xL = xd.length;
    q = new Ctor(sign2);
    qd = q.d = [];
    for (i2 = 0; yd[i2] == (xd[i2] || 0); i2++) ;
    if (yd[i2] > (xd[i2] || 0)) e2--;
    if (pr == null) {
      sd = pr = Ctor.precision;
      rm = Ctor.rounding;
    } else if (dp) {
      sd = pr + (x2.e - y2.e) + 1;
    } else {
      sd = pr;
    }
    if (sd < 0) {
      qd.push(1);
      more = true;
    } else {
      sd = sd / logBase + 2 | 0;
      i2 = 0;
      if (yL == 1) {
        k2 = 0;
        yd = yd[0];
        sd++;
        for (; (i2 < xL || k2) && sd--; i2++) {
          t2 = k2 * base + (xd[i2] || 0);
          qd[i2] = t2 / yd | 0;
          k2 = t2 % yd | 0;
        }
        more = k2 || i2 < xL;
      } else {
        k2 = base / (yd[0] + 1) | 0;
        if (k2 > 1) {
          yd = multiplyInteger(yd, k2, base);
          xd = multiplyInteger(xd, k2, base);
          yL = yd.length;
          xL = xd.length;
        }
        xi = yL;
        rem = xd.slice(0, yL);
        remL = rem.length;
        for (; remL < yL; ) rem[remL++] = 0;
        yz = yd.slice();
        yz.unshift(0);
        yd0 = yd[0];
        if (yd[1] >= base / 2) ++yd0;
        do {
          k2 = 0;
          cmp = compare(yd, rem, yL, remL);
          if (cmp < 0) {
            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
            k2 = rem0 / yd0 | 0;
            if (k2 > 1) {
              if (k2 >= base) k2 = base - 1;
              prod = multiplyInteger(yd, k2, base);
              prodL = prod.length;
              remL = rem.length;
              cmp = compare(prod, rem, prodL, remL);
              if (cmp == 1) {
                k2--;
                subtract(prod, yL < prodL ? yz : yd, prodL, base);
              }
            } else {
              if (k2 == 0) cmp = k2 = 1;
              prod = yd.slice();
            }
            prodL = prod.length;
            if (prodL < remL) prod.unshift(0);
            subtract(rem, prod, remL, base);
            if (cmp == -1) {
              remL = rem.length;
              cmp = compare(yd, rem, yL, remL);
              if (cmp < 1) {
                k2++;
                subtract(rem, yL < remL ? yz : yd, remL, base);
              }
            }
            remL = rem.length;
          } else if (cmp === 0) {
            k2++;
            rem = [0];
          }
          qd[i2++] = k2;
          if (cmp && rem[0]) {
            rem[remL++] = xd[xi] || 0;
          } else {
            rem = [xd[xi]];
            remL = 1;
          }
        } while ((xi++ < xL || rem[0] !== void 0) && sd--);
        more = rem[0] !== void 0;
      }
      if (!qd[0]) qd.shift();
    }
    if (logBase == 1) {
      q.e = e2;
      inexact = more;
    } else {
      for (i2 = 1, k2 = qd[0]; k2 >= 10; k2 /= 10) i2++;
      q.e = i2 + e2 * logBase - 1;
      finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
    }
    return q;
  };
})();
function finalise(x2, sd, rm, isTruncated) {
  var digits, i2, j2, k2, rd, roundUp, w2, xd, xdi, Ctor = x2.constructor;
  out: if (sd != null) {
    xd = x2.d;
    if (!xd) return x2;
    for (digits = 1, k2 = xd[0]; k2 >= 10; k2 /= 10) digits++;
    i2 = sd - digits;
    if (i2 < 0) {
      i2 += LOG_BASE;
      j2 = sd;
      w2 = xd[xdi = 0];
      rd = w2 / mathpow(10, digits - j2 - 1) % 10 | 0;
    } else {
      xdi = Math.ceil((i2 + 1) / LOG_BASE);
      k2 = xd.length;
      if (xdi >= k2) {
        if (isTruncated) {
          for (; k2++ <= xdi; ) xd.push(0);
          w2 = rd = 0;
          digits = 1;
          i2 %= LOG_BASE;
          j2 = i2 - LOG_BASE + 1;
        } else {
          break out;
        }
      } else {
        w2 = k2 = xd[xdi];
        for (digits = 1; k2 >= 10; k2 /= 10) digits++;
        i2 %= LOG_BASE;
        j2 = i2 - LOG_BASE + digits;
        rd = j2 < 0 ? 0 : w2 / mathpow(10, digits - j2 - 1) % 10 | 0;
      }
    }
    isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j2 < 0 ? w2 : w2 % mathpow(10, digits - j2 - 1));
    roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x2.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
    (i2 > 0 ? j2 > 0 ? w2 / mathpow(10, digits - j2) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x2.s < 0 ? 8 : 7));
    if (sd < 1 || !xd[0]) {
      xd.length = 0;
      if (roundUp) {
        sd -= x2.e + 1;
        xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
        x2.e = -sd || 0;
      } else {
        xd[0] = x2.e = 0;
      }
      return x2;
    }
    if (i2 == 0) {
      xd.length = xdi;
      k2 = 1;
      xdi--;
    } else {
      xd.length = xdi + 1;
      k2 = mathpow(10, LOG_BASE - i2);
      xd[xdi] = j2 > 0 ? (w2 / mathpow(10, digits - j2) % mathpow(10, j2) | 0) * k2 : 0;
    }
    if (roundUp) {
      for (; ; ) {
        if (xdi == 0) {
          for (i2 = 1, j2 = xd[0]; j2 >= 10; j2 /= 10) i2++;
          j2 = xd[0] += k2;
          for (k2 = 1; j2 >= 10; j2 /= 10) k2++;
          if (i2 != k2) {
            x2.e++;
            if (xd[0] == BASE) xd[0] = 1;
          }
          break;
        } else {
          xd[xdi] += k2;
          if (xd[xdi] != BASE) break;
          xd[xdi--] = 0;
          k2 = 1;
        }
      }
    }
    for (i2 = xd.length; xd[--i2] === 0; ) xd.pop();
  }
  if (external) {
    if (x2.e > Ctor.maxE) {
      x2.d = null;
      x2.e = NaN;
    } else if (x2.e < Ctor.minE) {
      x2.e = 0;
      x2.d = [0];
    }
  }
  return x2;
}
function finiteToString(x2, isExp, sd) {
  if (!x2.isFinite()) return nonFiniteToString(x2);
  var k2, e2 = x2.e, str = digitsToString(x2.d), len = str.length;
  if (isExp) {
    if (sd && (k2 = sd - len) > 0) {
      str = str.charAt(0) + "." + str.slice(1) + getZeroString(k2);
    } else if (len > 1) {
      str = str.charAt(0) + "." + str.slice(1);
    }
    str = str + (x2.e < 0 ? "e" : "e+") + x2.e;
  } else if (e2 < 0) {
    str = "0." + getZeroString(-e2 - 1) + str;
    if (sd && (k2 = sd - len) > 0) str += getZeroString(k2);
  } else if (e2 >= len) {
    str += getZeroString(e2 + 1 - len);
    if (sd && (k2 = sd - e2 - 1) > 0) str = str + "." + getZeroString(k2);
  } else {
    if ((k2 = e2 + 1) < len) str = str.slice(0, k2) + "." + str.slice(k2);
    if (sd && (k2 = sd - len) > 0) {
      if (e2 + 1 === len) str += ".";
      str += getZeroString(k2);
    }
  }
  return str;
}
function getBase10Exponent(digits, e2) {
  var w2 = digits[0];
  for (e2 *= LOG_BASE; w2 >= 10; w2 /= 10) e2++;
  return e2;
}
function getLn10(Ctor, sd, pr) {
  if (sd > LN10_PRECISION) {
    external = true;
    if (pr) Ctor.precision = pr;
    throw Error(precisionLimitExceeded);
  }
  return finalise(new Ctor(LN10), sd, 1, true);
}
function getPi(Ctor, sd, rm) {
  if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
  return finalise(new Ctor(PI), sd, rm, true);
}
function getPrecision(digits) {
  var w2 = digits.length - 1, len = w2 * LOG_BASE + 1;
  w2 = digits[w2];
  if (w2) {
    for (; w2 % 10 == 0; w2 /= 10) len--;
    for (w2 = digits[0]; w2 >= 10; w2 /= 10) len++;
  }
  return len;
}
function getZeroString(k2) {
  var zs = "";
  for (; k2--; ) zs += "0";
  return zs;
}
function intPow(Ctor, x2, n2, pr) {
  var isTruncated, r2 = new Ctor(1), k2 = Math.ceil(pr / LOG_BASE + 4);
  external = false;
  for (; ; ) {
    if (n2 % 2) {
      r2 = r2.times(x2);
      if (truncate(r2.d, k2)) isTruncated = true;
    }
    n2 = mathfloor(n2 / 2);
    if (n2 === 0) {
      n2 = r2.d.length - 1;
      if (isTruncated && r2.d[n2] === 0) ++r2.d[n2];
      break;
    }
    x2 = x2.times(x2);
    truncate(x2.d, k2);
  }
  external = true;
  return r2;
}
function isOdd(n2) {
  return n2.d[n2.d.length - 1] & 1;
}
function maxOrMin(Ctor, args, n2) {
  var k2, y2, x2 = new Ctor(args[0]), i2 = 0;
  for (; ++i2 < args.length; ) {
    y2 = new Ctor(args[i2]);
    if (!y2.s) {
      x2 = y2;
      break;
    }
    k2 = x2.cmp(y2);
    if (k2 === n2 || k2 === 0 && x2.s === n2) {
      x2 = y2;
    }
  }
  return x2;
}
function naturalExponential(x2, sd) {
  var denominator, guard, j2, pow2, sum2, t2, wpr, rep = 0, i2 = 0, k2 = 0, Ctor = x2.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (!x2.d || !x2.d[0] || x2.e > 17) {
    return new Ctor(x2.d ? !x2.d[0] ? 1 : x2.s < 0 ? 0 : 1 / 0 : x2.s ? x2.s < 0 ? 0 : x2 : 0 / 0);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  t2 = new Ctor(0.03125);
  while (x2.e > -2) {
    x2 = x2.times(t2);
    k2 += 5;
  }
  guard = Math.log(mathpow(2, k2)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow2 = sum2 = new Ctor(1);
  Ctor.precision = wpr;
  for (; ; ) {
    pow2 = finalise(pow2.times(x2), wpr, 1);
    denominator = denominator.times(++i2);
    t2 = sum2.plus(divide(pow2, denominator, wpr, 1));
    if (digitsToString(t2.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
      j2 = k2;
      while (j2--) sum2 = finalise(sum2.times(sum2), wpr, 1);
      if (sd == null) {
        if (rep < 3 && checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += 10;
          denominator = pow2 = t2 = new Ctor(1);
          i2 = 0;
          rep++;
        } else {
          return finalise(sum2, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum2;
      }
    }
    sum2 = t2;
  }
}
function naturalLogarithm(y2, sd) {
  var c2, c0, denominator, e2, numerator, rep, sum2, t2, wpr, x1, x2, n2 = 1, guard = 10, x3 = y2, xd = x3.d, Ctor = x3.constructor, rm = Ctor.rounding, pr = Ctor.precision;
  if (x3.s < 0 || !xd || !xd[0] || !x3.e && xd[0] == 1 && xd.length == 1) {
    return new Ctor(xd && !xd[0] ? -1 / 0 : x3.s != 1 ? NaN : xd ? 0 : x3);
  }
  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }
  Ctor.precision = wpr += guard;
  c2 = digitsToString(xd);
  c0 = c2.charAt(0);
  if (Math.abs(e2 = x3.e) < 15e14) {
    while (c0 < 7 && c0 != 1 || c0 == 1 && c2.charAt(1) > 3) {
      x3 = x3.times(y2);
      c2 = digitsToString(x3.d);
      c0 = c2.charAt(0);
      n2++;
    }
    e2 = x3.e;
    if (c0 > 1) {
      x3 = new Ctor("0." + c2);
      e2++;
    } else {
      x3 = new Ctor(c0 + "." + c2.slice(1));
    }
  } else {
    t2 = getLn10(Ctor, wpr + 2, pr).times(e2 + "");
    x3 = naturalLogarithm(new Ctor(c0 + "." + c2.slice(1)), wpr - guard).plus(t2);
    Ctor.precision = pr;
    return sd == null ? finalise(x3, pr, rm, external = true) : x3;
  }
  x1 = x3;
  sum2 = numerator = x3 = divide(x3.minus(1), x3.plus(1), wpr, 1);
  x2 = finalise(x3.times(x3), wpr, 1);
  denominator = 3;
  for (; ; ) {
    numerator = finalise(numerator.times(x2), wpr, 1);
    t2 = sum2.plus(divide(numerator, new Ctor(denominator), wpr, 1));
    if (digitsToString(t2.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
      sum2 = sum2.times(2);
      if (e2 !== 0) sum2 = sum2.plus(getLn10(Ctor, wpr + 2, pr).times(e2 + ""));
      sum2 = divide(sum2, new Ctor(n2), wpr, 1);
      if (sd == null) {
        if (checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
          Ctor.precision = wpr += guard;
          t2 = numerator = x3 = divide(x1.minus(1), x1.plus(1), wpr, 1);
          x2 = finalise(x3.times(x3), wpr, 1);
          denominator = rep = 1;
        } else {
          return finalise(sum2, Ctor.precision = pr, rm, external = true);
        }
      } else {
        Ctor.precision = pr;
        return sum2;
      }
    }
    sum2 = t2;
    denominator += 2;
  }
}
function nonFiniteToString(x2) {
  return String(x2.s * x2.s / 0);
}
function parseDecimal(x2, str) {
  var e2, i2, len;
  if ((e2 = str.indexOf(".")) > -1) str = str.replace(".", "");
  if ((i2 = str.search(/e/i)) > 0) {
    if (e2 < 0) e2 = i2;
    e2 += +str.slice(i2 + 1);
    str = str.substring(0, i2);
  } else if (e2 < 0) {
    e2 = str.length;
  }
  for (i2 = 0; str.charCodeAt(i2) === 48; i2++) ;
  for (len = str.length; str.charCodeAt(len - 1) === 48; --len) ;
  str = str.slice(i2, len);
  if (str) {
    len -= i2;
    x2.e = e2 = e2 - i2 - 1;
    x2.d = [];
    i2 = (e2 + 1) % LOG_BASE;
    if (e2 < 0) i2 += LOG_BASE;
    if (i2 < len) {
      if (i2) x2.d.push(+str.slice(0, i2));
      for (len -= LOG_BASE; i2 < len; ) x2.d.push(+str.slice(i2, i2 += LOG_BASE));
      str = str.slice(i2);
      i2 = LOG_BASE - str.length;
    } else {
      i2 -= len;
    }
    for (; i2--; ) str += "0";
    x2.d.push(+str);
    if (external) {
      if (x2.e > x2.constructor.maxE) {
        x2.d = null;
        x2.e = NaN;
      } else if (x2.e < x2.constructor.minE) {
        x2.e = 0;
        x2.d = [0];
      }
    }
  } else {
    x2.e = 0;
    x2.d = [0];
  }
  return x2;
}
function parseOther(x2, str) {
  var base, Ctor, divisor, i2, isFloat, len, p2, xd, xe;
  if (str.indexOf("_") > -1) {
    str = str.replace(/(\d)_(?=\d)/g, "$1");
    if (isDecimal.test(str)) return parseDecimal(x2, str);
  } else if (str === "Infinity" || str === "NaN") {
    if (!+str) x2.s = NaN;
    x2.e = NaN;
    x2.d = null;
    return x2;
  }
  if (isHex.test(str)) {
    base = 16;
    str = str.toLowerCase();
  } else if (isBinary.test(str)) {
    base = 2;
  } else if (isOctal.test(str)) {
    base = 8;
  } else {
    throw Error(invalidArgument + str);
  }
  i2 = str.search(/p/i);
  if (i2 > 0) {
    p2 = +str.slice(i2 + 1);
    str = str.substring(2, i2);
  } else {
    str = str.slice(2);
  }
  i2 = str.indexOf(".");
  isFloat = i2 >= 0;
  Ctor = x2.constructor;
  if (isFloat) {
    str = str.replace(".", "");
    len = str.length;
    i2 = len - i2;
    divisor = intPow(Ctor, new Ctor(base), i2, i2 * 2);
  }
  xd = convertBase(str, base, BASE);
  xe = xd.length - 1;
  for (i2 = xe; xd[i2] === 0; --i2) xd.pop();
  if (i2 < 0) return new Ctor(x2.s * 0);
  x2.e = getBase10Exponent(xd, xe);
  x2.d = xd;
  external = false;
  if (isFloat) x2 = divide(x2, divisor, len * 4);
  if (p2) x2 = x2.times(Math.abs(p2) < 54 ? mathpow(2, p2) : Decimal.pow(2, p2));
  external = true;
  return x2;
}
function sine(Ctor, x2) {
  var k2, len = x2.d.length;
  if (len < 3) {
    return x2.isZero() ? x2 : taylorSeries(Ctor, 2, x2, x2);
  }
  k2 = 1.4 * Math.sqrt(len);
  k2 = k2 > 16 ? 16 : k2 | 0;
  x2 = x2.times(1 / tinyPow(5, k2));
  x2 = taylorSeries(Ctor, 2, x2, x2);
  var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
  for (; k2--; ) {
    sin2_x = x2.times(x2);
    x2 = x2.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
  }
  return x2;
}
function taylorSeries(Ctor, n2, x2, y2, isHyperbolic) {
  var j2, t2, u2, x22, i2 = 1, pr = Ctor.precision, k2 = Math.ceil(pr / LOG_BASE);
  external = false;
  x22 = x2.times(x2);
  u2 = new Ctor(y2);
  for (; ; ) {
    t2 = divide(u2.times(x22), new Ctor(n2++ * n2++), pr, 1);
    u2 = isHyperbolic ? y2.plus(t2) : y2.minus(t2);
    y2 = divide(t2.times(x22), new Ctor(n2++ * n2++), pr, 1);
    t2 = u2.plus(y2);
    if (t2.d[k2] !== void 0) {
      for (j2 = k2; t2.d[j2] === u2.d[j2] && j2--; ) ;
      if (j2 == -1) break;
    }
    j2 = u2;
    u2 = y2;
    y2 = t2;
    t2 = j2;
    i2++;
  }
  external = true;
  t2.d.length = k2 + 1;
  return t2;
}
function tinyPow(b2, e2) {
  var n2 = b2;
  while (--e2) n2 *= b2;
  return n2;
}
function toLessThanHalfPi(Ctor, x2) {
  var t2, isNeg = x2.s < 0, pi = getPi(Ctor, Ctor.precision, 1), halfPi = pi.times(0.5);
  x2 = x2.abs();
  if (x2.lte(halfPi)) {
    quadrant = isNeg ? 4 : 1;
    return x2;
  }
  t2 = x2.divToInt(pi);
  if (t2.isZero()) {
    quadrant = isNeg ? 3 : 2;
  } else {
    x2 = x2.minus(t2.times(pi));
    if (x2.lte(halfPi)) {
      quadrant = isOdd(t2) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
      return x2;
    }
    quadrant = isOdd(t2) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
  }
  return x2.minus(pi).abs();
}
function toStringBinary(x2, baseOut, sd, rm) {
  var base, e2, i2, k2, len, roundUp, str, xd, y2, Ctor = x2.constructor, isExp = sd !== void 0;
  if (isExp) {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
  } else {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  }
  if (!x2.isFinite()) {
    str = nonFiniteToString(x2);
  } else {
    str = finiteToString(x2);
    i2 = str.indexOf(".");
    if (isExp) {
      base = 2;
      if (baseOut == 16) {
        sd = sd * 4 - 3;
      } else if (baseOut == 8) {
        sd = sd * 3 - 2;
      }
    } else {
      base = baseOut;
    }
    if (i2 >= 0) {
      str = str.replace(".", "");
      y2 = new Ctor(1);
      y2.e = str.length - i2;
      y2.d = convertBase(finiteToString(y2), 10, base);
      y2.e = y2.d.length;
    }
    xd = convertBase(str, 10, base);
    e2 = len = xd.length;
    for (; xd[--len] == 0; ) xd.pop();
    if (!xd[0]) {
      str = isExp ? "0p+0" : "0";
    } else {
      if (i2 < 0) {
        e2--;
      } else {
        x2 = new Ctor(x2);
        x2.d = xd;
        x2.e = e2;
        x2 = divide(x2, y2, sd, rm, 0, base);
        xd = x2.d;
        e2 = x2.e;
        roundUp = inexact;
      }
      i2 = xd[sd];
      k2 = base / 2;
      roundUp = roundUp || xd[sd + 1] !== void 0;
      roundUp = rm < 4 ? (i2 !== void 0 || roundUp) && (rm === 0 || rm === (x2.s < 0 ? 3 : 2)) : i2 > k2 || i2 === k2 && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x2.s < 0 ? 8 : 7));
      xd.length = sd;
      if (roundUp) {
        for (; ++xd[--sd] > base - 1; ) {
          xd[sd] = 0;
          if (!sd) {
            ++e2;
            xd.unshift(1);
          }
        }
      }
      for (len = xd.length; !xd[len - 1]; --len) ;
      for (i2 = 0, str = ""; i2 < len; i2++) str += NUMERALS.charAt(xd[i2]);
      if (isExp) {
        if (len > 1) {
          if (baseOut == 16 || baseOut == 8) {
            i2 = baseOut == 16 ? 4 : 3;
            for (--len; len % i2; len++) str += "0";
            xd = convertBase(str, base, baseOut);
            for (len = xd.length; !xd[len - 1]; --len) ;
            for (i2 = 1, str = "1."; i2 < len; i2++) str += NUMERALS.charAt(xd[i2]);
          } else {
            str = str.charAt(0) + "." + str.slice(1);
          }
        }
        str = str + (e2 < 0 ? "p" : "p+") + e2;
      } else if (e2 < 0) {
        for (; ++e2; ) str = "0" + str;
        str = "0." + str;
      } else {
        if (++e2 > len) for (e2 -= len; e2--; ) str += "0";
        else if (e2 < len) str = str.slice(0, e2) + "." + str.slice(e2);
      }
    }
    str = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str;
  }
  return x2.s < 0 ? "-" + str : str;
}
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}
function abs(x2) {
  return new this(x2).abs();
}
function acos(x2) {
  return new this(x2).acos();
}
function acosh(x2) {
  return new this(x2).acosh();
}
function add(x2, y2) {
  return new this(x2).plus(y2);
}
function asin(x2) {
  return new this(x2).asin();
}
function asinh(x2) {
  return new this(x2).asinh();
}
function atan(x2) {
  return new this(x2).atan();
}
function atanh(x2) {
  return new this(x2).atanh();
}
function atan2(y2, x2) {
  y2 = new this(y2);
  x2 = new this(x2);
  var r2, pr = this.precision, rm = this.rounding, wpr = pr + 4;
  if (!y2.s || !x2.s) {
    r2 = new this(NaN);
  } else if (!y2.d && !x2.d) {
    r2 = getPi(this, wpr, 1).times(x2.s > 0 ? 0.25 : 0.75);
    r2.s = y2.s;
  } else if (!x2.d || y2.isZero()) {
    r2 = x2.s < 0 ? getPi(this, pr, rm) : new this(0);
    r2.s = y2.s;
  } else if (!y2.d || x2.isZero()) {
    r2 = getPi(this, wpr, 1).times(0.5);
    r2.s = y2.s;
  } else if (x2.s < 0) {
    this.precision = wpr;
    this.rounding = 1;
    r2 = this.atan(divide(y2, x2, wpr, 1));
    x2 = getPi(this, wpr, 1);
    this.precision = pr;
    this.rounding = rm;
    r2 = y2.s < 0 ? r2.minus(x2) : r2.plus(x2);
  } else {
    r2 = this.atan(divide(y2, x2, wpr, 1));
  }
  return r2;
}
function cbrt(x2) {
  return new this(x2).cbrt();
}
function ceil(x2) {
  return finalise(x2 = new this(x2), x2.e + 1, 2);
}
function clamp(x2, min2, max2) {
  return new this(x2).clamp(min2, max2);
}
function config(obj) {
  if (!obj || typeof obj !== "object") throw Error(decimalError + "Object expected");
  var i2, p2, v2, useDefaults = obj.defaults === true, ps = [
    "precision",
    1,
    MAX_DIGITS,
    "rounding",
    0,
    8,
    "toExpNeg",
    -EXP_LIMIT,
    0,
    "toExpPos",
    0,
    EXP_LIMIT,
    "maxE",
    0,
    EXP_LIMIT,
    "minE",
    -EXP_LIMIT,
    0,
    "modulo",
    0,
    9
  ];
  for (i2 = 0; i2 < ps.length; i2 += 3) {
    if (p2 = ps[i2], useDefaults) this[p2] = DEFAULTS[p2];
    if ((v2 = obj[p2]) !== void 0) {
      if (mathfloor(v2) === v2 && v2 >= ps[i2 + 1] && v2 <= ps[i2 + 2]) this[p2] = v2;
      else throw Error(invalidArgument + p2 + ": " + v2);
    }
  }
  if (p2 = "crypto", useDefaults) this[p2] = DEFAULTS[p2];
  if ((v2 = obj[p2]) !== void 0) {
    if (v2 === true || v2 === false || v2 === 0 || v2 === 1) {
      if (v2) {
        if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
          this[p2] = true;
        } else {
          throw Error(cryptoUnavailable);
        }
      } else {
        this[p2] = false;
      }
    } else {
      throw Error(invalidArgument + p2 + ": " + v2);
    }
  }
  return this;
}
function cos(x2) {
  return new this(x2).cos();
}
function cosh(x2) {
  return new this(x2).cosh();
}
function clone(obj) {
  var i2, p2, ps;
  function Decimal2(v2) {
    var e2, i3, t2, x2 = this;
    if (!(x2 instanceof Decimal2)) return new Decimal2(v2);
    x2.constructor = Decimal2;
    if (isDecimalInstance(v2)) {
      x2.s = v2.s;
      if (external) {
        if (!v2.d || v2.e > Decimal2.maxE) {
          x2.e = NaN;
          x2.d = null;
        } else if (v2.e < Decimal2.minE) {
          x2.e = 0;
          x2.d = [0];
        } else {
          x2.e = v2.e;
          x2.d = v2.d.slice();
        }
      } else {
        x2.e = v2.e;
        x2.d = v2.d ? v2.d.slice() : v2.d;
      }
      return;
    }
    t2 = typeof v2;
    if (t2 === "number") {
      if (v2 === 0) {
        x2.s = 1 / v2 < 0 ? -1 : 1;
        x2.e = 0;
        x2.d = [0];
        return;
      }
      if (v2 < 0) {
        v2 = -v2;
        x2.s = -1;
      } else {
        x2.s = 1;
      }
      if (v2 === ~~v2 && v2 < 1e7) {
        for (e2 = 0, i3 = v2; i3 >= 10; i3 /= 10) e2++;
        if (external) {
          if (e2 > Decimal2.maxE) {
            x2.e = NaN;
            x2.d = null;
          } else if (e2 < Decimal2.minE) {
            x2.e = 0;
            x2.d = [0];
          } else {
            x2.e = e2;
            x2.d = [v2];
          }
        } else {
          x2.e = e2;
          x2.d = [v2];
        }
        return;
      }
      if (v2 * 0 !== 0) {
        if (!v2) x2.s = NaN;
        x2.e = NaN;
        x2.d = null;
        return;
      }
      return parseDecimal(x2, v2.toString());
    }
    if (t2 === "string") {
      if ((i3 = v2.charCodeAt(0)) === 45) {
        v2 = v2.slice(1);
        x2.s = -1;
      } else {
        if (i3 === 43) v2 = v2.slice(1);
        x2.s = 1;
      }
      return isDecimal.test(v2) ? parseDecimal(x2, v2) : parseOther(x2, v2);
    }
    if (t2 === "bigint") {
      if (v2 < 0) {
        v2 = -v2;
        x2.s = -1;
      } else {
        x2.s = 1;
      }
      return parseDecimal(x2, v2.toString());
    }
    throw Error(invalidArgument + v2);
  }
  Decimal2.prototype = P;
  Decimal2.ROUND_UP = 0;
  Decimal2.ROUND_DOWN = 1;
  Decimal2.ROUND_CEIL = 2;
  Decimal2.ROUND_FLOOR = 3;
  Decimal2.ROUND_HALF_UP = 4;
  Decimal2.ROUND_HALF_DOWN = 5;
  Decimal2.ROUND_HALF_EVEN = 6;
  Decimal2.ROUND_HALF_CEIL = 7;
  Decimal2.ROUND_HALF_FLOOR = 8;
  Decimal2.EUCLID = 9;
  Decimal2.config = Decimal2.set = config;
  Decimal2.clone = clone;
  Decimal2.isDecimal = isDecimalInstance;
  Decimal2.abs = abs;
  Decimal2.acos = acos;
  Decimal2.acosh = acosh;
  Decimal2.add = add;
  Decimal2.asin = asin;
  Decimal2.asinh = asinh;
  Decimal2.atan = atan;
  Decimal2.atanh = atanh;
  Decimal2.atan2 = atan2;
  Decimal2.cbrt = cbrt;
  Decimal2.ceil = ceil;
  Decimal2.clamp = clamp;
  Decimal2.cos = cos;
  Decimal2.cosh = cosh;
  Decimal2.div = div;
  Decimal2.exp = exp;
  Decimal2.floor = floor;
  Decimal2.hypot = hypot;
  Decimal2.ln = ln;
  Decimal2.log = log;
  Decimal2.log10 = log10;
  Decimal2.log2 = log2;
  Decimal2.max = max;
  Decimal2.min = min;
  Decimal2.mod = mod;
  Decimal2.mul = mul;
  Decimal2.pow = pow;
  Decimal2.random = random;
  Decimal2.round = round;
  Decimal2.sign = sign;
  Decimal2.sin = sin;
  Decimal2.sinh = sinh;
  Decimal2.sqrt = sqrt;
  Decimal2.sub = sub;
  Decimal2.sum = sum;
  Decimal2.tan = tan;
  Decimal2.tanh = tanh;
  Decimal2.trunc = trunc;
  if (obj === void 0) obj = {};
  if (obj) {
    if (obj.defaults !== true) {
      ps = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
      for (i2 = 0; i2 < ps.length; ) if (!obj.hasOwnProperty(p2 = ps[i2++])) obj[p2] = this[p2];
    }
  }
  Decimal2.config(obj);
  return Decimal2;
}
function div(x2, y2) {
  return new this(x2).div(y2);
}
function exp(x2) {
  return new this(x2).exp();
}
function floor(x2) {
  return finalise(x2 = new this(x2), x2.e + 1, 3);
}
function hypot() {
  var i2, n2, t2 = new this(0);
  external = false;
  for (i2 = 0; i2 < arguments.length; ) {
    n2 = new this(arguments[i2++]);
    if (!n2.d) {
      if (n2.s) {
        external = true;
        return new this(1 / 0);
      }
      t2 = n2;
    } else if (t2.d) {
      t2 = t2.plus(n2.times(n2));
    }
  }
  external = true;
  return t2.sqrt();
}
function isDecimalInstance(obj) {
  return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
}
function ln(x2) {
  return new this(x2).ln();
}
function log(x2, y2) {
  return new this(x2).log(y2);
}
function log2(x2) {
  return new this(x2).log(2);
}
function log10(x2) {
  return new this(x2).log(10);
}
function max() {
  return maxOrMin(this, arguments, -1);
}
function min() {
  return maxOrMin(this, arguments, 1);
}
function mod(x2, y2) {
  return new this(x2).mod(y2);
}
function mul(x2, y2) {
  return new this(x2).mul(y2);
}
function pow(x2, y2) {
  return new this(x2).pow(y2);
}
function random(sd) {
  var d2, e2, k2, n2, i2 = 0, r2 = new this(1), rd = [];
  if (sd === void 0) sd = this.precision;
  else checkInt32(sd, 1, MAX_DIGITS);
  k2 = Math.ceil(sd / LOG_BASE);
  if (!this.crypto) {
    for (; i2 < k2; ) rd[i2++] = Math.random() * 1e7 | 0;
  } else if (crypto.getRandomValues) {
    d2 = crypto.getRandomValues(new Uint32Array(k2));
    for (; i2 < k2; ) {
      n2 = d2[i2];
      if (n2 >= 429e7) {
        d2[i2] = crypto.getRandomValues(new Uint32Array(1))[0];
      } else {
        rd[i2++] = n2 % 1e7;
      }
    }
  } else if (crypto.randomBytes) {
    d2 = crypto.randomBytes(k2 *= 4);
    for (; i2 < k2; ) {
      n2 = d2[i2] + (d2[i2 + 1] << 8) + (d2[i2 + 2] << 16) + ((d2[i2 + 3] & 127) << 24);
      if (n2 >= 214e7) {
        crypto.randomBytes(4).copy(d2, i2);
      } else {
        rd.push(n2 % 1e7);
        i2 += 4;
      }
    }
    i2 = k2 / 4;
  } else {
    throw Error(cryptoUnavailable);
  }
  k2 = rd[--i2];
  sd %= LOG_BASE;
  if (k2 && sd) {
    n2 = mathpow(10, LOG_BASE - sd);
    rd[i2] = (k2 / n2 | 0) * n2;
  }
  for (; rd[i2] === 0; i2--) rd.pop();
  if (i2 < 0) {
    e2 = 0;
    rd = [0];
  } else {
    e2 = -1;
    for (; rd[0] === 0; e2 -= LOG_BASE) rd.shift();
    for (k2 = 1, n2 = rd[0]; n2 >= 10; n2 /= 10) k2++;
    if (k2 < LOG_BASE) e2 -= LOG_BASE - k2;
  }
  r2.e = e2;
  r2.d = rd;
  return r2;
}
function round(x2) {
  return finalise(x2 = new this(x2), x2.e + 1, this.rounding);
}
function sign(x2) {
  x2 = new this(x2);
  return x2.d ? x2.d[0] ? x2.s : 0 * x2.s : x2.s || NaN;
}
function sin(x2) {
  return new this(x2).sin();
}
function sinh(x2) {
  return new this(x2).sinh();
}
function sqrt(x2) {
  return new this(x2).sqrt();
}
function sub(x2, y2) {
  return new this(x2).sub(y2);
}
function sum() {
  var i2 = 0, args = arguments, x2 = new this(args[i2]);
  external = false;
  for (; x2.s && ++i2 < args.length; ) x2 = x2.plus(args[i2]);
  external = true;
  return finalise(x2, this.precision, this.rounding);
}
function tan(x2) {
  return new this(x2).tan();
}
function tanh(x2) {
  return new this(x2).tanh();
}
function trunc(x2) {
  return finalise(x2 = new this(x2), x2.e + 1, 1);
}
P[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = P.toString;
P[Symbol.toStringTag] = "Decimal";
var Decimal = P.constructor = clone(DEFAULTS);
LN10 = new Decimal(LN10);
PI = new Decimal(PI);
var decimal_default = Decimal;

// node_modules/ts-pattern/dist/index.js
var t = /* @__PURE__ */ Symbol.for("@ts-pattern/matcher");
var e = /* @__PURE__ */ Symbol.for("@ts-pattern/isVariadic");
var n = "@ts-pattern/anonymous-select-key";
var r = (t2) => Boolean(t2 && "object" == typeof t2);
var i = (e2) => e2 && !!e2[t];
var o = (n2, s2, c2) => {
  if (i(n2)) {
    const e2 = n2[t](), { matched: r2, selections: i2 } = e2.match(s2);
    return r2 && i2 && Object.keys(i2).forEach((t2) => c2(t2, i2[t2])), r2;
  }
  if (r(n2)) {
    if (!r(s2)) return false;
    if (Array.isArray(n2)) {
      if (!Array.isArray(s2)) return false;
      let t2 = [], r2 = [], u2 = [];
      for (const o2 of n2.keys()) {
        const s3 = n2[o2];
        i(s3) && s3[e] ? u2.push(s3) : u2.length ? r2.push(s3) : t2.push(s3);
      }
      if (u2.length) {
        if (u2.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
        if (s2.length < t2.length + r2.length) return false;
        const e2 = s2.slice(0, t2.length), n3 = 0 === r2.length ? [] : s2.slice(-r2.length), i2 = s2.slice(t2.length, 0 === r2.length ? Infinity : -r2.length);
        return t2.every((t3, n4) => o(t3, e2[n4], c2)) && r2.every((t3, e3) => o(t3, n3[e3], c2)) && (0 === u2.length || o(u2[0], i2, c2));
      }
      return n2.length === s2.length && n2.every((t3, e2) => o(t3, s2[e2], c2));
    }
    return Reflect.ownKeys(n2).every((e2) => {
      const r2 = n2[e2];
      return (e2 in s2 || i(u2 = r2) && "optional" === u2[t]().matcherType) && o(r2, s2[e2], c2);
      var u2;
    });
  }
  return Object.is(s2, n2);
};
var s = (e2) => {
  var n2, o2, u2;
  return r(e2) ? i(e2) ? null != (n2 = null == (o2 = (u2 = e2[t]()).getSelectionKeys) ? void 0 : o2.call(u2)) ? n2 : [] : Array.isArray(e2) ? c(e2, s) : c(Object.values(e2), s) : [];
};
var c = (t2, e2) => t2.reduce((t3, n2) => t3.concat(e2(n2)), []);
function u(...t2) {
  if (1 === t2.length) {
    const [e2] = t2;
    return (t3) => o(e2, t3, () => {
    });
  }
  if (2 === t2.length) {
    const [e2, n2] = t2;
    return o(e2, n2, () => {
    });
  }
  throw new Error(`isMatching wasn't given the right number of arguments: expected 1 or 2, received ${t2.length}.`);
}
function a(t2) {
  return Object.assign(t2, { optional: () => h(t2), and: (e2) => d(t2, e2), or: (e2) => y(t2, e2), select: (e2) => void 0 === e2 ? v(t2) : v(e2, t2) });
}
function l(t2) {
  return Object.assign(((t3) => Object.assign(t3, { [Symbol.iterator]() {
    let n2 = 0;
    const r2 = [{ value: Object.assign(t3, { [e]: true }), done: false }, { done: true, value: void 0 }];
    return { next: () => {
      var t4;
      return null != (t4 = r2[n2++]) ? t4 : r2.at(-1);
    } };
  } }))(t2), { optional: () => l(h(t2)), select: (e2) => l(void 0 === e2 ? v(t2) : v(e2, t2)) });
}
function h(e2) {
  return a({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return void 0 === t2 ? (s(e2).forEach((t3) => r2(t3, void 0)), { matched: true, selections: n2 }) : { matched: o(e2, t2, r2), selections: n2 };
  }, getSelectionKeys: () => s(e2), matcherType: "optional" }) });
}
var f = (t2, e2) => {
  for (const n2 of t2) if (!e2(n2)) return false;
  return true;
};
var g = (t2, e2) => {
  for (const [n2, r2] of t2.entries()) if (!e2(r2, n2)) return false;
  return true;
};
var m = (t2, e2) => {
  const n2 = Reflect.ownKeys(t2);
  for (const r2 of n2) if (!e2(r2, t2[r2])) return false;
  return true;
};
function d(...e2) {
  return a({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return { matched: e2.every((e3) => o(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, s), matcherType: "and" }) });
}
function y(...e2) {
  return a({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return c(e2, s).forEach((t3) => r2(t3, void 0)), { matched: e2.some((e3) => o(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, s), matcherType: "or" }) });
}
function p(e2) {
  return { [t]: () => ({ match: (t2) => ({ matched: Boolean(e2(t2)) }) }) };
}
function v(...e2) {
  const r2 = "string" == typeof e2[0] ? e2[0] : void 0, i2 = 2 === e2.length ? e2[1] : "string" == typeof e2[0] ? void 0 : e2[0];
  return a({ [t]: () => ({ match: (t2) => {
    let e3 = { [null != r2 ? r2 : n]: t2 };
    return { matched: void 0 === i2 || o(i2, t2, (t3, n2) => {
      e3[t3] = n2;
    }), selections: e3 };
  }, getSelectionKeys: () => [null != r2 ? r2 : n].concat(void 0 === i2 ? [] : s(i2)) }) });
}
function b(t2) {
  return true;
}
function w(t2) {
  return "number" == typeof t2;
}
function S(t2) {
  return "string" == typeof t2;
}
function j(t2) {
  return "bigint" == typeof t2;
}
var K = a(p(b));
var O = a(p(b));
var E = K;
var x = (t2) => Object.assign(a(t2), { startsWith: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.startsWith(n2)))));
  var n2;
}, endsWith: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.endsWith(n2)))));
  var n2;
}, minLength: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length >= t3))(e2))), length: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length === t3))(e2))), maxLength: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length <= t3))(e2))), includes: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.includes(n2)))));
  var n2;
}, regex: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && Boolean(t3.match(n2))))));
  var n2;
} });
var A = x(p(S));
var N = (t2) => Object.assign(a(t2), { between: (e2, n2) => N(d(t2, ((t3, e3) => p((n3) => w(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 < t3))(e2))), gt: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 > t3))(e2))), lte: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 <= t3))(e2))), gte: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 >= t3))(e2))), int: () => N(d(t2, p((t3) => w(t3) && Number.isInteger(t3)))), finite: () => N(d(t2, p((t3) => w(t3) && Number.isFinite(t3)))), positive: () => N(d(t2, p((t3) => w(t3) && t3 > 0))), negative: () => N(d(t2, p((t3) => w(t3) && t3 < 0))) });
var P2 = N(p(w));
var k = (t2) => Object.assign(a(t2), { between: (e2, n2) => k(d(t2, ((t3, e3) => p((n3) => j(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 < t3))(e2))), gt: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 > t3))(e2))), lte: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 <= t3))(e2))), gte: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 >= t3))(e2))), positive: () => k(d(t2, p((t3) => j(t3) && t3 > 0))), negative: () => k(d(t2, p((t3) => j(t3) && t3 < 0))) });
var T = k(p(j));
var B = a(p(function(t2) {
  return "boolean" == typeof t2;
}));
var _ = a(p(function(t2) {
  return "symbol" == typeof t2;
}));
var W = a(p(function(t2) {
  return null == t2;
}));
var $ = a(p(function(t2) {
  return null != t2;
}));
var z = { __proto__: null, matcher: t, optional: h, array: function(...e2) {
  return l({ [t]: () => ({ match: (t2) => {
    if (!Array.isArray(t2)) return { matched: false };
    if (0 === e2.length) return { matched: true };
    const n2 = e2[0];
    let r2 = {};
    if (0 === t2.length) return s(n2).forEach((t3) => {
      r2[t3] = [];
    }), { matched: true, selections: r2 };
    const i2 = (t3, e3) => {
      r2[t3] = (r2[t3] || []).concat([e3]);
    };
    return { matched: t2.every((t3) => o(n2, t3, i2)), selections: r2 };
  }, getSelectionKeys: () => 0 === e2.length ? [] : s(e2[0]) }) });
}, set: function(...e2) {
  return a({ [t]: () => ({ match: (t2) => {
    if (!(t2 instanceof Set)) return { matched: false };
    let n2 = {};
    if (0 === t2.size) return { matched: true, selections: n2 };
    if (0 === e2.length) return { matched: true };
    const r2 = (t3, e3) => {
      n2[t3] = (n2[t3] || []).concat([e3]);
    }, i2 = e2[0];
    return { matched: f(t2, (t3) => o(i2, t3, r2)), selections: n2 };
  }, getSelectionKeys: () => 0 === e2.length ? [] : s(e2[0]) }) });
}, map: function(...e2) {
  return a({ [t]: () => ({ match: (t2) => {
    if (!(t2 instanceof Map)) return { matched: false };
    let n2 = {};
    if (0 === t2.size) return { matched: true, selections: n2 };
    const r2 = (t3, e3) => {
      n2[t3] = (n2[t3] || []).concat([e3]);
    };
    if (0 === e2.length) return { matched: true };
    var i2;
    if (1 === e2.length) throw new Error(`\`P.map\` wasn't given enough arguments. Expected (key, value), received ${null == (i2 = e2[0]) ? void 0 : i2.toString()}`);
    const [s2, c2] = e2;
    return { matched: g(t2, (t3, e3) => {
      const n3 = o(s2, e3, r2), i3 = o(c2, t3, r2);
      return n3 && i3;
    }), selections: n2 };
  }, getSelectionKeys: () => 0 === e2.length ? [] : [...s(e2[0]), ...s(e2[1])] }) });
}, record: function(...e2) {
  return a({ [t]: () => ({ match: (t2) => {
    if (null === t2 || "object" != typeof t2 || Array.isArray(t2)) return { matched: false };
    var n2;
    if (0 === e2.length) throw new Error(`\`P.record\` wasn't given enough arguments. Expected (value) or (key, value), received ${null == (n2 = e2[0]) ? void 0 : n2.toString()}`);
    let r2 = {};
    const i2 = (t3, e3) => {
      r2[t3] = (r2[t3] || []).concat([e3]);
    }, [s2, c2] = 1 === e2.length ? [A, e2[0]] : e2;
    return { matched: m(t2, (t3, e3) => {
      const n3 = "string" != typeof t3 || Number.isNaN(Number(t3)) ? null : Number(t3), r3 = null !== n3 && o(s2, n3, i2), u2 = o(s2, t3, i2), a2 = o(c2, e3, i2);
      return (u2 || r3) && a2;
    }), selections: r2 };
  }, getSelectionKeys: () => 0 === e2.length ? [] : [...s(e2[0]), ...s(e2[1])] }) });
}, intersection: d, union: y, not: function(e2) {
  return a({ [t]: () => ({ match: (t2) => ({ matched: !o(e2, t2, () => {
  }) }), getSelectionKeys: () => [], matcherType: "not" }) });
}, when: p, select: v, any: K, unknown: O, _: E, string: A, number: P2, bigint: T, boolean: B, symbol: _, nullish: W, nonNullable: $, instanceOf: function(t2) {
  return a(p(/* @__PURE__ */ (function(t3) {
    return (e2) => e2 instanceof t3;
  })(t2)));
}, shape: function(t2) {
  return a(p(u(t2)));
} };
var I = class extends Error {
  constructor(t2) {
    let e2;
    try {
      e2 = JSON.stringify(t2);
    } catch (n2) {
      e2 = t2;
    }
    super(`Pattern matching error: no pattern matches value ${e2}`), this.input = void 0, this.input = t2;
  }
};
var L = { matched: false, value: void 0 };
function M(t2) {
  return new R(t2, L);
}
var R = class _R {
  constructor(t2, e2) {
    this.input = void 0, this.state = void 0, this.input = t2, this.state = e2;
  }
  with(...t2) {
    if (this.state.matched) return this;
    const e2 = t2[t2.length - 1], r2 = [t2[0]];
    let i2;
    3 === t2.length && "function" == typeof t2[1] ? i2 = t2[1] : t2.length > 2 && r2.push(...t2.slice(1, t2.length - 1));
    let s2 = false, c2 = {};
    const u2 = (t3, e3) => {
      s2 = true, c2[t3] = e3;
    }, a2 = !r2.some((t3) => o(t3, this.input, u2)) || i2 && !Boolean(i2(this.input)) ? L : { matched: true, value: e2(s2 ? n in c2 ? c2[n] : c2 : this.input, this.input) };
    return new _R(this.input, a2);
  }
  when(t2, e2) {
    if (this.state.matched) return this;
    const n2 = Boolean(t2(this.input));
    return new _R(this.input, n2 ? { matched: true, value: e2(this.input, this.input) } : L);
  }
  otherwise(t2) {
    return this.state.matched ? this.state.value : t2(this.input);
  }
  exhaustive(t2 = F) {
    return this.state.matched ? this.state.value : t2(this.input);
  }
  run() {
    return this.exhaustive();
  }
  returnType() {
    return this;
  }
  narrow() {
    return this;
  }
};
function F(t2) {
  throw new I(t2);
}

// vendor/abicus/src/calculator/internal/evaluator.ts
decimal_default.set({ precision: 500 });
var PI2 = decimal_default.acos(-1);
var E2 = decimal_default.exp(1);
var ONE = new decimal_default(1);
var TWO = new decimal_default(2);
var RAD_DEG_RATIO = new decimal_default(180).div(PI2);
var TAN_PRECISION = new decimal_default(1).div("1_000_000_000");
function evaluate(tokens2, ans, ind, angleUnit) {
  let idx = -1;
  function next() {
    return tokens2[++idx];
  }
  function peek() {
    return tokens2[idx + 1];
  }
  function expect(pattern) {
    const token = peek();
    if (!token) return err("UNEXPECTED_EOF");
    if (!u(pattern)(token)) return err("UNEXPECTED_TOKEN");
    next();
    return ok(token);
  }
  function nud(token) {
    return M(token).with(void 0, () => err("UNEXPECTED_EOF")).with({ type: "litr" }, (token2) => ok(token2.value)).with({ type: "cons", name: "pi" }, () => ok(PI2)).with({ type: "cons", name: "e" }, () => ok(E2)).with({ type: "memo", name: "ans" }, () => ok(ans)).with({ type: "memo", name: "ind" }, () => ok(ind)).with({ type: "oper", name: "-" }, () => evalExpr(3).map((right) => right.neg())).with(
      { type: "lbrk" },
      () => evalExpr(0).andThen(
        (value) => expect({ type: "rbrk" }).map(() => value).mapErr(() => "NO_RHS_BRACKET")
      )
    ).with(
      { type: "func" },
      (token2) => evalArgs().andThen(
        (args) => M(token2.name).with("root", () => {
          if (args.length < 1) return err("NOT_ENOUGH_ARGS");
          if (args.length > 2) return err("TOO_MANY_ARGS");
          const radicand = args[0];
          const degree = args[1] ?? TWO;
          if (degree.eq(0)) {
            return err("NOT_A_NUMBER");
          }
          return ok(
            radicand.isZero() ? radicand : radicand.lt(0) && degree.isInteger() && !degree.mod(2).eq(0) ? radicand.neg().pow(ONE.div(degree)).neg() : radicand.pow(ONE.div(degree))
          );
        }).otherwise((funcName) => {
          if (args.length < 1) return err("NOT_ENOUGH_ARGS");
          if (args.length > 1) return err("TOO_MANY_ARGS");
          const func = decimal_default[funcName].bind(decimal_default);
          const arg = args[0];
          const { any, union } = z;
          return M([angleUnit, funcName]).with(["deg", union("sin", "cos")], () => ok(func(degToRad(arg)))).with(["deg", union("asin", "acos", "atan")], () => ok(radToDeg(func(arg)))).with([any, "tan"], () => {
            const argInRads = angleUnit === "deg" ? degToRad(arg) : arg;
            const coefficient = argInRads.sub(PI2.div(2)).div(PI2);
            const distFromCriticalPoint = coefficient.sub(coefficient.round()).abs();
            const isArgCritical = distFromCriticalPoint.lt(TAN_PRECISION);
            if (isArgCritical) return err("TRIG_PRECISION");
            return ok(func(argInRads));
          }).otherwise(() => ok(func(arg)));
        })
      )
    ).otherwise(() => err("UNEXPECTED_TOKEN"));
  }
  function led(token, left) {
    return M(token).with(void 0, () => err("UNEXPECTED_EOF")).with({ type: "oper", name: "+" }, () => evalExpr(2).map((right) => left.value.add(right))).with({ type: "oper", name: "-" }, () => evalExpr(2).map((right) => left.value.sub(right))).with({ type: "oper", name: "*" }, () => evalExpr(3).map((right) => left.value.mul(right))).with({ type: "oper", name: "/" }, () => evalExpr(3).map((right) => left.value.div(right))).with({ type: "oper", name: "^" }, () => evalExpr(3).map((right) => left.value.pow(right))).with({ type: "rbrk" }, () => err("NO_LHS_BRACKET")).otherwise(() => err("UNEXPECTED_TOKEN"));
  }
  function evalArgs() {
    return expect({ type: "lbrk" }).andThen(() => {
      const out = [];
      do {
        out.push(evalExpr(0));
      } while (expect({ type: "semi" }).isOk());
      return expect({ type: "rbrk" }).andThen(() => Result.combine(out));
    });
  }
  function evalExpr(rbp) {
    let left = nud(next());
    while (left.isOk() && peek() && lbp(peek()) > rbp) {
      left = led(next(), left);
    }
    return left;
  }
  const result = evalExpr(0);
  if (peek()) {
    return err("UNEXPECTED_TOKEN");
  } else if (result.isErr()) {
    return result;
  } else if (result.value?.isNaN()) {
    return err("NOT_A_NUMBER");
  } else if (!result.value?.isFinite()) {
    return err("INFINITY");
  } else {
    return result;
  }
}
function lbp(token) {
  return M(token).with({ type: z.union("lbrk", "rbrk", "semi") }, () => 0).with({ type: z.union("litr", "memo", "cons") }, () => 1).with({ type: "oper", name: z.union("+", "-") }, () => 2).with({ type: "oper", name: z.union("*", "/") }, () => 3).with({ type: "oper", name: "^" }, () => 4).with({ type: "func" }, () => 5).exhaustive();
}
function degToRad(deg) {
  return deg.div(RAD_DEG_RATIO);
}
function radToDeg(rad) {
  return rad.mul(RAD_DEG_RATIO);
}

// vendor/abicus/src/calculator/internal/tokeniser.ts
var tokenMatchers = [
  // **Notes:**
  // - Each regex should only try to find its token from the beginning of the string.
  // - When adding new types, remember to mark the `type` property `as const` for TypeScript.
  [
    // Unsigned numeric literal: "0", "123", "25.6", etc...
    /^((\d+[,.]\d+)|([1-9]\d*)|0)/,
    (str) => ({
      type: "litr",
      value: new decimal_default(str.replace(",", "."))
    })
  ],
  [
    // Operators: "-", "+", "÷", "*", "^"
    // The multiplication, minus and division signs have unicode variants that also need to be handled
    /^[-+/*^−×÷]/,
    (str) => ({
      type: "oper",
      name: M(str).with("-", "+", "*", "^", (op) => op).with("\u2212", () => "-").with("\xD7", () => "*").with("\xF7", "/", () => "/").otherwise((op) => {
        throw Error(`Programmer error: neglected operator "${op}"`);
      })
    })
  ],
  [
    // Left bracket: "("
    /^\(/,
    (_2) => ({ type: "lbrk" })
  ],
  [
    // Right bracket: ")"
    /^\)/,
    (_2) => ({ type: "rbrk" })
  ],
  [
    // Semicolon: ";"
    /^;/,
    (_2) => ({ type: "semi" })
  ],
  [
    // Constants: "pi", "e", and unicode variations
    /^(pi|π|e|ℇ|𝑒|ℯ)/i,
    (str) => ({
      type: "cons",
      name: M(str.toLowerCase()).with("pi", "e", (name) => name).with("\u03C0", () => "pi").with("\u2107", "\u{1D452}", "\u212F", () => "e").otherwise((name) => {
        throw Error(`Programmer error: neglected constant "${name}"`);
      })
    })
  ],
  [
    // Memory register: "ans" (answer register), "mem" (independent memory register)
    /^(ans|mem|m|ind)/i,
    (str) => ({
      type: "memo",
      name: M(str.toLowerCase()).with("ans", () => "ans").with("m", "ind", "mem", () => "ind").otherwise((name) => {
        throw Error(`Programmer error: neglected memory register "${name}"`);
      })
    })
  ],
  [
    // Function name: "sin", "log", "√", etc...
    new RegExp(
      [
        // TODO: Should we also support the "sin^(-1)" notation for arcus functions?
        // TODO: Should we also support the "sin^(2)(x) == sin(x^2)" notation?
        /^((a(rc)?)?(sin|cos|tan))/,
        /^(log|lg|ln)/,
        /^(root|sqrt|√)/
      ].map((subRegex) => subRegex.source).join("|"),
      "i"
    ),
    (str) => ({
      type: "func",
      name: M(str.toLowerCase()).with("sqrt", "root", "ln", "sin", "cos", "tan", "asin", "acos", "atan", (name) => name).with("log", "lg", () => "log10").with("\u221A", () => "root").with("arcsin", () => "asin").with("arccos", () => "acos").with("arctan", () => "atan").otherwise((name) => {
        throw Error(`Programmer error: neglected function "${name}"`);
      })
    })
  ]
];
function tokenise(expression) {
  return Result.combine([...tokens(expression)]);
}
function* tokens(expression) {
  const end = expression.length;
  let idx = 0;
  eating: while (idx < end) {
    const slice = expression.slice(idx, end);
    const whitespace = /^\s+/.exec(slice)?.[0];
    if (whitespace) {
      idx += whitespace.length;
      continue eating;
    }
    if (false) {
      window[INPUT_DEBUG] = "tan5sin/ANSsin/tan5sin+(\u{1F57A}\u{1F3FC}\u{1F57A}\u{1F3FC})";
      throw Error("Simulated Error: This is a simulated error for testing purposes.");
    }
    matching: for (const [regex, build] of tokenMatchers) {
      const str = regex.exec(slice)?.[0];
      if (!str) continue matching;
      const token = build(str);
      idx += str.length;
      yield ok(token);
      continue eating;
    }
    yield err({ type: "UNKNOWN_TOKEN", idx });
    return;
  }
}
export {
  decimal_default as Decimal,
  evaluate,
  tokenise
};
/*! Bundled license information:

decimal.js/decimal.mjs:
  (*!
   *  decimal.js v10.6.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   *)
*/
