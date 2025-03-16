/**
 * Home Page
 * The main landing page of the application
 */

import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { formatDate, truncate } from '../utils/helpers';

export function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleIncrement = () => {
    setCount(prevCount => prevCount + 1);
  };
  
  const handleReset = () => {
    setCount(0);
  };
  
  const longText = "This is a very long text that will be truncated using our utility function. It demonstrates how we can reuse functionality across our application.";
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Our Demo App</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Time</h2>
        <p className="mb-2">Short format: {formatDate(currentTime, 'short')}</p>
        <p className="mb-2">Long format: {formatDate(currentTime, 'long')}</p>
        <p>Time format: {formatDate(currentTime, 'time')}</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Counter: {count}</h2>
        <div className="flex space-x-4">
          <Button onClick={handleIncrement}>Increment</Button>
          <Button variant="secondary" onClick={handleReset}>Reset</Button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Text Truncation</h2>
        <p className="mb-2">Original: {longText}</p>
        <p>Truncated: {truncate(longText, 30)}</p>
      </div>
    </div>
  );
} 