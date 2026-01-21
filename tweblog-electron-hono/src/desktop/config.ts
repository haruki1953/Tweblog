// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { httpPort } from '@/configs'
import path from 'node:path'

// electron专用前端所在位置，生产环境下是由后端托管的
// 端口重复会刷新端口，所以注意不能直接拼接，需要是一个函数，在使用时拼接（此时端口初始化完毕）
export const getUrlIndexHtml = () => `http://127.0.0.1:${httpPort}/desktop/`

// // 开发时用的是vite提供的
// export const getUrlIndexHtml = () => 'http://localhost:5173/desktop/'

// 虽然本目录下是ts，但编译后是js，应该写.js
export const pathPreloadJs = path.join(__dirname, './preload.js')

// 窗口图标使用多尺寸ico最好
export const pathIconIco = path.join(__dirname, '../../assets/icon.ico')
// 托盘用多尺寸ico会模糊，直接用图片吧
export const pathIconPng = path.join(__dirname, '../../assets/icon.png')

export const desktopConfig = {
  width: 1280,
  height: 720,
  // 屏幕小于宽或高时，宽高的算法，val是屏幕宽或高的值
  screenLtWidthCalc: (val: number) => { return val - 100 },
  screenLtHeightCalc: (val: number) => { return val - 100 },
  minWidth: 500,
  minHeight: 400,
  trayTitle: 'Tweblog',
  trayToolTip: 'Tweblog',
  trayShowLable: '打开 Tweblog',
  trayQuitLable: '退出 Tweblog'
} as const

// 是否打开开发工具
// export const enableDevTools = true
export const enableDevTools = false
