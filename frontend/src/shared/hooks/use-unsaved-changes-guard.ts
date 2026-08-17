import { useCallback, useEffect, useState } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router'

export function useUnsavedChangesGuard(shouldBlock: boolean) {
  const blocker = useBlocker(shouldBlock)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (blocker.state === 'blocked') setIsDialogOpen(true)
  }, [blocker.state])

  const stay = useCallback(() => {
    setIsDialogOpen(false)

    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  const leave = useCallback(() => {
    setIsDialogOpen(false)

    if (blocker.state === 'blocked') blocker.proceed()
  }, [blocker])

  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsDialogOpen(true)
        return
      }

      stay()
    },
    [stay],
  )

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!shouldBlock) return

        event.preventDefault()
        event.returnValue = ''
      },
      [shouldBlock],
    ),
    { capture: true },
  )

  return {
    handleDialogChange,
    isDialogOpen,
    leave,
    stay,
  }
}
