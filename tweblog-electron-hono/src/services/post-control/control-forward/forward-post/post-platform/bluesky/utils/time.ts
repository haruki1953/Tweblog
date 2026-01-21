export const isDateExpired = (date: Date, seconds: number): boolean => {
  const now = new Date()
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000
  return diffInSeconds > seconds
}
