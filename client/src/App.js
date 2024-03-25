import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './modules/Dashboard';
import Form from './modules/Form';


const ProtectedRoutes =({children, auth = false})=>{
  const isLoggedIn = localStorage.getItem('user:token') !== null || false;
  
  if(!isLoggedIn && auth){
    return <Navigate to={'/users/sign_in'}/>
  }
  else if(isLoggedIn && ['/users/sign_in','/users/sign_up'].includes(window.location.pathname)){
    return <Navigate to={'/'}/>
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route exact path='/' element={
        <ProtectedRoutes auth={true}>
          <Dashboard/>
        </ProtectedRoutes>
        
      } />
      <Route exact path='/users/sign_in' element={
        <ProtectedRoutes>
          <Form isSignInPage={true} /> 
        </ProtectedRoutes>
        
      } />
      <Route exact path='/users/sign_up' element={
        <ProtectedRoutes>
          <Form isSignInPage={false}/>
        </ProtectedRoutes>
        
      } />
    </Routes>

    // <div className="bg-primary h-screen flex justify-center items-center">
    //   {/* <Form/> */}
    //   <Dashboard/>
    // </div>
  );
}

export default App;
