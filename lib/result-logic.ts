export function calculateResult(marks: number) {
  let division = '3RD'
  let discount = 0
  let feePerMonth = 1400

  if (marks >= 81) {
    division = '1ST'
    discount = 100
    feePerMonth = 0
  } else if (marks >= 61) {
    division = '1ST'
    discount = 80
    feePerMonth = 200
  } else if (marks >= 41) {
    division = '2ND'
    discount = 65
    feePerMonth = 450 // As per PRIYANKA.pdf (48 marks)
  } else if (marks >= 21) {
    division = '3RD'
    discount = 60
    feePerMonth = 500 // As per user instruction
  } else if (marks >= 1) {
    division = '3RD'
    discount = 50
    feePerMonth = 600 // As per user instruction
  } else {
    division = 'FAIL'
    discount = 0
    feePerMonth = 1400
  }

  return {
    division,
    discount,
    feePerMonth,
  }
}
