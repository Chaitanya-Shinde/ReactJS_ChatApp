import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input'
import Button from '../../components/Button'


function Form({
  isSignInPage=false,
}) {
  const apiLink = 'https://react-js-chat-app-server-ecr7.vercel.app/'
  const[data,setData] =useState({
    ...(!isSignInPage &&{
      userName: '',
    }),
    email: '',
    password: '',
    //confirmPassword: '',
  })

  const navigate = useNavigate()
  //console.log(isSignInPage)

  const handleSubmit = async (e)=>{
    e.preventDefault()
    console.log(data)
    const res = await fetch(`${apiLink}api/${isSignInPage?'login':'register'}`,{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if(res.status ===400){
      alert('Invalid credentials')
    }else{
      const resData = await res.json();
      console.log(resData);
      if(resData.token){
        localStorage.setItem('user:token', resData.token);
        localStorage.setItem('user:detail', JSON.stringify(resData.user));
        navigate('/');
      }
    }
    

  }

  return (
    <div className=' bg-white w-full h-screen shadow-lg rounded-lg flex flex-col justify-center items-center'>
        <div className=" text-4xl font-bold text-dark"> 
            Welcome {isSignInPage && 'Back'}!
        </div>
        <div className=" text-xl mt-2">
          {isSignInPage? 'Sign in to continue':' Sign up to join today'}
        </div>
        <form className=' flex flex-col items-center' onSubmit={(e)=> handleSubmit(e)}>
          <div className="inputs mt-4">
            {!isSignInPage && <Input name='username' label='Enter your username here' placeholder='Enter username here' value={data.userName} onChange={(e)=>setData({ ...data, userName: e.target.value})} isRequired={true} inputClassName='mb-4 w-[300px]'/>}
            <Input name='email' type='email' label='Enter your email here' placeholder='Enter email here' value={data.email} onChange={(e)=>setData({ ...data, email: e.target.value})} isRequired={true} inputClassName='mb-4 w-[300px]'/>
            <Input name='password' type='password' label='Enter your password here' placeholder='Enter password here' value={data.password} onChange={(e)=>setData({ ...data, password: e.target.value})} isRequired={true} inputClassName='mb-4 w-[300px]'/>
            {/* {!isSignInPage && <Input name='password' type='password' label='Confirm your password' placeholder='Enter password again' value={data.confirmPassword} onChange={(e)=>setData({ ...data, confirmPassword: e.target.value})} isRequired={true} inputClassName='mb-3 w-[300px]'/>} */}
          </div>
          <div className="w-full flex flex-row justify-end ">
            <Button label={isSignInPage? 'Sign In': 'Sign Up'} type='submit' disabled={false} className='w-[10rem]'/>
          </div>
        </form>
        
        <div className='mt-2'>{isSignInPage? "Don't": 'Already'} have an account? <span onClick={()=>navigate(`/users/${isSignInPage?'sign_up' : 'sign_in'}`)} className=' font-semibold cursor-pointer underline'>{isSignInPage? 'Sign Up': 'Sign In'}</span></div>

    </div>
  )
}

export default Form