import { useEffect, useRef, forwardRef } from 'react'
import { Flex } from '@chakra-ui/react'
import useChat from '@/hooks/useChat'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useGameControlsContext } from '../../hooks/gameControlsContext'

/** Matches Layout chat rail `transition='width 0.3s ease'` plus one frame. */
const CHAT_LAYOUT_SETTLE_MS = 320

const RenderComponent = forwardRef((_, ref) => {
  const { gameRendererInited, gameRendererRef } = useGameControlsContext()
  const chatIsOpen = useChat(s => s.chatIsOpen)
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const prevChatOpen = useRef(chatIsOpen)
  const layoutGen = useRef(0)

  useEffect(() => {
    if (ref && typeof ref === 'object' && ref !== null) {
      ref.current = containerRef.current
    }
  }, [ref])

  useEffect(() => {
    if (!containerRef.current || !gameRendererRef.current || !gameRendererInited) return

    const chatChanged = prevChatOpen.current !== chatIsOpen
    prevChatOpen.current = chatIsOpen

    // Mobile chat is a drawer; main column width does not change — skip expensive Pixi rebuild.
    if (chatChanged && isMobile) return

    layoutGen.current += 1
    const gen = layoutGen.current

    const delay = chatChanged && !isMobile ? CHAT_LAYOUT_SETTLE_MS : 0

    const timer = window.setTimeout(() => {
      if (gen !== layoutGen.current) return
      const el = containerRef.current
      const renderer = gameRendererRef.current
      if (!el || !renderer) return
      void renderer.recreatePixiForContainer(el)
    }, delay)

    return () => clearTimeout(timer)
  }, [gameRendererInited, chatIsOpen, isMobile])

  return (
    <Flex
      w='100%'
      h='100%'
      minW={0}
      justifyContent={'center'}
      alignItems={'center'}
      ref={containerRef}
    />
  )
})

export default RenderComponent
