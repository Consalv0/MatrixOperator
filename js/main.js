/* eslint space-infix-ops: 0, space-before-function-paren: 0, indent: 0, no-trailing-spaces: 0, no-irregular-whitespace: 0, no-eval: 0 */
/* global $ Vue */

Vue.component('card', {
  template: '#cardTemplate',
  props: {
    name: {
      type: String,
      required: true
    },
    matrix: Array
  },
  methods: {
    doTable: function (matrix = this.matrix, name = this.name) {
      $('#' + name + ' table#mtrx').empty()
      let element = this
      matrix.forEach(function (matrix, i) {
        element.addRow('#' + name + ' table#mtrx', i)
        matrix.forEach(function (matrix, j) {
          element.addColumn('#' + name + ' table#mtrx' + ' div#' + i, j, matrix)
        })
      })
      sizeText(matrix, '#' + name)
      this.triggerSolveAxis()
    },

    addRow: function (path, id, row) {
      row = '<div class="d-flex flex-nowrap" id="' + id + '">'
      $(path).append(row)
    },

    updateCell: function (target, matrix = this.matrix, name = this.name) {
      let val = target.value
      let value = parseFloat(val) ? parseFloat(val) : 0
      matrix[target.parentElement.id][target.id] = value
      this.doOperation()
      sizeText(matrix, '#' + name)
      this.triggerSolveAxis()
    },

    addColumn: function (path, id, value, column) {
      if (!$.isNumeric(value) || value === 0) {
        value = ''
      } else {
        value = Number(Math.round(value+'e2')+'e-2')
      }
      column = '<input type="number" class="form-control matrixListener" id="' + id +
               '" value="' + value + '" placeholder="0" style="text-align:center;">'
      if (path.includes('C')) {
        column = column.replace(/"([^"]*)$/, '" readonly$1')
      }
      $(path).append(column)
    },

    sumRow: function (sum, matrix = this.matrix, name = this.name) {
      if (sum) {
        if (matrix.length === 10) return
        this.addRow('#' + name + ' table#mtrx', matrix.length)
        let newRow = []
        for (var i = 0; i < matrix[0].length; i++) {
          this.addColumn('#' + name + ' table#mtrx div#' + matrix.length, i)
          newRow.push(0)
        }
        matrix.push(newRow)
      } else {
        if (matrix.length === 1) return
        $('#' + name + ' table#mtrx div#' + (matrix.length-1)).fadeOut(100, function() {
          $(this).remove()
        })
        matrix.pop()
      }
      sizeText(matrix, '#' + name)
      this.doOperation()
      this.triggerSolveAxis()
    },

    sumColumns: function (sum, matrix = this.matrix, name = this.name) {
      let element = this
      if (sum) {
        if (matrix[0].length === 10) return
        $('#' + name + ' table#mtrx div').each(function(idx) {
          element.addColumn('#' + name + ' table#mtrx div#' + idx, matrix[0].length)
        })
        matrix.forEach(function (mtx) {
          mtx.push(0)
        })
      } else {
        if (matrix[0].length === 1) return
        $('#' + name + ' table#mtrx div').each(function(idx, element) {
          $(element).children().last().fadeOut(100, function() {
            $(this).remove()
          })
        })
        matrix.forEach(function (mtx) {
          mtx.pop()
        })
      }
      sizeText(matrix, '#' + name)
      this.doOperation()
      this.triggerSolveAxis()
    },

    doDetTooltip: function (target, matrix = this.matrix, name = this.name) {
      $(target).tooltip('dispose')
      if (matrix.length !== matrix[0].length) {
        $('#' + modals.modals[3].name).modal('toggle'); return
      }
      $(target).tooltip({title:
        '<ln> ' + printedNumber(this.doDeterminant()) + '</ln>'
      }).tooltip('show')
    },

    getNum: function (target) {
      let num = $(target).parents('.input-group').find('input').val()
              ? $(target).parents('.input-group').find('input').val() : 1
      num = eval(`(${num})`)
      return num
    },

    doMultBy: function(num, matrix = this.matrix, name = this.name, table = true) {
      if (!$.isNumeric(num)) {
        num = this.getNum(num)
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
      if (table) {
        if (name === 'C') { unCheck('#matrixOperator'); return }
        this.doTable()
        this.doOperation()
      }
      return matrix
    },

    doTranspose: function (matrix = this.matrix, table = true) {
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
      if (table) this.doTable()
      return matrix
    },

    doInverse: function (matrix = this.matrix, name = this.name) {
      let det = this.doDeterminant(matrix)
      if (isNaN(det)) {
        $('#' + modals.modals[3].name).modal('toggle'); return
      } else if (det === 0) {
        $('#' + modals.modals[0].name).modal('toggle'); return
      }
      let mCofact = this.doCofactor(matrix)
      mCofact = this.doTranspose(mCofact, false)
      mCofact = this.doMultBy(1/det, mCofact, name, false)

      mCofact = mCofact.length === 1 ? [[1]] : mCofact
      for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
          matrix[i][j] = mCofact[i][j]
        }
      }
      this.doTable()
    },

    doCofactor: function (matrix = this.matrix) {
      let mCofact = []
      if (matrix.length === 1) {
        mCofact = [[1]]
        return mCofact
      }

      if (matrix.length === 2) {
        mCofact = [[matrix[1][1], -matrix[1][0]], [-matrix[0][1], matrix[0][0]]]
        return mCofact
      }

      for (let k = 0; k < matrix.length**2; k++) {
        mCofact.push([])
        for (let i = 0; i < matrix.length; i++) {
          mCofact[k].push([])
          for (let j = 0; j < matrix.length; j++) {
            mCofact[k][i].push(matrix[i][j])
          }
        }
      }

      let mTemporal = []
      for (let i = 0; i < mCofact.length; i++) {
        mTemporal.push([])
        for (let j = 0; j < matrix.length; j++) {
          mTemporal[i].push(mCofact[i][j])
        }
      }
      for (let i = 0; i < mCofact.length; i++) {
        for (let j = 0; j < mCofact[i].length; j++) {
          mTemporal[i][j].splice(i-matrix.length * Math.floor(i/matrix.length), 1)
        }
      }
      mTemporal = []
      for (let i = 0; i < matrix.length**2; i++) {
        mTemporal.push([])
        for (let j = 0; j < matrix.length; j++) {
          if (j === Math.floor(i/matrix.length)) continue
          mTemporal[i].push(mCofact[i][j])
        }
      }
      for (let i = 0; i < mTemporal.length; i++) {
        mTemporal[i] = this.doDeterminant(mTemporal[i])
      }

      let mMinors = []
      let sign = (matrix.length % 2) ? -1 : 1
      for (let i = 0; i < matrix.length; i++) {
        sign *= (matrix.length % 2) ? 1 : -1
        mMinors.push([])
        for (let j = 0; j < matrix.length; j++) {
          sign *= -1
          mMinors[i].push(sign * mTemporal[j + matrix.length*i])
        }
      }

      mCofact = mMinors
      return mCofact
    },

    doDeterminant: function (matrix = this.matrix) {
      if (matrix.length !== matrix[0].length) return NaN
      let mSolved = []
      if (matrix.length === 1) {
        mSolved = matrix[0][0]
        return mSolved
      }
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
          mSum += (sign * matrix[0][i]) * this.doDeterminant(mTemporal[i])
        }
        mSolved = mSum
      } else {
        mSolved = (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0])
      }
      return mSolved
    },

    triggerSolveAxis: function (matrix = this.matrix, name = this.name) {
      if (this.matrixSizeIs(matrix, 3, '=', 4, '=')) {
        $('#' + name + ' #axisSolved var.z').removeClass('hidden-xs-up')
        $('#' + name + ' #axisSolved').removeClass('hidden-xs-up')
        this.solveAxis()
      } else {
        $('#' + name + ' #axisSolved').addClass('hidden-xs-up')
      }

      if (this.matrixSizeIs(matrix, 2, '=', 3, '=')) {
        $('#' + name + ' #axisSolved var.z').addClass('hidden-xs-up')
        $('#' + name + ' #axisSolved').removeClass('hidden-xs-up')
        this.solveAxis()
      }
    },

    solveAxis: function(matrix = this.matrix, name = this.name) {
      let matrixS = []
      for (let i = 0; i < matrix.length; i++) {
        matrixS.push([])
        for (let j = 0; j < matrix[i].length -1; j++) {
          matrixS[i].push(matrix[i][j])
        }
      }
      let deltaS = this.doDeterminant(matrixS)
      $('#' + name + ' #axisSolved var.s').text('∆s = ' + printedNumber(deltaS, false))

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
      let deltaX = this.doDeterminant(matrixX)
      $('#' + name + ' #axisSolved var.x').text('x = ' + printedNumber(deltaX / deltaS, false))

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
      let deltaY = this.doDeterminant(matrixY)
      $('#' + name + ' #axisSolved var.y').text('y = ' + printedNumber(deltaY / deltaS, false))

      if (matrix.length === 2) return
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
      let deltaZ = this.doDeterminant(matrixZ)
      $('#' + name + ' #axisSolved var.z').text('z = ' + printedNumber(deltaZ / deltaS, false))
    },

    matrixSizeIs: function (matrix = this.matrix, rows = 0, condRow = '>', columns = 0, condCol = '>') {
      if (matrix.length >= rows && condRow === '>') {
        if (matrix[0].length >= columns && condCol === '>') return true
        if (matrix[0].length <= columns && condCol === '<') return true
        if (matrix[0].length === columns && condCol === '=') return true
      }
      if (matrix.length <= rows && condRow === '<') {
        if (matrix[0].length >= columns && condCol === '>') return true
        if (matrix[0].length <= columns && condCol === '<') return true
        if (matrix[0].length === columns && condCol === '=') return true
      }
      if (matrix.length === rows && condRow === '=') {
        if (matrix[0].length >= columns && condCol === '>') return true
        if (matrix[0].length <= columns && condCol === '<') return true
        if (matrix[0].length === columns && condCol === '=') return true
      }
      return false
    },

    doOperation: function () {

    }
  },
  mounted() {
    doMatrix(this.matrix, 3, 3)
    this.doTable()
  }
})

var table = new Vue({
  el: 'cards',
  data: {
    cards: [
      { name: 'A', matrix: [] },
      { name: 'B', matrix: [] }
    ]
  }
})

var namesInUse = ['A', 'B', 'C']

function printedNumber(number, commas = true) {
  if (!number && number !== 0 || number === Infinity || number === -Infinity) return '∞'
  number = Number(Math.round(number+'e2')+'e-2')
  let parts = number.toString().split('.')
  if (commas) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  } else {
    return number
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

var matrixC = []

function getMatrixWithID(parentID, onlyID = false) {
  parentID = parentID.toString()
  if (onlyID === 'onlyID') return parentID
  if (parentID === 'C') return matrixC
}

function sizeText(matrix, path) {
  let matrixRows = matrix.length
  let matrixColumns = matrix[0].length
  $(path + ' h6.card-subtitle').text(matrixRows + ' × ' + matrixColumns)
}

function unCheck(name) {
  $(name + ' label.active').removeClass('active')
}

function doSum(mFirst, mSecond, sign = true) {
  if (mFirst.length !== mSecond.length) {
    unCheck('#matrixOperator')
    // toggleModal('#noSameSize'); return
  } else if (mFirst[0].length !== mSecond[0].length) {
    unCheck('#matrixOperator')
    // toggleModal('#noSameSize'); return
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
  // makeTable(matrixC, 'C')
}

function doMult(mFirst, mSecond) {
  if (mFirst[0].length !== mSecond.length) {
    unCheck('#matrixOperator')
    // toggleModal('#noEqualIntersections'); return
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
  // makeTable(matrixC, 'C')
}

function findName(name) {
  for (var i = 0; i < namesInUse.length; i++) {
    if (namesInUse[i] === name) return false
  }
  return name
}

$(document).on('click', '#createCard', function () {
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  for (var i = 0; i < letters.length; i++) {
    if (findName(letters[i])) {
      table.cards.push({name: letters[i], matrix: []})
      namesInUse.push(letters[i])
      return
    }
  }
})

$('.card-header').on({
  'mouseenter': function() {
    $(this).find('#det').tooltip('show')
  },
  'mouseleave': function() {
    $(this).find('#det').tooltip('hide')
  }
})

$(document).on('click', '#listCopies div', function () {
  let id = $(this).attr('id')
  id = id.replace(/copy/g, '')
  let inID = getMatrixWithID($(this).parents('.card').attr('id'), 'onlyID')
  if (id === inID) return
  if (inID === 'C') unCheck('#matrixOperator')

  let mCopy = getMatrixWithID(id)
  let mPaste = []
  for (let i = 0; i < mCopy.length; i++) {
    mPaste.push([])
    for (let j = 0; j < mCopy[0].length; j++) {
      mPaste[i].push([])
      mPaste[i][j] = mCopy[i][j]
    }
  }
  window['matrix' + inID] = mPaste
  // makeTable(mPaste, inID)
  doOperation()
})

$(document).on('click', '#matrixOperator label', function () {
  unCheck('#matrixOperator')
  $(this).addClass('active')
  doOperation()
})

function doOperation(matrixFirst, matrixSecond) {
  // matrixFirst = ($('#matrixFirst').find(':selected').text()) === 'Matrix B'
  //               ? matrixB : matrixA
  // matrixSecond = ($('#matrixSecond').find(':selected').text()) === 'Matrix B'
  //                ? matrixB : matrixA
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

Vue.component('modal', {
  template: '#modalTemplate',
  props: {
    name: String,
    alert: Array,
    message: String
  },
  computed: {
    upperCaseAlert: function () {
      let text = this.alert.toUpperCase()
      return text
    }
  }
})

// eslint-disable-next-line
var modals = new Vue({
  el: 'modals',
  data: {
    modals: [
      { name: 'isSingular', alert: 'warning', message: 'The matrix is&nbsp<strong>singular</strong><ln>&nbspand cannot be operated.</ln>' },
      { name: 'noSameSize', alert: 'warning', message: 'The matrices must have an&nbsp<strong>equal number of rows and columns</strong><ln>&nbspto be operated.</ln>' },
      { name: 'notEqual', alert: 'warning', message: 'The &nbsp<strong>number of columns in A must be equal to the number of rows in B</strong><ln>&nbspto be operated.</ln>' },
      { name: 'noSquare', alert: 'warning', message: 'The matrix must be&nbsp<strong>square</strong><ln>&nbspto be operated.</ln>' }
    ]
  }
})
