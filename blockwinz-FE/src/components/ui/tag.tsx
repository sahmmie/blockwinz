import { Tag as ChakraTag } from "@chakra-ui/react"
import * as React from "react"

export interface TagProps extends ChakraTag.RootProps {
  startElement?: React.ReactNode
  endElement?: React.ReactNode
  onClose?: VoidFunction
  closable?: boolean
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  function Tag(props, ref) {
    const {
      startElement,
      endElement,
      onClose,
      closable = !!onClose,
      children,
      ...rest
    } = props

    return (
      <ChakraTag.Root ref={ref} {...rest} borderRadius={'8px'}>
        {startElement && (
          <ChakraTag.StartElement>{startElement}</ChakraTag.StartElement>
        )}
        <ChakraTag.Label fontWeight={'500'}>{children}</ChakraTag.Label>
        {endElement && (
          <ChakraTag.EndElement>{endElement}</ChakraTag.EndElement>
        )}
        {closable && (
          <ChakraTag.EndElement>
            <ChakraTag.CloseTrigger onClick={onClose} />
          </ChakraTag.EndElement>
        )}
      </ChakraTag.Root>
    )
  },
)
