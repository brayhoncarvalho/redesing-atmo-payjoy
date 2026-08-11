import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const DefaultTheme = definePreset(Aura, {
  primitive: {
    movistarBlue: {
      50:  '#e0f3fe',
      100: '#b3e1fc',
      200: '#80cef9',
      300: '#4dbaf7',
      400: '#1aa7f5',
      500: '#019df4',
      600: '#0186da',
      700: '#016dbd',
      800: '#01549f',
      900: '#013b82',
      950: '#012a6e',
    },
    payjoyGreen: {
      50:  '#f0fce8',
      100: '#d9f7c0',
      200: '#b8ef8a',
      300: '#8de252',
      400: '#6dd029',
      500: '#5bc41a',
      600: '#5ba000',
      700: '#448000',
      800: '#306000',
      900: '#1e4000',
    },
  },
  semantic: {
    primary: {
      50:  '{movistarBlue.50}',
      100: '{movistarBlue.100}',
      200: '{movistarBlue.200}',
      300: '{movistarBlue.300}',
      400: '{movistarBlue.400}',
      500: '{movistarBlue.500}',
      600: '{movistarBlue.600}',
      700: '{movistarBlue.700}',
      800: '{movistarBlue.800}',
      900: '{movistarBlue.900}',
      950: '{movistarBlue.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fa',
          100: '#f6f6f6',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#1a1e23',
        },
      },
    },
  },
  components: {
    button: {
      borderRadius: '4px',
    },
    inputtext: {
      borderRadius: '8px',
    },
    card: {
      borderRadius: '12px',
      shadow: '0 0.5rem 1rem rgba(0,0,0,0.08)',
    },
    datatable: {
      headerBorderRadius: '0',
    },
  },
})

export default DefaultTheme
