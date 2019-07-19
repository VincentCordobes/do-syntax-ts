import { Result, Ok, isOk, succeed, fail, Err } from "./result";

// Experimenting some stuff in there

type GenResult<T, E> = Generator<Result<T, E>, Result<T, E>, T>;

function addOne(a: number): number {
  return a + 1;
}

// Given a function that may fail
function divide(a: number, b: number): Result<number, string> {
  return b === 0 ? fail("Division by Zero") : succeed(a / b);
}

// Compare this :
function example2(): Result<number, string> {
  const divResult = divide(8, 2);
  if (isOk(divResult)) {
    const r1 = addOne(divResult.value);
    const rr1 = addOne(r1);
    const divResult1 = divide(rr1, 0);
    if (isOk(divResult1)) {
      const divResult2 = divide(divResult1.value, 2);
      if (isOk(divResult2)) {
        return succeed(addOne(divResult2.value));
      } else {
        return fail(divResult2.error);
      }
    } else {
      return fail(divResult1.error);
    }
  } else {
    return fail(divResult.error);
  }
}

// Chaining style
function example1(): Result<number, number> {
  return divide(8, 2)
    .map(addOne)
    .map(addOne)
    .bind(v => divide(v, 0)) // ouch
    .bind(v => divide(v, 2))
    .mapErr(s => Number(s))
    .map(addOne);
}

// To This !!
function* exampleGenerator(): GenResult<number, string> {
  const r = yield divide(8, 2);
  const r1 = addOne(r);
  const rr1 = addOne(r1);
  const r2 = yield divide(rr1, 0); // ouch!!
  const r3 = yield divide(r2, 2);
  return succeed<number, string>(addOne(r3));
}

function DoResult<T, E>(gen: () => GenResult<T, E>): Result<T, E> {
  const it = gen();

  function aux(v?: T): Result<T, E> {
    const { done, value: r } = it.next(v);
    if (done) {
      return isOk(r) ? succeed(r.value) : fail(r.error);
    } else {
      return r.bind(aux);
    }
  }

  return aux();
}

function foo(): Result<number, string> {
  return DoResult(exampleGenerator);
}

type GeneratorAsync<T> = Generator<Promise<T>, Promise<T>, T>;
function DoAsync<T>(gen: () => GeneratorAsync<T>): Promise<T> {
  const it = gen();

  function aux(v?: T): Promise<T> {
    const { done, value: r } = it.next(v);
    if (done) {
      return r;
    } else {
      return r.then(aux);
    }
  }
  return aux();
}

function* test(): GeneratorAsync<number> {
  const a = yield Promise.resolve(1);
  const c = a + 2;
  const d = yield Promise.resolve(10);
  const e = yield Promise.resolve(10);
  return Promise.resolve(c + d + e);
}

function log<T>(v: T): T {
  console.log(v);
  return v;
}

function logR<T, E>(r: Result<T, E>): Result<T, E> {
  if (r instanceof Ok) {
    log(`OK: ${r.value}`);
  } else if (r instanceof Err) {
    log(`Error: ${r.error}`);
  }
  return r;
}
