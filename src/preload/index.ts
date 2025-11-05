import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import log from 'electron-log'

// Custom APIs for renderer
const api = {
  rendererInit: () => ipcRenderer.invoke('renderer:init'),
  confirmYtdlp: () => ipcRenderer.invoke('yt-dlp:confirm'),
  confirmFfmpeg: () => ipcRenderer.invoke('ffmpeg:confirm'),
  downloadYtdlp: () => ipcRenderer.invoke('yt-dlp:download')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    log.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
