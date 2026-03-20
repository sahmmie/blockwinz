import { useEffect, useRef, forwardRef } from 'react'
import { Flex } from '@chakra-ui/react'
import { useGameControlsContext } from '../../hooks/gameControlsContext'

const RenderComponent = forwardRef((_, ref) => {
  const { gameRendererInited, gameRendererRef } = useGameControlsContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const isInitting = useRef<boolean>(false)

  useEffect(() => {
    if (ref && typeof ref === 'object' && ref !== null) {
      ref.current = containerRef.current
    }
  }, [ref])

  useEffect(() => {
    if (!containerRef.current || isInitting.current || !gameRendererInited) return
    isInitting.current = true
    gameRendererRef.current?.setContainer(containerRef.current).then(() => {
      isInitting.current = false
    })
  }, [gameRendererInited])

  return (
    <Flex w='100%' h='100%' justifyContent={'center'} alignItems={'center'} ref={containerRef} />
  )
})

export default RenderComponent
