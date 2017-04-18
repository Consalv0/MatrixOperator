/* eslint space-infix-ops: 0, space-before-function-paren: 0, indent: 0, no-trailing-spaces: 0, no-irregular-whitespace: 0 */
/* global $ */

/* BUTTONS */
function addPlus(path) {
  let button = '<button class="btn btn-success">⏎'
  $(path).append(button)
}

function addSub() {
  let button = '<button class="btn btn-danger">-'
  $('body #matrix').append(button)
}

function addTable(type) {
  let row = '<div class="row">'
  let path = 'body .container#matrixTable' + type
  $(path).append(row)
  addCell(path + ' .row')
  addCell(path + ' .row')
}

function addCell(path, n, m, value) {
  let text = '<input type="text" class="form-control" id="' + n + '-' + m + '" placeholder="' + value + '" style="text-align:right;">'
  $(path).append(text)
}
/* ******* */

/* MAKE */
// addTable('A')
// addTable('B')
let dataA = [[[0, 0], 1], [[0, 1], 2], [[1, 0], 3], [[1, 1], 4]]
let dataB = [[[0, 0], 1], [[0, 1], 2], [[1, 0], 3], [[1, 1], 4]]

function table(data, id) {
  data.forEach(function(element) {
    let n = element[0][0]
    let m = element[0][1]
    let value = element[1]
    addCell('body .container#mTable' + id, n, m, value)
  })
  addPlus('body .container#mTable' + id)
}
table(dataA, 'A')
table(dataB, 'B')
/* ******* */
