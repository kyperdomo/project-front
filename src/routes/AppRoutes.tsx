import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

type Props = {
  isAuth: boolean;
  setIsAuth: (value: boolean) => void;
};

const AppRoutes = ({ isAuth, setIsAuth }: Props) => {
  return (
    <BrowserRouter>
      <Routes>
        {!isAuth ? (
          <Route path="*" element={<Login setIsAuth={setIsAuth} />} />
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Dashboard />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;