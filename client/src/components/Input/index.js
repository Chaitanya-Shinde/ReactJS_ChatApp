import React from 'react'

const Input =({
    label= '',
    name='',
    type='text',
    inputClassName='',
    className='',
    isRequired = true,
    placeholder='',
    value='',
    hasLabel=true,
    onChange =()=>{}
})=> {
  return (
    <div className={className}>
         {hasLabel && <div> <label htmlFor={name} className=' text-lg font-semibold text-dark'>{label}</label> <br/> </div>}
        <input 
          type={type} id={name} placeholder ={placeholder} required={isRequired} value={value} onChange={onChange} 
          className={
          `bg-primary
           border-[3px]
           border-secondary
           text-dark
           hover:border-semi_dark 
           focus:outline-none 
           focus:border-semi_dark 
           rounded-md p-2 
           
           placeholder: text-semi_dark ${inputClassName}`
          }/>
    </div>
  )
}

export default Input