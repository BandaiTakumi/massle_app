import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Calender from "./components/pages/Calender";
import Menu from "./components/pages/Menu";
import Weight from "./components/pages/Weight";
import AddMenu from "./components/pages/AddMenu";
import Training from "./components/pages/Training";
import TrainingComplete from "./components/pages/TrainingComplete";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/calender" element={<Calender />} />
          <Route path="/" element={<Menu />} />
          <Route path="/wight" element={<Weight />} />
          <Route path="/add-menu" element={<AddMenu />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training-complete" element={<TrainingComplete />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
