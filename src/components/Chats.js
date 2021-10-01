import React, { useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ChatEngine } from 'react-chat-engine';
import { auth } from '../firebase';

import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PROJECT_ID = process.env.REACT_APP_CHAT_ENGINE_PROJECT_ID;
const PRIVATE_KEY = process.env.REACT_APP_CHAT_ENGINE_PRIVATE_KEY;

const Chats = () => {
    const [loading, setLoading] = useState(true);
    const history = useHistory();
    const { user } = useAuth();

    const handleLogout = async () => {
        await auth.signOut();

        history.push('/');
    }

    const getFile = async (url) => {
        
        const response = await fetch(url);
        const data = await response.blob();

        return new File([data], "userPhoto.jpg", { type: 'image/jpg' });
    }

    useEffect( () => {
        if(!user) {
            history.push('/');
            return;
        }
        console.log('***', user)
        axios.get(
            'https://api.chatengine.io/users/me', 
            { headers: {
                "project-id": PROJECT_ID,
                "user-name": user.email,
                "user-secret": user.uid
            }
        })
        .then( () => {
            setLoading(false);
        })
        .catch( (error) => {
            try {
                let formdata = new FormData();
                formdata.append('email', user.email);
                formdata.append('username', user.email);
                formdata.append('secret', user.uid);
                getFile(user.photoURL)
                    .then( (avatar) => {
                        formdata.append('avatar', avatar, avatar.name)
                        axios.post('https://api.chatengine.io/users/', 
                            formdata,
                            { headers: {"private-key": PRIVATE_KEY}}
                        )
                        .then( () => {setLoading(false)})
                        .catch( (error) => { console.log(error) })
                    })   
            } catch (error) {
                console.log('account creation login error: ' + error);
                handleLogout();
            }
        })
    }, []);

    if (!user || loading) return 'Loading..'

    return (
        <div className="chat-page">
            <div className="nav-bar">
                <div className="logo-tab">
                    UndMe
                </div>
                <div onClick={handleLogout} className="logout-tab">
                    Logout
                </div>
            </div>
            
            <ChatEngine
                height="calc(100vh - 66px)"
                projectID={PROJECT_ID}
                userName={user.email}
                userSecret={user.uid}
            />
        </div>
    )
}

export default Chats;