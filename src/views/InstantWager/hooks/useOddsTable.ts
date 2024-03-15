/* eslint-disable no-magic-numbers */

import calendar from 'js-calendar-converter'
const isLHC = (lotteryCode: string) => {
  return lotteryCode.endsWith('LHC')
}
const RedNumList = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46]
const BlueNumList = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48]
const GreenNumList = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]

const isRed = (num: number) => RedNumList.includes(num)
const isBlue = (num: number) => BlueNumList.includes(num)
const isGreen = (num: number) => GreenNumList.includes(num)

const YearAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const MarkSixNumbers = Array(49)
  .fill(0)
  .map((_, index) => index + 1)

const getNumAnimalMap = (date: string) => {
  // utc 年
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  // 获取生肖
  const lunarJson = calendar.solar2lunar(year, month, day)
  const yearAnimal = lunarJson.Animal
  // 生肖顺序数组
  const yaIndex = YearAnimals.indexOf(yearAnimal)
  const sortAnimals = [
    yearAnimal,
    ...YearAnimals.slice(0, yaIndex).reverse(),
    ...YearAnimals.slice(yaIndex + 1).reverse()
  ]
  // console.log('sortAnimals ', sortAnimals);
  const NumAnimalMap = new Map()
  MarkSixNumbers.forEach((num) => {
    const aIndex = num % 12 || 12
    NumAnimalMap.set(num, sortAnimals[aIndex - 1])
  })
  return NumAnimalMap
}

const useOddsTable = () => {
  return {
    isLHC,
    isRed,
    isBlue,
    isGreen,
    getNumAnimalMap
  }
}

export default useOddsTable
