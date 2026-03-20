import { createSystem, defaultBaseConfig, defineConfig } from "@chakra-ui/react"
import colors from "./colors"

const customConfig = defineConfig({
    theme: {
        semanticTokens: {
            colors: colors
        },
        tokens: {
            colors: { colors },
        },
        breakpoints: {
            sm: "400px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1536px",
        },
        keyframes: {
            scaleUp: {
                from: { transform: "scale(0)" },
                to: { transform: "scale(1)" },
            }
        },
    },
    globalCss: {
        body: {
            bg: 'colors.brand.default',
            fontFamily: 'Poppins',
            color: '#ECF0F1',
            height: '100%',
        },
        'input, textarea, select': {
            fontSize: '16px', // Prevent iOS zoom
        },
        html: {
            scrollbarWidth: 'thin',
            scrollbarColor: '#54546399 transparent',
        },
        'html::-webkit-scrollbar': {
            width: '2px',
        },
        'html::-webkit-scrollbar-track': {
            background: 'transparent',
        },
        'html::-webkit-scrollbar-thumb': {
            backgroundColor: '#54546399',
            borderRadius: '2px',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
        },
    },
})

export const system = createSystem(defaultBaseConfig, customConfig)