export function calculateResult(marks: number) {
  let division = '3RD'
  let discount = 50
  let feePerMonth = 700

  // Fallback default base fee
  const BASE_FEE = 1400

  if (marks >= 60) {
    division = '1ST'
    discount = 80
    feePerMonth = 200 // Subsidized heavily for 1st div
  } else if (marks >= 40) {
    division = '2ND'
    discount = 65
    feePerMonth = 450 // As per PRIYANKA.pdf
  } else if (marks >= 1) {
    division = '3RD'
    discount = 50 // As per user prompt (1-20 get 50%)
    feePerMonth = 700 
  } else {
    // 0 marks
    division = 'FAIL'
    discount = 0
    feePerMonth = BASE_FEE
  }

  return {
    division,
    discount,
    feePerMonth,
  }
}
