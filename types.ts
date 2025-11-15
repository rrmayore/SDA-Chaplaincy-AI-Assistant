
import type { ComponentType } from 'react';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  // Fix: Use imported `ComponentType` to resolve "Cannot find namespace 'React'" error.
  icon: ComponentType<{ className?: string }>;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Scripture {
  reference: string;
  text: string;
}

export interface EllenGWhiteQuote {
  source: string;
  text: string;
}

export interface AdditionalResource {
  title: string;
  description: string;
}

export interface AIResponseData {
  response: string;
  scripture: Scripture[];
  ellenGWhiteQuote: EllenGWhiteQuote[];
  practicalSteps: string[];
  additionalResources: AdditionalResource[];
}
