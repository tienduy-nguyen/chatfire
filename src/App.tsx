import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  photoURL?: string;
}
interface Message {
  id: string;
  text?: string;
  uid: string;
  photoURL?: string;
}
interface ChatMsgProps {
  message: Message;
}

firebase.initializeApp({
  // firebase configure
  apiKey: 'AIzaSyAEhoBVBmxWMSWX6WSBoW1hlLBFiGpiboI',
  authDomain: 'chatfire-c09ff.firebaseapp.com',
  projectId: 'chatfire-c09ff',
  storageBucket: 'chatfire-c09ff.appspot.com',
  messagingSenderId: '630254024009',
  appId: '1:630254024009:web:971d10442c1fd7fc729698',
  measurementId: 'G-WTJNQMMRGC',
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className='App'>
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef<null | HTMLElement>(null);
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createAt').limit(100);
  const [messages] = useCollectionData<Message>(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e: any) => {
    e.preventDefault();
    let { uid, photoURL, displayName } = auth.currentUser as User;
    if (!photoURL) {
      photoURL = `https://eu.ui-avatars.com/api/?name=${displayName}`;
    }
    await messageRef.add({
      text: formValue,
      createAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue('');
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder='say something nice'
        />

        <button type='submit' disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function randomText(length: number) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function ChatMessage(props: ChatMsgProps) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          alt='avatar'
          src={
            photoURL || `https://eu.ui-avatars.com/api/?name=${randomText(2)}`
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}
export default App;
