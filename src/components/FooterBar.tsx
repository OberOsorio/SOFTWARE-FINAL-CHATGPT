import React from 'react';
import { ViewMode } from '../types';

interface FooterBarProps {
  currentView?: ViewMode;
  onSelectView?: (view: ViewMode) => void;
}

export const FooterBar: React.FC<FooterBarProps> = () => {
  return null;
};
