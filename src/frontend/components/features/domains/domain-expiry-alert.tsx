import React from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/frontend/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Domain } from '@/backend/models/types';

interface DomainExpiryAlertProps {
  domain: Domain;
}

export function DomainExpiryAlert({ domain }: DomainExpiryAlertProps) {
  const daysUntilExpiry = Math.ceil(
    (new Date(domain.expires_at).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  if (daysUntilExpiry > 30) return null;

  let severity: 'default' | 'destructive';
  let message: string;

  if (daysUntilExpiry <= 0) {
    severity = 'destructive';
    message = 'Domain telah kedaluwarsa';
  } else if (daysUntilExpiry <= 7) {
    severity = 'destructive';
    message = `Domain akan kedaluwarsa dalam ${daysUntilExpiry} hari`;
  } else if (daysUntilExpiry <= 14) {
    severity = 'destructive';
    message = `Domain akan kedaluwarsa dalam ${daysUntilExpiry} hari`;
  } else {
    severity = 'default';
    message = `Domain akan kedaluwarsa dalam ${daysUntilExpiry} hari`;
  }

  return (
    <Alert variant={severity} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Peringatan Kedaluwarsa Domain</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <p className="mt-2">
          <strong>Domain:</strong> {domain.domain_name}<br />
          <strong>OPD:</strong> {domain.opd}<br />
          <strong>Tanggal Kedaluwarsa:</strong> {new Date(domain.expires_at).toLocaleDateString('id-ID')}
        </p>
      </AlertDescription>
    </Alert>
  );
}