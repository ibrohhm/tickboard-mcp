import { Service } from "./checklist.js";
import { Store } from "./store.js";

export function newService(): Service {
  return new Service(Store.open(":memory:"));
}

/** Seeds project > checklist > [milk, eggs]; milk is checked. */
export function seed(svc: Service) {
  const project = svc.add("project", "groceries", null);
  const list = svc.add("checklist", "shopping", project);
  const milk = svc.add("item", "milk", list);
  const eggs = svc.add("item", "eggs", list);
  svc.setChecked(milk, true);
  return { project, list, milk, eggs };
}
