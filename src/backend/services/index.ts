// Main services export
import { MOCK_APPLICATIONS, MOCK_DOMAINS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_HOSTING_APPLICATIONS } from "@/backend/utils/mock-data";
import type { SubdomainApplication, Domain, User, AuditLog, HostingApplication } from '@/backend/models/types';

// Re-export all services from firebase implementation
export * from './firebase/services';

// Application Services
export const getApplications = () => MOCK_APPLICATIONS;

export const getApplicationById = (id: string) => 
  MOCK_APPLICATIONS.find((app: SubdomainApplication) => app.id === id) || null;

export const createApplication = (application: SubdomainApplication) => {
  MOCK_APPLICATIONS.push(application);
  return application;
};

export const updateApplication = (id: string, application: Partial<SubdomainApplication>) => {
  const appIndex = MOCK_APPLICATIONS.findIndex((app: SubdomainApplication) => app.id === id);
  if (appIndex > -1) {
    MOCK_APPLICATIONS[appIndex] = {
      ...MOCK_APPLICATIONS[appIndex],
      ...application
    };
  }
  return MOCK_APPLICATIONS[appIndex];
};

export const deleteApplication = (id: string) => {
  const application = getApplicationById(id);
  if (application) {
    const existingDomain = MOCK_DOMAINS.find((d: Domain) => d.hostname === application.domainName);
    if (existingDomain) {
      const domainIndex = MOCK_DOMAINS.findIndex((d: Domain) => d.id === existingDomain.id);
      MOCK_DOMAINS.splice(domainIndex, 1);
    }
  }

  const appIndex = MOCK_APPLICATIONS.findIndex((app: SubdomainApplication) => app.id === id);
  MOCK_APPLICATIONS.splice(appIndex, 1);
};

// Domain Services
export const getDomains = () => MOCK_DOMAINS;

export const getDomainById = (id: string) => 
  MOCK_DOMAINS.find((d: Domain) => d.id === id) || null;

export const updateDomain = (id: string, domain: Partial<Domain>) => {
  if (domain) {
    const domainIndex = MOCK_DOMAINS.findIndex((d: Domain) => d.id === id);
    MOCK_DOMAINS[domainIndex] = { ...MOCK_DOMAINS[domainIndex], ...domain };
  }
};

export const deleteDomain = (id: string) => {
  if (id) {
    const domainIndex = MOCK_DOMAINS.findIndex((d: Domain) => d.id === id);
    MOCK_DOMAINS.splice(domainIndex, 1);
  }
};

// User Services
export const getUsers = () => MOCK_USERS;

export const getUserById = (id: string) => 
  MOCK_USERS.find((u: User) => u.id === id) || null;

export const getUsersByOpd = (opd: string) => {
  if (opd) {
    const users = MOCK_USERS.filter((user: User) => user.opd === opd);
    return users;
  }
  return [];
};

export const createUser = (user: User) => {
  MOCK_USERS.push(user);
  return user;
};

export const updateUser = (id: string, user: Partial<User>) => {
  if (user) {
    const userIndex = MOCK_USERS.findIndex((u: User) => u.id === id);
    MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...user };
  }
};

export const deleteUser = (id: string) => {
  if (id) {
    const userIndex = MOCK_USERS.findIndex((u: User) => u.id === id);
    MOCK_USERS.splice(userIndex, 1);
  }
};

// Audit Log Services
export const getAuditLogs = () => MOCK_AUDIT_LOGS;

// Hosting Application Services 
export const getHostingApplications = () => MOCK_HOSTING_APPLICATIONS;

export const getHostingApplicationById = (id: string) => {
  if (id) {
    return MOCK_HOSTING_APPLICATIONS.find((app: HostingApplication) => app.id === id) || null;
  }
  return null;
};

export const createHostingApplication = (application: HostingApplication) => {
  MOCK_HOSTING_APPLICATIONS.push(application);
  return application;
};

export const updateHostingApplication = (id: string, application: Partial<HostingApplication>) => {
  if (application) {
    const appIndex = MOCK_HOSTING_APPLICATIONS.findIndex((app: HostingApplication) => app.id === id);
    MOCK_HOSTING_APPLICATIONS[appIndex] = {
      ...MOCK_HOSTING_APPLICATIONS[appIndex],
      ...application
    };
  }
};

// Add missing status update functions
export const updateApplicationStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
  const appIndex = MOCK_APPLICATIONS.findIndex((app: SubdomainApplication) => app.id === id);
  if (appIndex > -1) {
    MOCK_APPLICATIONS[appIndex] = {
      ...MOCK_APPLICATIONS[appIndex],
      status
    };
  }
  return MOCK_APPLICATIONS[appIndex];
};

export const updateDomainStatus = (id: string, status: 'active' | 'inactive' | 'expired') => {
  const domainIndex = MOCK_DOMAINS.findIndex((d: Domain) => d.id === id);
  if (domainIndex > -1) {
    MOCK_DOMAINS[domainIndex] = {
      ...MOCK_DOMAINS[domainIndex],
      status
    };
  }
  return MOCK_DOMAINS[domainIndex];
};
