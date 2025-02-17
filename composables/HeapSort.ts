export const heapSort = (array) => {
  let size = array.length;

  // build heapSort (rearrange array)
  for (let i = Math.floor(size / 2 - 1); i >= 0; i--) heapify(array, size, i);

  // one by one extract an element from heapSort
  for (let i = size - 1; i >= 0; i--) {
    // move current root to end
    let temp = array[0];
    array[0] = array[i];
    array[i] = temp;

    // call max heapify on the reduced heapSort
    heapify(array, i, 0);
  }
  return array;
};

// to heapify a subtree rooted with node i which is an index in array[]
export const heapify = (array, size, i) => {
  let max = i; // initialize max as root
  let left = 2 * i + 1;
  let right = 2 * i + 2;

  // if left child is larger than root
  if (left < size && array[left] > array[max]) max = left;

  // if right child is larger than max
  if (right < size && array[right] > array[max]) max = right;

  // if max is not root
  if (max != i) {
    // swap
    let temp = array[i];
    array[i] = array[max];
    array[max] = temp;

    // recursively heapify the affected sub-tree
    heapify(array, size, max);
  }
};
