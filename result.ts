export type Result<T, E> = Ok<T, E> | Err<T, E>;

export class Ok<T, E> {
  value: T;
  constructor(v: T) {
    this.value = v;
  }

  bind<U>(f: (v: T) => Result<U, E>): Result<U, E> {
    return f(this.value);
  }

  map<U>(f: (v: T) => U): Result<U, E> {
    return succeed(f(this.value));
  }

  mapErr<U>(f: (e: E) => U): Result<T, U> {
    return succeed(this.value);
  }

  unwrapOrThrow(): T {
    return this.value;
  }
}

export class Err<T, E> {
  error: E;
  constructor(e: E) {
    this.error = e;
  }

  bind<U>(f: (v: T) => Result<U, E>): Result<U, E> {
    return fail(this.error);
  }

  map<U>(f: (v: T) => U): Result<U, E> {
    return fail(this.error);
  }

  mapErr<U>(f: (e: E) => U): Result<T, U> {
    return fail(f(this.error));
  }

  unwrapOrThrow(): T {
    throw new Error("Cannot unwrap None value");
  }
}

export function isOk<T, E>(r: Result<T, E>): r is Ok<T, E> {
  return r instanceof Ok;
}

export function isError<T, E>(r: Result<T, E>): r is Err<T, E> {
  return r instanceof Err;
}

export function succeed<T, E>(value: T): Result<T, E> {
  return new Ok(value);
}

export function fail<T, E>(error: E): Result<T, E> {
  return new Err(error);
}
