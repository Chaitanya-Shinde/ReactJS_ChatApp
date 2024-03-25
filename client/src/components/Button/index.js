import React from 'react'

const Button = ({
  label='Button',
  type='button',
  className='',
  disabled=false,
}) => {
  return (
    <div>
        <button type={type} disabled={disabled} className={` 
        bg-semi_dark
        px-3 py-2 rounded-md
        text-lg
        font-semibold
        text-primary
        hover:bg-dark
        disabled:bg-secondary
        ${className}`}>{label}</button>
    </div>
  )
}

export default Button