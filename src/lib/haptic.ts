export const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof window === 'undefined') return
  
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export const hapticPatterns = {
  light: 10,
  medium: 50,
  strong: 100,
  double: [50, 100, 50],
  success: [30, 50, 30, 50, 100],
  error: [100, 50, 100],
  ping: [20, 40, 80]
}
