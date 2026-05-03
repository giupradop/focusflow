import { useState } from 'react'
import { getWeekLabel, getWeekRange } from '../../utils/weekHelpers'

type UseWeekNavigationReturn = {
  weekOffset: number
  weekLabel: string
  weekStart: Date
  weekEnd: Date
  goToPrevWeek: () => void
  goToNextWeek: () => void
  goToCurrentWeek: () => void
}

export function useWeekNavigation(): UseWeekNavigationReturn {
  const [weekOffset, setWeekOffset] = useState(0)

  const { start, end } = getWeekRange(weekOffset)

  function goToPrevWeek() { setWeekOffset(prev => prev - 1) }
  function goToNextWeek() { setWeekOffset(prev => prev + 1) }
  function goToCurrentWeek() { setWeekOffset(0) }

  return {
    weekOffset,
    weekLabel: getWeekLabel(weekOffset),
    weekStart: start,
    weekEnd: end,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  }
}