import {
  Theme,
  ThemePreset,
  presetGpnDark,
  presetGpnDefault,
} from "@consta/uikit/Theme";
import "./App.css";
import { EsoGame } from "./components";
import { Switch, SwitchProps } from "@consta/uikit/Switch";
import { useState } from "react";
type ThemeName = "gpnDefault" | "gpnDark";
function getPreset(themeName: ThemeName): ThemePreset {
  const obj = {
    gpnDefault: presetGpnDefault,
    gpnDark: presetGpnDark,
  };
  return obj[themeName] || presetGpnDefault;
}
function App() {
  const [theme, setTheme] = useState<ThemeName>("gpnDefault");
  const handleChange: SwitchProps["onChange"] = (e) =>
    setTheme(e.target.checked ? "gpnDark" : "gpnDefault");
  return (
    <Theme preset={getPreset(theme)}>
      <Switch
        label="Dark Mode"
        onChange={handleChange}
        checked={theme === "gpnDark"}
      />
      <EsoGame />
    </Theme>
  );
}

export default App;
