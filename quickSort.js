(function(exports) {
    exports.quickSort = (function() {
        var items;

        var compare = function(a, b) {
            return a - b;
        };


        var partition = function(left, right) {
            var pivot = items[Math.floor((right + left) / 2)],
                i = left,
                j = right,
                tmp,
                x;

            while (i <= j) {
                while (compare(items[i], pivot) < 0) {
                    i++;
                }

                while (compare(items[j], pivot) > 0) {
                    j--;
                }

                if (i <= j) {

                    if (typeof (items[i]) === 'object' && Object.prototype.toString(items[i]) === '[object Object]') {
                        //if object, make a shallow copy
                        tmp = {};
                        for (x in items[i]) {
                            if (items[i].hasOwnProperty(x)) {
                                tmp[x] = items[i][x];
                            }
                        }
                        items[i] = {};
                        for (x in items[j]) {
                            if (items[j].hasOwnProperty(x)) {
                                items[i][x] = items[j][x];
                            }
                        }

                    } else {
                        tmp = items[i];
                        items[i] = items[j];
                    }

                    items[j] = tmp;
                    i++;
                    j--;

                }
            }

            return i;
        }

        var sort = function(left, right) {
            var thirdIndex = 0;

            if (typeof(left) === 'undefined') {
                left = 0;
            }

            if (typeof(right) === 'undefined') {
                right = items.length - 1;
            }

            thirdIndex = partition(left, right);

            if (left < thirdIndex - 1) {
                sort(left, thirdIndex - 1);
            }

            if (right > thirdIndex) {
                sort(thirdIndex, right);
            }

            return items;
        }

        return function(array, cmp) {
            if (typeof(cmp) !== 'undefined') {
                compare = cmp;
            }
            items = array;
            return sort(0, items.length - 1);
        }

    })()
})(typeof exports === 'undefined' ? this : exports)
