import { Domain, DomainStatus } from '../models/types';
import { db } from '../database/config';
import { auditService } from './audit.service';
import { QueryResult } from '../database/types';

export class DomainActivationService {
  /**
   * Activates a domain after approval
   * This includes:
   * 1. Updating domain status to active
   * 2. Setting activation date
   * 3. Recording the activation in audit log
   */
  async activateDomain(domainId: string, userId: string): Promise<Domain> {
    // Get domain details
    const domain = await db.query<Domain>(
      'SELECT * FROM domains WHERE id = $1',
      [domainId]
    ).then((res: QueryResult<Domain>) => res.rows[0]);

    if (!domain) {
      throw new Error('Domain not found');
    }

    if (domain.status === 'active') {
      throw new Error('Domain is already active');
    }

    // Update domain status
    const updatedDomain = await db.query<Domain>(
      `UPDATE domains 
       SET status = $1, 
           activation_date = $2
       WHERE id = $3 
       RETURNING *`,
      ['active' as DomainStatus, new Date().toISOString(), domainId]
    ).then((res: QueryResult<Domain>) => res.rows[0]);

    // Record in audit log
    await auditService.logAction({
      userId,
      action: 'ACTIVATE_DOMAIN',
      resourceType: 'domain',
      resourceId: domainId,
      description: `Domain ${domain.hostname} activated`
    });

    return updatedDomain;
  }

  /**
   * Deactivates a domain
   * This includes:
   * 1. Updating domain status to inactive
   * 2. Recording the deactivation in audit log
   */
  async deactivateDomain(domainId: string, userId: string, reason: string): Promise<Domain> {
    // Get domain details
    const domain = await db.query<Domain>(
      'SELECT * FROM domains WHERE id = $1',
      [domainId]
    ).then((res: QueryResult<Domain>) => res.rows[0]);

    if (!domain) {
      throw new Error('Domain not found');
    }

    if (domain.status === 'inactive') {
      throw new Error('Domain is already inactive');
    }

    // Update domain status
    const updatedDomain = await db.query<Domain>(
      `UPDATE domains 
       SET status = $1
       WHERE id = $2 
       RETURNING *`,
      ['inactive' as DomainStatus, domainId]
    ).then((res: QueryResult<Domain>) => res.rows[0]);

    // Record in audit log
    await auditService.logAction({
      userId,
      action: 'DEACTIVATE_DOMAIN',
      resourceType: 'domain',
      resourceId: domainId,
      description: `Domain ${domain.hostname} deactivated. Reason: ${reason}`
    });

    return updatedDomain;
  }

  /**
   * Handles automatic activation of approved domains
   * This method should be called after domain application approval
   */
  async handleApprovedDomain(domainId: string, userId: string): Promise<void> {
    try {
      await this.activateDomain(domainId, userId);
    } catch (error) {
      console.error('Failed to activate approved domain:', error);
      throw new Error('Failed to activate approved domain');
    }
  }

  /**
   * Handles automatic reactivation after domain renewal
   */
  async handleDomainRenewal(domainId: string, userId: string, newExpiryDate: string): Promise<Domain> {
    // Get domain details
    const domain = await db.query<Domain>(
      'SELECT * FROM domains WHERE id = $1',
      [domainId]
    ).then((res: QueryResult<Domain>) => res.rows[0]);

    if (!domain) {
      throw new Error('Domain not found');
    }

    // Update domain status and expiry date
    const updatedDomain = await db.query<Domain>(
      `UPDATE domains 
       SET status = $1,
           expiry_date = $2
       WHERE id = $3 
       RETURNING *`,
      ['active' as DomainStatus, newExpiryDate, domainId]
    ).then((res: QueryResult<Domain>) => res.rows[0]);

    // Record in audit log
    await auditService.logAction({
      userId,
      action: 'RENEW_DOMAIN',
      resourceType: 'domain',
      resourceId: domainId,
      description: `Domain ${domain.hostname} renewed until ${newExpiryDate}`
    });

    return updatedDomain;
  }
}

export const domainActivationService = new DomainActivationService();