'use client';

import React from 'react';
import SearchContainer from '../components/SearchContainer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      <SearchContainer />
    </main>
  );
}
