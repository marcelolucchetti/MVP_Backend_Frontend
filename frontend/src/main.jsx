import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './pages/Login';
import Register from './pages/Register'
import Plan from './pages/Plan'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import App from './App';
import Layout from './components/Layout';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      {
        path: "/",
        element: <Login />
      },
      {
        path: "/plano",
        element: (<Layout> <Plan /> </Layout>)
      },
    {
      path: "/cadastro",
      element: <Register />
    },
  ]}])
  

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router ={router} />
  </StrictMode>,
)
