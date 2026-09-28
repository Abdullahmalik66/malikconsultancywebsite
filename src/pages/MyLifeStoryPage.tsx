import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CRTScreenWrapper } from '@/components/terminal/CRTScreenWrapper';
import { TerminalBootScreen } from '@/components/terminal/TerminalBootScreen';
import { TerminalIntroScreen } from '@/components/terminal/TerminalIntroScreen';
import { TerminalSystemExplorer } from '@/components/terminal/TerminalSystemExplorer';

export default function MyLifeStoryPage() {
  const [screenIndex, setScreenIndex] = useState<1 | 2 | 3>(1);

  return (
    <CRTScreenWrapper currentScreenIndex={screenIndex}>
      <Helmet>
        <title>My Life Story — Retro Terminal Experience | Abdullah Malik</title>
        <meta 
          name="description" 
          content="An interactive retro intelligence terminal exploring Abdullah Malik's journey from Lahore to Finland, and from marketing to data to AI." 
        />
      </Helmet>

      {screenIndex === 1 && (
        <TerminalBootScreen onComplete={() => setScreenIndex(2)} />
      )}

      {screenIndex === 2 && (
        <TerminalIntroScreen onComplete={() => setScreenIndex(3)} />
      )}

      {screenIndex === 3 && (
        <TerminalSystemExplorer onRestart={() => setScreenIndex(1)} />
      )}
    </CRTScreenWrapper>
  );
}
