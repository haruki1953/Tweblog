export interface DesktopAPI {
  node: () => string
  chrome: () => string
  electron: () => string
  generateTokenAdmin: () => Promise<string>
  httpPortIcp: () => Promise<number>
}

declare global {
  interface Window {
    desktopAPI: DesktopAPI
  }
}
