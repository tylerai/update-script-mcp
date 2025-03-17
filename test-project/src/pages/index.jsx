import Head from 'next/head';
import { useState } from 'react';
import Button from '../components/Button';
import { formatDate } from '../utils/dateUtils';

export default function Home() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <Head>
        <title>Test Project</title>
      </Head>
      <main>
        <h1>Welcome to Test Project</h1>
        <p>Current date: {formatDate(new Date())}</p>
        <p>Count: {count}</p>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
      </main>
    </div>
  );
}