const qsswap = (input, li, ri) => {
  var temp = input[li];
  input[li] = input[ri];
  input[ri] = temp;
};

const partition = (input, left, right, animations) => {
  var pivot = input[Math.floor((right + left) / 2)]; // Get middle element as pivot
  animations.push(["curr", pivot]);
  // Set pointers for left and right indices
  var i = left;
  var j = right;

  animations.push(["comp", left, right]);

  while (i <= j) {
    // Increment left pointer
    while (input[i] < pivot) {
      animations.push(["clear", i]);
      i++;
      animations.push(["left", i]);
      animations.push(["clear", i]);
    }

    // Decrement right pointer
    while (input[j] > pivot) {
      animations.push(["clear", j]);
      j--;
      animations.push(["right", j]);
      animations.push(["clear", j]);
    }
    animations.push(["clear", pivot]);
    animations.push(["clear", i]);
    animations.push(["clear", j]);
    if (i <= j) {
      animations.push(["swap", i, j, input[j]]);
      animations.push(["swap", j, i, input[i]]);
      animations.push(["clear", i]);
      animations.push(["clear", j]);
      qsswap(input, i, j);
      i++;
      j--;
    }
  }
  return i;
};

const quickSortHelper = (input, left, right, animations) => {
  var index;

  if (input.length > 1) {
    index = partition(input, left, right, animations);

    if (left < index - 1) {
      quickSortHelper(input, left, index - 1, animations);
    }

    if (index < right) {
      quickSortHelper(input, index, right, animations);
    }
  }
  return input;
};

export const quickSort = (input, left, right, animations) => {
  let res = quickSortHelper(input, left, right, animations);

  animations.push(["sorted", input.length - 1]);

  return [res, animations];
};
