import { useBreakpointValue } from '@chakra-ui/react'

export const useIsMobile = (withTablet?: boolean): boolean | undefined => {
  return useBreakpointValue({ base: true, md: withTablet ? true : false, lg: false })
}

export const useNavbarHeight = (): number => {
  const isMobile = useIsMobile();
  return isMobile ? 60 : 90
}