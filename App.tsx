import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ChatWidget } from './components/ChatWidget';

export default function App() {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <Hero />
      </main>
      <ChatWidget />
    </div>
  );
}