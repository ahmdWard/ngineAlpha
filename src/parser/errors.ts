export class IncompleteMessageError extends Error {
  constructor(message = "Incomplete HTTP message") {
    super(message);
    this.name = "IncompleteMessageError";
  }
}

export class InvalidMessageError extends Error {
  constructor(message = "Invalid HTTP message") {
    super(message);
    this.name = "InvalidMessageError";
  }
}
