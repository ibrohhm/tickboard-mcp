export class NotFoundError extends Error {
  constructor() {
    super("item not found");
  }
}

export class InvalidParentError extends Error {
  constructor() {
    super("a project goes at top level or under a project, a checklist under a project, an item under a checklist");
  }
}

export class NotCheckableError extends Error {
  constructor() {
    super("only items can be checked");
  }
}

export class CycleError extends Error {
  constructor() {
    super("cannot move an item under itself or its own descendant");
  }
}

export class InvalidTitleError extends Error {
  constructor() {
    super("title must be non-empty and single-line");
  }
}
