import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Launch from "./routes/Launch.tsx";
import Login from "./routes/Login.tsx";
import Register from "./routes/Register.tsx";
import "./styles/index.scss";
import MenuPage from "./routes/MenuPage.tsx";
import UserPage from "./routes/UserPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Launch />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/menu/:bname/:tid",
    element: <MenuPage />,
  },
  {
    path: "/dashboard/:bname",
    element: <UserPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
