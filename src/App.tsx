import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

interface User {
  uid: string;
  photoUrl?: string;
}
interface Message {
  id: string;
  text?: string;
  uid: string;
  photoUrl?: string;
}
interface ChatMsgProps {
  message: Message;
}
console.log('env', process.env);

console.log('apikey', process.env.REACT_APP_FIREBASE_API_KEY);
console.log('domain', process.env.REACT_APP_FIREBASE_AUTH_DOMAINY);
console.log('projectid', process.env.REACT_APP_FIREBASE_PROJECT_ID);
console.log('storage', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);
console.log('sender', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID);
console.log('app_id', process.env.REACT_APP_FIREBASE_APP_ID);
console.log('measure', process.env.REACT_APP_FIREBASE_MEASUREMENT_ID);

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
const analytics = firebase.analytics();

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
  const messageRef = firestore.collection('message');
  const query = messageRef.orderBy('createAt').limit(100);
  const [messages] = useCollectionData<Message>(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e: any) => {
    e.preventDefault();
    const { uid, photoUrl } = auth.currentUser as User;
    await messageRef.add({
      text: formValue,
      createAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoUrl,
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

function ChatMessage(props: ChatMsgProps) {
  const { text, uid, photoUrl } = props.message;
  const messageClass = uid == auth.currentUser?.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          alt='avatar'
          src={
            photoUrl || 'https://api.adorable.io/avatars/23/abott@adorable.p'
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}
export default App;
