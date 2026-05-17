export function calculateResult(marks: number) {
  let division = '3RD'
  let discount = 0
  let feePerMonth = 1200 // Base fee from JPG

  if (marks >= 91) {
    division = '1ST'
    discount = 150
    feePerMonth = 0
  } else if (marks >= 81) {
    division = '1ST'
    discount = 100
    feePerMonth = 0
  } else if (marks >= 71) {
    division = '1ST'
    discount = 75
    feePerMonth = 350
  } else if (marks >= 61) {
    division = '1ST'
    discount = 70
    feePerMonth = 400
  } else if (marks >= 41) {
    division = '2ND'
    discount = 65
    feePerMonth = 450
  } else if (marks >= 21) {
    division = '3RD'
    discount = 60
    feePerMonth = 500
  } else if (marks >= 1) {
    division = '3RD'
    discount = 50
    feePerMonth = 600
  } else {
    division = 'FAIL'
    discount = 0
    feePerMonth = 1200
  }

  return {
    division,
    discount,
    feePerMonth,
  }
}
