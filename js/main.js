/* eslint space-infix-ops: 0, space-before-function-paren: 0, indent: 0, no-trailing-spaces: 0, no-irregular-whitespace: 0 */
/* global $ */

/* TABLE */
function addRow(path, id) {
  let row = '<div class="d-flex flex-nowrap" id="' + id + '">'
  $(path).append(row)
}

function addColumn(path, id, value = '') {
  let column = '<input type="tel" class="form-control matrixListener" id="' + id + '" value="' + value + '" placeholder="-" style="text-align:center;">'
  $(path).append(column)
}
/* ******* */

/* MAKE */
function doMatrix(matrix, rows, columns) {
  for (let i = 0; i < rows; i++) {
    matrix.push([])
    for (let j = 0; j < columns; j++) {
      matrix[i].push(Math.floor(Math.random()*10))
    }
  }
}

function makeTable(matrix, name) {
  matrix.forEach(function (matrix, i) {
    addRow('#mTable' + name + ' #table', i)
    matrix.forEach(function (matrix, j) {
      addColumn('#mTable' + name + ' #table' + ' div#' + i, j, matrix)
    })
  })
}

function emptyTable(name) {
  $('#mTable' + name + ' #table').empty()
}

var matrixA = []
var matrixB = []
doMatrix(matrixA, 3, 4)
doMatrix(matrixB, 4, 3)
makeTable(matrixA, 'A')
makeTable(matrixB, 'B')
/* ******* */

function getMatrixWithID(parentID) {
  parentID = parentID.toString()
  parentID = parentID.replace(/mTable/g, '')
  if (parentID === 'A') return matrixA
  if (parentID === 'B') return matrixB
}

function toggleModal(path) {
  $(path).modal('toggle')
}

function doSum(mFirst, mSecond, sign = true) {
  if (mFirst.length !== mSecond.length) {
    toggleModal('#noSameSize'); return
  } else if (mFirst[0].length !== mSecond[0].length) {
    toggleModal('#noSameSize'); return
  }
  let mSolved = []
  for (let i = 0; i < mFirst.length; i++) {
    mSolved.push([])
    for (let j = 0; j < mFirst[i].length; j++) {
      if (sign) {
        mSolved[i].push(mFirst[i][j] + mSecond[i][j])
      } else {
        mSolved[i].push(mFirst[i][j] - mSecond[i][j])
      }
    }
  }
  emptyTable('C')
  makeTable(mSolved, 'C')
}

function doMult(mFirst, mSecond, mSolved = []) {
  if (mFirst[0].length !== mSecond.length) {
    toggleModal('#noEqualIntersections'); return
  }
  let sum = 0
  mFirst.forEach(function (element, m) {
    mSolved.push([])
    for (let i = 0; i < mSecond[0].length; i++) {
      mSolved[m].push(0)
      sum = 0
      for (let j = 0; j < element.length; j++) {
        sum += element[j] * mSecond[j][i]
        if (j === element.length-1) {
          mSolved[m][i] = sum
        }
      }
    }
  })

  emptyTable('C')
  makeTable(mSolved, 'C')
}

$(document).on('keyup', '.matrixListener', function() {
  let parentID = $(this).parent().parent().parent().attr('id')
  let matrix = getMatrixWithID(parentID)
  let column = $(this).parent().attr('id')
  let row = $(this).attr('id')
  let value = parseInt($(this).val()) ? parseInt($(this).val()) : 0
  matrix[column][row] = value
})

$(document).on('click', '#rows #sum', function(matrix) {
  let parentID = $(this).parent().parent().parent().attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix.length === 12) return
  addRow('#' + parentID + ' #table', matrix.length)
  let newRow = []
  matrix[0].forEach(function (element, idx) {
    addColumn('#' + parentID + ' #table div#' + matrix.length, idx)
    newRow.push(0)
  })
  matrix.push(newRow)
})

$(document).on('click', '#rows #sub', function(matrix) {
  let parentID = $(this).parent().parent().parent().attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix.length === 1) return
  $('#' + parentID + ' #table div#' + (matrix.length-1)).fadeOut(100, function() {
    $(this).remove()
  })
  matrix.pop()
})

$(document).on('click', '#columns #sum', function(matrix) {
  let parentID = $(this).parent().parent().parent().attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix[0].length === 12) return
  $('#' + parentID + ' #table div').each(function(idx) {
    addColumn('#' + parentID + ' #table div#' + idx, matrix[0].length)
  })
  matrix.forEach(function (mtx) {
    mtx.push(0)
  })
})

$(document).on('click', '#columns #sub', function(matrix) {
  let parentID = $(this).parent().parent().parent().attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix[0].length === 1) return
  $('#' + parentID + ' #table div').each(function(idx, element) {
    $(element).children().last().fadeOut(100, function() {
      $(this).remove()
    })
  })
  matrix.forEach(function (mtx) {
    mtx.pop()
  })
})

$(document).on('click', '#matrixOperator #twoMatrix label', function(matrixFirst, matrixSecond) {
  if (($(this).parent().parent().parent().find('#matrixFirst').find(':selected').text()) === 'Select Matrix') {
    toggleModal('#missinMatrix'); return
  }
  if (($(this).parent().parent().parent().find('#matrixSecond').find(':selected').text()) === 'Select Matrix') {
    toggleModal('#missinMatrix'); return
  }
  matrixFirst = ($(this).parent().parent().parent().find('#matrixFirst').find(':selected').text()) === 'Matrix B'
                ? matrixB : matrixA
  matrixSecond = ($(this).parent().parent().parent().find('#matrixSecond').find(':selected').text()) === 'Matrix B'
                 ? matrixB : matrixA
  let operation = $(this).children().attr('id')
  if (operation === 'sum') {
    doSum(matrixFirst, matrixSecond)
  }
  if (operation === 'sub') {
    doSum(matrixFirst, matrixSecond, false)
  }
  if (operation === 'mult') {
    doMult(matrixFirst, matrixSecond)
  }
})
