const validCharList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']

export const filterValidNumChar = (value: string) => {
  return [...`${value.trim() || ''}`].filter((char) => validCharList.includes(char))
}

export const removeBeginningZero = (value: string) => {
  return value.replace(/^0(?=[\d,]+)/, '')
}

const defaultPrecision = 2

export const formatPrecision = (
  charList: string | string[],
  precision: number = defaultPrecision
) => {
  let list = [...charList]
  const offset = precision + 1
  const dotIndex = list.findIndex((char) => char === '.')
  if (dotIndex > -1) {
    list = list.slice(0, dotIndex + offset)
  }
  return list
}
