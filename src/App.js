import "./App.css";
import Audits from "./components/audits";
import SelfAssessments from "./components/self-assessments";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-cyan/theme.css";

function App() {
  return (
    <PrimeReactProvider>
      <div className="App">
        <SelfAssessments />
        <Audits />
      </div>
    </PrimeReactProvider>
  );
}

export default App;
