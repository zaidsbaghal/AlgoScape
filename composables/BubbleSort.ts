const swap = (i, j, array) => {
  let temp = array[i];
  array[i] = array[j];
  array[j] = temp;
};

export const bubbleSort = (array, animations) => {
  let isSorted = false;
  let counter = 0;

  while (!isSorted) {
    isSorted = true;
    for (let i = 0; i < array.length - 1 - counter; i++) {
      animations.push(["curr", i]);
      animations.push(["comp", i, i + 1]);
      if (array[i] > array[i + 1]) {
        animations.push(["swap", i, array[i + 1]]);
        animations.push(["swap", i + 1, array[i]]);
        swap(i, i + 1, array);
        isSorted = false;
      }
      animations.push(["clear", i]);
    }
    counter += 1;
    animations.push(["done", array.length - counter]);
  }
  animations.push(["sorted", array.length - 1]);
  return [array, animations];
};
