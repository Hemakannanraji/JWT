// import { useState } from 'react';
// import axios from 'axios';
// import './App.css';


// //Backend Server API base URL
// const API="http://localhost:4000";

// //Main React Component
// function App() {

//   //Create a state to store the login status - Login Mode or Register Mode
//     const [isLogin,setIsLogin]=useState(true);

//     //State to store the value from form(name,email,password)
//     const [form,setForm]=useState({name:"",email:"",password:""});

//     //State to store the JWT Token(Read from browser local storage)
//     const [token,setToken]=useState(localStorage.getItem("token"));

//     //Register Function
//     const register=async() => {
//       //Send From Data Through Axios request
//       await axios.post(`${API}/register`,form);
//       alert("Registerd! Login Now");
//       setIsLogin(true);
//     };

//     const login = async() =>{
//       const res = await axios.post(`${API}/login`,{
//         email: form.email,
//         password: form.password
//       })
//       localStorage.setItem("token",res.data.token);
//       setToken(res.data.token)
//     }

//     const logout = ()=>{
//       localStorage.removeItem("token");
//       setToken(null)
//     }

//     //Login UI - After Login
//     if(token){
//       return (
//         <div>
//           <h2>Welcome to Logged In.</h2>
//           <button onClick={logout}>Logout</button>
//         </div>
//       );
//     }

//     return (
//       <div>
//         <h2>{isLogin ? "Login" : "Register"}</h2>
//         {/* Name Field should be shown only if isLogin isfalse - Register Mode */}
//         {!isLogin && (
//           <input type='text' placeholder='Name' onChange={(e) => setForm[{...form,name:e.target.value}]}/>
//         )}
//         <input type='email' placeholder='Email'
//         onChange={(e) => setForm({...form,email: e.target.value})}/>
//         <input type='password' placeholder='password'
//         onChange={(e) => setForm({...form,password:e.target.value})}/>

//         {isLogin ? (
//           <button onClick={login}>Login</button>
//         ):(
//           <button onClick={register}>Register</button>
//         )}

//         <p onClick={() => setIsLogin(!isLogin)}
//           style={{cursor:"pointer"}}>
//           {isLogin ?"Create Account" : "Already have a account? Login"}
//         </p>

//       </div>
//     );
// }

// export default App;






import { useState } from 'react';
import './App.css';
import axios from 'axios';

import{GoogleOAuthProvider, GoogleLogin} from "@react-oauth/google";

//Backend Server API base URL
const API= "http://localhost:5000";

const GOOGLE_CLIENT_ID = "196188331776-tdiaeagbqsgloriujomm02876ccoi3pk.apps.googleusercontent.com";

function App() {
  //to store login status - Login mode or register mode
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({name:"",email:"",password:""});

  //stste to store the JWTW token (REad from browser local storage)
  const [token, setToken] = useState(localStorage.getItem("token"));

  const register = async(form) => {
    //send form data through axios request
    const res=await axios.post(`${API}/register`, form);
    console.log(res.data);
    setIsLogin(true);
  };

  const login = async() => {
    const res = await axios.post(`${API}/login`, {email:form.email, password:form.password});
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const googleLogin = async(credentialResponse) => {
    try{
      const res=await axios.post(`${API}/auth/google`, {
        id_token: credentialResponse.credential,
      });
    
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    }
    catch(err){
      alert(err.response?.data?.message || 'Google sign-in failed');
    }
  }


  //Logged In UI - after login
  if(token){
    return(
      <div>
        <h2>Welcome! You logged in</h2>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <div>
      <h2>{isLogin?"Login":"Register"}</h2>

      {!isLogin && <input type='text' placeholder='Name' onChange={(e) => setForm({...form, name: e.target.value})} />} 
      <input type='email' placeholder='Email' onChange={(e)=> setForm({...form, email:e.target.value})} />
      <input type='password' placeholder='Password' onChange={(e) => setForm({...form, password:e.target.value})} />
      
      {isLogin? 
      <button onClick={login}>Login</button>:
      <button onClick={() => register(form)}>Register</button>}

      <GoogleLogin 
      onSuccess={googleLogin}
      onError={() => console.log("Google login failed")}>
      </GoogleLogin>


      <p onClick={()=>setIsLogin(!isLogin)}
        style={{cursor:'pointer'}}>
          {isLogin?"Register here":"Have an account?Login"}</p>
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;