import './App.css';
import NavBar from "./components/NavBar";
import PackageListing from "./pages/PackageListing";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <NavBar />
        <Routes>
          <Route path="/" element={<PackageListing />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
