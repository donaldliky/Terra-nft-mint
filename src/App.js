import Main from "./pages/Main";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  // typography: {
  //   allVariants: {
  //     fontFamily: 'Acme',
  //     // textTransform: 'none',
  //     // fontSize: 16,
  //   },
  // },
  palette: {
    secondary: {
      main: '#37474f',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
});

function App() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider>
    </div>
  );
}

export default App;
