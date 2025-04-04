import { Theme, presetGpnDefault } from "@consta/uikit/Theme";
import "./App.css";
import { EsoGame } from "./components";

function App() {
  return (
    <Theme preset={presetGpnDefault}>
      <EsoGame />
    </Theme>
  );
}

export default App;
