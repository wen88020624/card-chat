import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: '#f7f7f8',
          surface: '#ffffff',
          level1: '#f7f7f8',
        },
        text: {
          primary: '#1c1c1e',
          secondary: '#6b6b7b',
        },
      },
    },
    dark: {
      palette: {
        background: {
          body: '#17171b',
          surface: '#232329',
          level1: '#17171b',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#a3a3b3',
        },
      },
    },
  },
});

export default theme;
