import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { IconCheck, IconDownload } from '@tabler/icons-react'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Spinner } from './ui/spinner'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useSettingsStore } from '@renderer/stores/settings-store'

type YtdlpFfmpegConfirmModalProps = {
  open: boolean
  onOpenChange: () => void
}

type ConfirmYtdlpProps = {
  isYtdlpConfirmLoading: boolean
  isYtdlpPresentInPc: boolean
  setIsYtdlpPresentInPc: Dispatch<SetStateAction<boolean>>
}

type ConfirmFfmpegProps = {
  isFfmpegConfirmLoading: boolean
  isFfmpegPresentInPc: boolean
}

const ConfirmYtdlp = ({
  isYtdlpConfirmLoading,
  isYtdlpPresentInPc,
  setIsYtdlpPresentInPc
}: ConfirmYtdlpProps) => {
  const ytdlpVersion = useSettingsStore((state) => state.ytdlpVersion)
  const [downloadingYtdlp, setDownloadingYtdlp] = useState(false)

  function handleYtdlpDownload() {
    setDownloadingYtdlp(true)
    window.api.downloadYtdlp().then(({ ytdlpPathInPc, ytdlpVersionInPc }) => {
      if (ytdlpPathInPc && ytdlpVersionInPc) {
        useSettingsStore.setState({ ytdlpVersion: ytdlpVersionInPc, ytdlpPath: ytdlpPathInPc })
        setDownloadingYtdlp(false)
        setIsYtdlpPresentInPc(true)
      } else {
        setIsYtdlpPresentInPc(false)
      }
    })
  }
  return (
    <div className="w-full flex justify-between items-center">
      <div className="left flex flex-col gap-1">
        <span className="text-sm">yt-dlp</span>
        <Badge className="text-xs">
          Version: {isYtdlpPresentInPc ? ytdlpVersion : 'Not Found'}
        </Badge>
      </div>
      <div className="right">
        {isYtdlpConfirmLoading ? (
          <Spinner />
        ) : isYtdlpPresentInPc ? (
          <IconCheck />
        ) : (
          <Button onClick={handleYtdlpDownload} disabled={downloadingYtdlp}>
            {downloadingYtdlp ? <Spinner /> : <IconDownload />}
          </Button>
        )}
      </div>
    </div>
  )
}

const ConfirmFfmpeg = ({ isFfmpegConfirmLoading, isFfmpegPresentInPc }: ConfirmFfmpegProps) => {
  const ffmpegVersion = useSettingsStore((state) => state.ffmpegVersion)
  return (
    <div className="w-full flex justify-between items-center">
      <div className="left flex flex-col gap-1">
        <span className="text-sm">ffmpeg</span>
        <Badge className="text-xs">
          Version: {isFfmpegPresentInPc ? ffmpegVersion : 'Not Found'}
        </Badge>
      </div>
      <div className="right">
        {isFfmpegConfirmLoading ? (
          <Spinner />
        ) : isFfmpegPresentInPc ? (
          <IconCheck />
        ) : (
          <Button>
            <IconDownload />
          </Button>
        )}
      </div>
    </div>
  )
}

const YtdlpFfmpegConfirmModal = ({ open, onOpenChange }: YtdlpFfmpegConfirmModalProps) => {
  const [isYtdlpPresentInPc, setIsYtdlpPresentInPc] = useState(false)
  const [isFfmpegPresentInPc, setIsFfmpegPresentInPc] = useState(false)
  const [isYtdlpConfirmLoading, setIsYtdlpConfirmLoading] = useState(true)
  const [isFfmpegConfirmLoading, setIsFfmpegConfirmLoading] = useState(true)
  const ytdlpVersion = useSettingsStore((state) => state.ytdlpVersion)
  const ytdlpPath = useSettingsStore((state) => state.ytdlpPath)
  const ffmpegVersion = useSettingsStore((state) => state.ffmpegVersion)
  const ffmpegPath = useSettingsStore((state) => state.ffmpegPath)

  console.log({ ytdlpPath, ytdlpVersion, ffmpegPath, ffmpegVersion })

  useEffect(() => {
    if (ytdlpVersion && ytdlpPath) {
      setIsYtdlpPresentInPc(true)
      setIsYtdlpConfirmLoading(false)
      return
    }
    window.api.confirmYtdlp().then(({ ytdlpPathInPc, ytdlpVersionInPc }) => {
      if (ytdlpPathInPc && ytdlpVersionInPc) {
        setIsYtdlpPresentInPc(true)
        useSettingsStore.setState({ ytdlpPath: ytdlpPathInPc, ytdlpVersion: ytdlpVersionInPc })
      } else {
        setIsYtdlpPresentInPc(false)
      }
      setIsYtdlpConfirmLoading(false)
    })
  }, [])

  useEffect(() => {
    if (ffmpegVersion && ffmpegPath) {
      setIsFfmpegPresentInPc(true)
      setIsFfmpegConfirmLoading(false)
      return
    }
    window.api.confirmFfmpeg().then(({ ffmpegPathInPc, ffmpegVersionInPc }) => {
      if (ffmpegPathInPc && ffmpegVersionInPc) {
        setIsFfmpegPresentInPc(true)
        useSettingsStore.setState({ ffmpegPath: ffmpegPathInPc, ffmpegVersion: ffmpegVersionInPc })
      } else {
        setIsFfmpegPresentInPc(false)
      }
      setIsFfmpegConfirmLoading(false)
    })
  }, [])

  const disableContinue =
    isYtdlpConfirmLoading ||
    isFfmpegConfirmLoading ||
    ytdlpVersion.length === 0 ||
    ffmpegVersion.length === 0

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Checking yt-dlp and ffmpeg</AlertDialogTitle>
            <AlertDialogDescription>
              Checking yt-dlp and ffmpeg existence in your PC
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div id="yt-dlp-ffmpeg-confirm" className="flex flex-col">
            <ConfirmYtdlp
              isYtdlpConfirmLoading={isYtdlpConfirmLoading}
              isYtdlpPresentInPc={isYtdlpPresentInPc}
              setIsYtdlpPresentInPc={setIsYtdlpPresentInPc}
            />
            <hr className="w-full m-2 my-4" />
            <ConfirmFfmpeg
              isFfmpegConfirmLoading={isFfmpegConfirmLoading}
              isFfmpegPresentInPc={isFfmpegPresentInPc}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction disabled={disableContinue}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default YtdlpFfmpegConfirmModal
