/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Case {
  id: string;
  name: string;
  target: string;
  description: string;
  status: 'active' | 'under_review' | 'escalated' | 'closed';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  associatedValue: string;
}

export interface Alert {
  id: string;
  type: string;
  source: string;
  targetEntity: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'dismissed' | 'escalated';
  detectedAt: string;
  patternDetected: boolean;
  description: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'individual' | 'account' | 'company' | 'trust';
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  flagged: boolean;
  metadata: Record<string, string>;
  avatar: string;
}

export interface Node {
  id: string;
  label: string;
  type: 'individual' | 'account' | 'company' | 'trust' | 'ip_address' | 'device';
  riskLevel: 'low' | 'medium' | 'high';
  x: number;
  y: number;
}

export interface Edge {
  source: string;
  target: string;
  type: 'transfer' | 'ownership' | 'control';
  value?: string;
  isRisk: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system' | 'ai';
  text: string;
  timestamp: string;
}
