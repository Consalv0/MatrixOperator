/* eslint space-infix-ops: 0, space-before-function-paren: 0, indent: 0, no-trailing-spaces: 0, no-irregular-whitespace: 0 */
/* global $ */

/* TABLE */
function addRow(path, num) {
  let row = '<div class="d-flex flex-nowrap" id="' + num + '">'
  $(path).append(row)
}

function addCell(path, value) {
  let text = '<input type="text" class="form-control" placeholder="' + value + '" style="text-align:right;">'
  $(path).append(text)
}
/* ******* */

/* MAKE */
function doMatrix(matrix, rows, columns) {
  let newRow = []
  for (let j = 0; j < columns; j++) {
    newRow.push(0)
  }
  for (let i = 0; i < rows; i++) {
    matrix.push(newRow)
  }
}

function makeTable(matrix, name) {
  matrix.forEach(function (matrix, i) {
    addRow('#mTable' + name + ' #table', i)
    matrix.forEach(function (matrix) {
      addCell('#mTable' + name + ' #table' + ' #' + i, matrix)
    })
  })
}

var matrixA = []
var matrixB = []
doMatrix(matrixA, 5, 3)
doMatrix(matrixB, 2, 3)
makeTable(matrixA, 'A')
makeTable(matrixB, 'B')
/* ******* */

function getMatrixWithID(parentID) {
  parentID = parentID.toString()
  parentID = parentID.replace(/mTable/g, '')
  if (parentID === 'A') return matrixA
  if (parentID === 'B') return matrixB
}

$('#columns #sum').click(function(matrix) {
  let parentID = $(this).parent().parent().parent().attr('id')
  matrix = getMatrixWithID(parentID)
  addRow('#' + parentID + ' #table', matrix.length)
  let newRow = []
  matrix[0].forEach(function () {
    addCell('#' + parentID + ' #table #' + matrix.length, 0)
    newRow.push(0)
  })
  matrix.push(newRow)
})

$('#columns #sub').click(function(matrix) {
  let parentID = $(this).parent().parent().parent().attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix.length === 1) return
  $('#' + parentID + ' #table #' + (matrix.length-1)).remove()
  matrix.pop()
})

$('#rows #sum').click(function(matrix) {
  let parentID = $(this).parent().parent().parent().attr('id')
  matrix = getMatrixWithID(parentID)
  $('#' + parentID + ' #table div').each(function(idx) {
    addCell('#' + parentID + ' #table #' + idx, 0)
  })
  matrix.forEach(function (mtx, idx) {
    mtx.push(0)
  })
})
