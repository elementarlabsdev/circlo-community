export default function findRecursive<T>(
  items: any[],
  predicate: (item: any) => boolean,
  childrenProperty = 'children'
): any {
  for (const item of items) {
    if (predicate(item)) {
      return item;
    }

    if (item[childrenProperty] && item[childrenProperty].length > 0) {
      const foundInChildren = findRecursive(item[childrenProperty], predicate, childrenProperty);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }
  return undefined;
}
