import React, { useEffect, useRef } from 'react'
import Avatar from '../../assets/user-circle-light.png'
import VideoCall from '../../assets/video-camera-light.png'
import PhoneCall from '../../assets/phone-call-light.png'
import Send from '../../assets/send-light.png'
import Search from '../../assets/search-light.png'
import Attach from '../../assets/attach-light.png'
import NewMessage from '../../assets/new_message_dark.png'

import InfiniteScroll from 'react-infinite-scroll-component'
import Input from '../../components/Input'
import { useState } from 'react';
import {io} from 'socket.io-client'


const Dashboard = () => {
    const apiLink = "https://react-js-chat-app-server-ecr7-bv0eiem7m.vercel.app/"
    const friends=[
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "tony",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        },
        {
            name: "alex",
            email: "alex@gmail.com"
        }    
    ]

    const [showMessages,setShowMessages] = useState(false); //bool to control drawer
    const [message, setMessage]= useState('') //message we're about to send
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user:detail"))) //info about user
    const [conversations, setConversations] = useState([]) //list of all conversations
    const [messages, setMessages] = useState({}) //list of all messages in conversation
    const [users, setUsers]=useState([]) //list of users
    const [socket, setSocket] = useState(null)
    const messageRef = useRef(null);
    
    document.body.style.overflow = "hidden"
    useEffect(()=>{
        setSocket(io('http://localhost:8002'));
    },[])

    useEffect(()=>{
        messageRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages?.messages])

    useEffect(()=>{
        socket?.emit('addUser', user?.id)
        socket?.on('getUsers', users=>{
            console.log('active users',users)
        })
        socket?.on('getMessage', data=>{
            console.log("DATA",data)
            setMessages(prev=>({
                ...prev,
                messages: [...prev.messages, {user: data.user, message: data.message}]
            }))
        })
    },[socket])

    

    //fetch conversations
    useEffect(()=>{
        const loggedInUser = JSON.parse(localStorage.getItem("user:detail"))
        const fetchConversations= async()=>{
            const res = await fetch(`${apiLink}api/conversation/${loggedInUser?.id}`,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                }
            })
            const resData = await res.json()
            setConversations(resData)
        }
        
        fetchConversations();
    }, [])

    //fetch users
    useEffect(()=>{
        const fetchUsers = async()=>{
            const res = await fetch(`${apiLink}api/users/${user?.id}`,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                }
            });
            const resData = await res.json()
            setUsers(resData)
        }
        fetchUsers();
    },[])

    const fetchMessages =  async(conversationId, receiver)=>{
        console.log("receiver id is ", receiver?.receiverId)
        const res = await fetch(`${apiLink}api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`,{
            method: 'GET',
            // ...(conversationId === 'new' &&{
            //     body: JSON.stringify({
            //         senderId: user?.id,
            //         receiverId: messages?.receiver?.receiverId
            //     })
            // }),
            headers:{
                'Content-Type': 'application/json',
            } 
        });
        const resData = await res.json();
        //console.log("messages",resData);
        setMessages({messages: resData, receiver, conversationId})
    }

    const sendMessage= async(e)=>{
        //console.log("receiver id is this: ", messages?.receiver?.receiverId)
        console.log(user?.id);
        socket?.emit('sendMessage',{
            senderId: user?.id,
            receiverId: messages?.receiver?.receiverId,
            message,
            conversationId: messages?.conversationId
        });
        const res = await fetch(`${apiLink}api/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: messages?.conversationId,
                senderId: user?.id,
                message ,
                receiverId: messages?.receiver?.receiverId,
            })
        })
        setMessage('');
    }

  return (
    <div className=' w-full  flex flex-col bg-primary h-screen justify-center items-center'>
        <div className='w-screen h-[60px] flex-none bg-semi_dark shadow'>logo</div>
        <div className='w-screen h-full flex overflow-auto'>
            <div className='h-full min-w-16 bg-semi_dark shadow-md border-t flex flex-col justify-end items-center p-3'>
                <img src={Avatar} alt='' className=' mb-3 w-10'/>
                <img src={Avatar} alt='' className=' mb-3 w-10'/>
                <img src={Avatar} alt=''className=' mb-12 w-10'/>
            </div>
            <div className='w-[25rem] min-w-[20rem] bg-secondary shadow-md h-[100%] border border-y-0 border-l-0 p-2 '>
                <div className=' flex justify-between items-center'>
                    <h1 className=' text-3xl font-semibold text-dark '>Messages</h1>
                    <img src={NewMessage} alt='' className=' mr-2 w-6 cursor-pointer' onClick={()=>{ setShowMessages(!showMessages); }}/>
                </div>
                
                
                <div id="scrollDiv" className=' flex-col w-full  mt-2'>
                    <InfiniteScroll
                        dataLength={conversations.length}
                        next={()=>{}}
                        hasMore={true}
                        loader={<h4 className='flex justify-center mt-4'>Loading...</h4>}
                        endMessage={
                        <p style={{ textAlign: "center" }}>
                            <b>Yay! You have seen it all</b>
                        </p>
                        }
                        height={800}
                        style={{scrollBehavior: 'smooth', scrollbarWidth: 'none'}}
                    >
                        {
                            conversations.length >0 ? conversations.map(({conversationId, user})=>{
                                //console.log(conversationId)
                                return (
                                    <div className=' w-full h-16 bg-primary flex p-2 mt-2 rounded-md cursor-pointer' onClick={()=>fetchMessages(conversationId, user)}>
                                        <img src={Avatar} alt='' className='ml-1 bg-semi_dark  border-semi_dark rounded-full border-[2px] items-center'/>
                                        <div className=' flex flex-col ml-2 justify-center'>
                                            <h1 className='text-xl font-[450]'>{user?.userName}</h1>
                                            <h3 className=''>{user?.email}</h3>
                                        </div>
                                    </div>
                                )
                            }) : <div className='w-full flex justify-center'><h2 className='text-xl font-[450]'>No conversations.</h2></div>
                            
                        }   
                    </InfiniteScroll>
                </div>
                   
            </div> 
            { showMessages && <div className='h-full w-[20%] min-w-[18%] max-w-[20%] bg-white flex flex-col p-2  '>
                    <h1 className=' text-2xl font-semibold text-dark '>Start a new conversation.</h1>
                    <h2 className=' text-lg font-[480] text-dark mt-1'>Select a user to get started.</h2>
                    <div className=' w-full h-full mt-4 overflow-auto    '>
                        {
                            users.length>0?
                            users.map(({user, userId})=>{
                                return(
                                    <div className=' w-full h-16 bg-primary flex p-2 mt-2 rounded-md cursor-pointer' onClick={()=>{
                                            setShowMessages(false);
                                            fetchMessages('new', user)
                                        }}>
                                        <img src={Avatar} alt='' className='ml-1 bg-semi_dark  border-semi_dark rounded-full border-[2px] items-center'/>
                                        <div className=' flex flex-col ml-2 justify-center'>
                                            <h1 className='text-xl font-[450]'>{user?.userName}</h1>
                                            <h3 className=''>{user?.email}</h3>
                                        </div>
                                    </div>
                                )
                            })
                            :<div></div>
                        }
                    </div>
                </div>
            }
            <div className="w-full min-w-fit h-full flex flex-col"> 
            {/* {console.log(conversations)} */}
             {/* {console.log(messages?.receiver?.userName)} } */}
                {
                    messages?.receiver?.userName ?
                        
                        <div className='w-full h-full flex flex-col  '> 
                            <div className='w-full  bg-secondary flex justify-start items-center p-2 drop-shadow-sm shadow-secondary '>
                                <img src={Avatar} alt='' className='flex-none w-10'/>
                                <h1 className='text-xl font-[480] ml-2 w-full'>{messages?.receiver?.userName}</h1>
                                <div className=" flex w-full h-10  justify-end items-center">
                                    <img src={VideoCall} alt='' className=' h-7 m-2 '/>
                                    <img src={PhoneCall} alt='' className=' h-6 m-2 '/>
                                    <img src={Search} alt='' className='h-6 m-2 '/>
                                </div>
                            </div>
                            <div className=' w-full h-full bg-white px-10 py-6 flex-col flex-grow-0 border-b-2 border overflow-auto '>
                                    {
                                        
                                        messages?.messages?.length>0 ? messages.messages.map(({message, user:{ id}={}})=>{
                                            return(
                                                <>
                                                    <div className={` max-w-[40%] flex rounded-b-xl  p-3 mb-4 ${ id === user?.id ? 'bg-secondary rounded-tl-xl ml-auto' : ' bg-primary rounded-tr-xl'}`}>
                                                    {message}
                                                    </div>
                                                    <div ref={messageRef}></div>
                                                </>
                                            )

                                        }): <div className='w-full h-full flex justify-center items-center'><h2 className='text-xl font-[450]'>No messages found</h2></div>
                                    }
                                    
                                
                            </div>
                            <div className='w-full   bg-secondary p-2  flex items-center justify-start '>
                                <Input className='w-full mr-4' hasLabel={false} label='hello' type='text'name='input' value={message} onChange={(e)=>setMessage( e.target.value)} isRequired={false} placeholder='Type your message here...' inputClassName=' w-full shadow-md border-none '/>
                                <img src={Send} alt='' className={` w-6 h-6 mr-4 cursor-pointer ${!message && 'pointer-events-none'}`} onClick={()=>{sendMessage()}}/>
                                <img src={Attach} alt='' className={` w-6 h-6 mr-4 cursor-pointer ${!message && 'pointer-events-none'}`}/>
                            </div>
                        </div> 
                        :
                        <div className='w-full h-full flex justify-center items-center'><h2 className='text-xl font-[450]'>Click a contact to get chatting!</h2></div>
                }
                
                
            </div>
        </div>
        
    </div>
  ) 
}

export default Dashboard