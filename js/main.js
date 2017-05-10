/* eslint space-infix-ops: 0, space-before-function-paren: 0, indent: 0, no-trailing-spaces: 0, no-irregular-whitespace: 0, no-eval: 0 */
/* global $ */

function addRow(path, id, row) {
  row = '<div class="d-flex flex-nowrap" id="' + id + '">'
  $(path).append(row)
}

function addColumn(path, id, value, column) {
  if (!$.isNumeric(value) || value === 0) {
    value = ''
  } else {
    value = Number(Math.round(value+'e2')+'e-2')
  }
  column = '<input type="number" class="form-control matrixListener" id="' + id +
           '" value="' + value + '" placeholder="0" style="text-align:center;">'
  if (path.includes('mTableC')) {
    column = column.replace(/"([^"]*)$/, '" readonly$1')
  }
  $(path).append(column)
}

function printedNumber(x, commas = true) {
  if (!x && x !== 0 || x === Infinity || x === -Infinity) return '∞'
  x = Number(Math.round(x+'e2')+'e-2')
  let parts = x.toString().split('.')
  if (commas) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  } else {
    return x
  }
}

function doMatrix(matrix, rows, columns) {
  for (let i = 0; i < rows; i++) {
    matrix.push([])
    for (let j = 0; j < columns; j++) {
      matrix[i].push(0)
      // matrix[i].push(Math.random()*3)
    }
  }
}

function makeTable(matrix, name) {
  $('#mTable' + name + ' table#mtrx').empty()
  matrix.forEach(function (matrix, i) {
    addRow('#mTable' + name + ' table#mtrx', i)
    matrix.forEach(function (matrix, j) {
      addColumn('#mTable' + name + ' table#mtrx' + ' div#' + i, j, matrix)
    })
  })
  sizeText(matrix, '#mTable' + name)
  toggleSolveAxis(matrix, name)
}

var matrixA = []
var matrixB = []
var matrixC = []
doMatrix(matrixA, 3, 3)
doMatrix(matrixB, 3, 3)
makeTable(matrixA, 'A')
makeTable(matrixB, 'B')
/* ******* */

function matrixSizeIs(matrix, rows = 0, condRow = '>', columns = 0, condCol = '>') {
  if (matrix[0].length >= rows && condRow === '>') {
    if (matrix.length >= columns && condCol === '>') return true
    if (matrix.length <= columns && condCol === '<') return true
    if (matrix.length === columns && condCol === '=') return true
  }
  if (matrix[0].length <= rows && condRow === '<') {
    if (matrix.length >= columns && condCol === '>') return true
    if (matrix.length <= columns && condCol === '<') return true
    if (matrix.length === columns && condCol === '=') return true
  }
  if (matrix[0].length === rows && condRow === '=') {
    if (matrix.length >= columns && condCol === '>') return true
    if (matrix.length <= columns && condCol === '<') return true
    if (matrix.length === columns && condCol === '=') return true
  }
  return false
}

function toggleSolveAxis(matrix, id) {
  id = getMatrixWithID(id, 'onlyID')
  if (matrixSizeIs(matrix, 4, '=', 3, '=')) {
    $('#mTable' + id + ' #axisSolved').removeClass('hidden-xs-up')
    solveAxis(id)
  } else {
    $('#mTable' + id + ' #axisSolved').addClass('hidden-xs-up')
  }
}

function getMatrixWithID(parentID, onlyID = false) {
  parentID = parentID.toString()
  parentID = parentID.replace(/mTable/g, '')
  if (onlyID === 'onlyID') return parentID
  if (parentID === 'A') return matrixA
  if (parentID === 'B') return matrixB
  if (parentID === 'C') return matrixC
}

function sizeText(matrix, path) {
  let matrixRows = matrix.length
  let matrixColumns = matrix[0].length
  $(path + ' h6.card-subtitle').text(matrixRows + ' × ' + matrixColumns)
}

function toggleModal(path) {
  $(path).modal('toggle')
}

function unCheck(name) {
  $(name + ' label.active').removeClass('active')
}

function doSum(mFirst, mSecond, sign = true) {
  if (mFirst.length !== mSecond.length) {
    unCheck('#matrixOperator')
    toggleModal('#noSameSize'); return
  } else if (mFirst[0].length !== mSecond[0].length) {
    unCheck('#matrixOperator')
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
  matrixC = mSolved
  makeTable(matrixC, 'C')
}

function doMult(mFirst, mSecond) {
  if (mFirst[0].length !== mSecond.length) {
    unCheck('#matrixOperator')
    toggleModal('#noEqualIntersections'); return
  }
  let mSolved = []
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
  matrixC = mSolved
  makeTable(matrixC, 'C')
}

function doMultBy(id, num, doTable = true) {
  let matrix
  if (Array.isArray(id)) {
    matrix = id
  } else {
    matrix = getMatrixWithID(id)
  }
  let mSolved = []
  for (let i = 0; i < matrix.length; i++) {
    mSolved.push([])
    for (let j = 0; j < matrix[i].length; j++) {
      mSolved[i].push(matrix[i][j] * num)
    }
  }
  matrix.splice(0, matrix.length)
  mSolved.forEach(function (element) {
    matrix.push(element)
  })
  if (doTable) {
    makeTable(matrix, id)
  } else {
    return matrix
  }
}

function doTranspose(id) {
  let matrix = getMatrixWithID(id)
  let mSolved = []
  for (let i = 0; i < matrix[0].length; i++) {
    mSolved.push([])
    for (let j = 0; j < matrix.length; j++) {
      mSolved[i].push(matrix[j][i])
    }
  }
  matrix.splice(0, matrix.length)
  mSolved.forEach(function (element) {
    matrix.push(element)
  })
  makeTable(matrix, id)
}

function doDeterminant(matrix, mSolved = []) {
  if (matrix.length > 2) {
    for (let k = 0; k < matrix.length; k++) {
      mSolved.push([])
      for (let i = 0; i < matrix.length; i++) {
        mSolved[k].push([])
        for (let j = 0; j < matrix.length; j++) {
          mSolved[k][i].push(matrix[i][j])
        }
      }
    }
    let mTemporal = []
    for (let i = 0; i < mSolved.length; i++) {
      mTemporal.push([])
      for (let j = 1; j < mSolved.length; j++) {
        mTemporal[i].push(mSolved[i][j])
      }
    }
    for (let i = 0; i < mTemporal.length; i++) {
      for (let j = 0; j < mTemporal.length-1; j++) {
        mTemporal[i][j].splice(i, 1)
      }
    }
    let mSum = 0
    let sign = -1
    for (let i = 0; i < matrix.length; i++) {
      sign *= -1
      mSum += (sign*matrix[0][i])*doDeterminant(mTemporal[i])
    }
    mSolved = mSum
  } else {
    mSolved = (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0])
  }
  mSolved = Number(Math.round(mSolved+'e3')+'e-3')
  return mSolved
}

function solveAxis(id) {
  let matrix = getMatrixWithID(id)

  let matrixS = []
  for (let i = 0; i < matrix.length; i++) {
    matrixS.push([])
    for (let j = 0; j < matrix[i].length -1; j++) {
      matrixS[i].push(matrix[i][j])
    }
  }
  let deltaS = doDeterminant(matrixS)
  $('#mTable' + id + ' #axisSolved var.s').text('∆𝑠 = ' + printedNumber(deltaS, false))

  let matrixX = []
  for (let i = 0; i < matrix.length; i++) {
    matrixX.push([])
    for (let j = 0; j < matrix[i].length; j++) {
      if (j === matrix[i].length -1) {
        matrixX[i][0] = matrix[i][j]
      } else {
        matrixX[i].push(matrix[i][j])
      }
    }
  }
  let deltaX = doDeterminant(matrixX)
  $('#mTable' + id + ' #axisSolved var.x').text('𝑥 = ' + printedNumber(deltaX / deltaS, false))

  let matrixY = []
  for (let i = 0; i < matrix.length; i++) {
    matrixY.push([])
    for (let j = 0; j < matrix[i].length; j++) {
      if (j === matrix[i].length -1) {
        matrixY[i][1] = matrix[i][j]
      } else {
        matrixY[i].push(matrix[i][j])
      }
    }
  }
  let deltaY = doDeterminant(matrixY)
  $('#mTable' + id + ' #axisSolved var.y').text('𝑦 = ' + printedNumber(deltaY / deltaS, false))

  let matrixZ = []
  for (let i = 0; i < matrix.length; i++) {
    matrixZ.push([])
    for (let j = 0; j < matrix[i].length; j++) {
      if (j === matrix[i].length -1) {
        matrixZ[i][2] = matrix[i][j]
      } else {
        matrixZ[i].push(matrix[i][j])
      }
    }
  }
  let deltaZ = doDeterminant(matrixZ)
  $('#mTable' + id + ' #axisSolved var.z').text('𝑧 = ' + printedNumber(deltaZ / deltaS, false))
}

$(document).on('click', '#tras', function () {
  let parentID = $(this).parents('.card').attr('id')
  let id = getMatrixWithID(parentID, 'onlyID')
  doTranspose(id)
  if (id === 'C') { unCheck('#matrixOperator'); return }
  doOperation()
})

$(document).on('click', '#multBy', function () {
  let parentID = $(this).parents('.card').attr('id')
  let id = getMatrixWithID(parentID, 'onlyID')
  let num = $(this).parents('.input-group').find('input').val()
          ? $(this).parents('.input-group').find('input').val() : 1
  num = eval(`(${num})`)
  doMultBy(id, num)
  toggleSolveAxis(getMatrixWithID(id), id)
  if (id === 'C') { unCheck('#matrixOperator'); return }
  doOperation()
})

$('.card-header').on({
  'mouseenter': function() {
    $(this).find('#det').tooltip('show')
  },
  'mouseleave': function() {
    $(this).find('#det').tooltip('hide')
  }
})

$(document).on('click', '#det', function () {
  $(this).tooltip('dispose')
  let parentID = $(this).parents('.card').attr('id')
  let id = getMatrixWithID(parentID, 'onlyID')
  let matrix = getMatrixWithID(id)
  if (matrix.length !== matrix[0].length) {
    toggleModal('#noSquare'); return
  }
  $(this).tooltip({title:
    '<ln> ' + printedNumber(doDeterminant(matrix)) + '</ln>'
  }).tooltip('show')
})

$(document).on('click', '#listCopies div', function () {
  let id = $(this).attr('id')
  id = id.replace(/copy/g, '')
  let inID = getMatrixWithID($(this).parents('.card').attr('id'), 'onlyID')
  if (id === inID) return
  if (inID === 'C') unCheck('#matrixOperator')
  let mCopy = getMatrixWithID(id)
  window['matrix' + inID] = mCopy
  makeTable(mCopy, inID)
  doOperation()
})

$(document).on('click', '#matrixOperator label', function () {
  unCheck('#matrixOperator')
  $(this).addClass('active')
  doOperation()
})

$(document).on('select change', '#matrixOperator select', function() {
  let parentID = $(this).parents('.card').attr('id')
  let matrix = getMatrixWithID(parentID)
  doOperation()
  toggleSolveAxis(matrix, parentID)
})

$(document).on('change keyup', '.matrixListener', function() {
  let parentID = $(this).parents('.card').attr('id')
  let matrix = getMatrixWithID(parentID)
  let column = $(this).parent().attr('id')
  let row = $(this).attr('id')
  let value = parseFloat($(this).val()) ? parseFloat($(this).val()) : 0
  matrix[column][row] = value
  doOperation()
  sizeText(matrix, '#' + parentID)
  toggleSolveAxis(matrix, parentID)
})

$(document).on('click', '#rows #sum', function(matrix) {
  let parentID = $(this).parents('.card').attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix.length === 12) return
  addRow('#' + parentID + ' table#mtrx', matrix.length)
  let newRow = []
  matrix[0].forEach(function (element, idx) {
    addColumn('#' + parentID + ' table#mtrx div#' + matrix.length, idx)
    newRow.push(0)
  })
  matrix.push(newRow)
  sizeText(matrix, '#' + parentID)
  doOperation()
  toggleSolveAxis(matrix, parentID)
})

$(document).on('click', '#rows #sub', function(matrix) {
  let parentID = $(this).parents('.card').attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix.length === 1) return
  $('#' + parentID + ' table#mtrx div#' + (matrix.length-1)).fadeOut(100, function() {
    $(this).remove()
  })
  matrix.pop()
  sizeText(matrix, '#' + parentID)
  doOperation()
  toggleSolveAxis(matrix, parentID)
})

$(document).on('click', '#columns #sum', function(matrix) {
  let parentID = $(this).parents('.card').attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix[0].length === 12) return
  $('#' + parentID + ' table#mtrx div').each(function(idx) {
    addColumn('#' + parentID + ' table#mtrx div#' + idx, matrix[0].length)
  })
  matrix.forEach(function (mtx) {
    mtx.push(0)
  })
  sizeText(matrix, '#' + parentID)
  doOperation()
  parentID = parentID.replace(/mTable/g, '')
  toggleSolveAxis(matrix, parentID)
})

$(document).on('click', '#columns #sub', function(matrix) {
  let parentID = $(this).parents('.card').attr('id')
  matrix = getMatrixWithID(parentID)
  if (matrix[0].length === 1) return
  $('#' + parentID + ' table#mtrx div').each(function(idx, element) {
    $(element).children().last().fadeOut(100, function() {
      $(this).remove()
    })
  })
  matrix.forEach(function (mtx) {
    mtx.pop()
  })
  sizeText(matrix, '#' + parentID)
  doOperation()
  parentID = parentID.replace(/mTable/g, '')
  toggleSolveAxis(matrix, parentID)
})

doOperation()
function doOperation(matrixFirst, matrixSecond) {
  matrixFirst = ($('#matrixFirst').find(':selected').text()) === 'Matrix B'
                ? matrixB : matrixA
  matrixSecond = ($('#matrixSecond').find(':selected').text()) === 'Matrix B'
                 ? matrixB : matrixA
  let operation = $('#operation').find('.active').attr('id')
  if (operation === 'sum') {
    doSum(matrixFirst, matrixSecond)
  }
  if (operation === 'sub') {
    doSum(matrixFirst, matrixSecond, false)
  }
  if (operation === 'mult') {
    doMult(matrixFirst, matrixSecond)
  }
}
