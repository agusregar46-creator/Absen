import {
BrowserRouter,
Routes,
Route
}
from "react-router-dom";



import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Absen from "./pages/Absen";
import Riwayat from "./pages/Riwayat";
import Admin from "./pages/Admin";


function App(){

return(

<BrowserRouter>

<Routes>

<Route
path="/"
element={<Login/>}
/>


<Route
path="/dashboard"
element={<Dashboard/>}
/>


<Route
path="/absen"
element={<Absen/>}
/>

<Route
path="/riwayat"
element={<Riwayat/>}
/>

<Route

path="/admin"

element={<Admin/>}

/>

</Routes>

</BrowserRouter>

)

}

export default App;