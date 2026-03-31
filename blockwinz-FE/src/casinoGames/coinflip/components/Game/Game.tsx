import React, { useRef } from 'react'
import { Box } from '@chakra-ui/react'
import RenderComponent from '../Renderer/RenderComponent'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useHotKeys } from '../../hooks/useHotKeys'
import { PreviousResults } from '../PreviousResults/PreviousResults'

const Game: React.FC = () => {
    const isMobile = useIsMobile()
    const rendererRef = useRef<HTMLDivElement>(null)

    useHotKeys()

    return (
        <Box
            h={'100%'}
            py={isMobile ? 0 : 16}
            px={8}
            position='relative'
            overflow='hidden'
            display={'flex'}
            flexDir={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            className='renderboxer'
            marginBottom={isMobile ? '16px' : '0'}
            minH={isMobile ? '0px' : '795px'}
        >
            <Box
                className='renderbox'
                position='relative'
                width='100%'
                minW={0}
                h='100%'
                aspectRatio={4 / 3}>
                <RenderComponent ref={rendererRef} />
                <PreviousResults />
            </Box>
        </Box>
    )
}

export default Game
