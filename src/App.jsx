import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Calender from "./components/pages/Calender";
import Menu from "./components/pages/Menu";
import Weight from "./components/pages/Weight";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/calender" element={<Calender />} />
          <Route path="/" element={<Menu />} />
          <Route path="/wight" element={<Weight />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
