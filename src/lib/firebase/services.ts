
import { MOCK_APPLICATIONS, MOCK_DOMAINS, MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_HOSTING_APPLICATIONS } from '@/lib/mock-data';
import type { SubdomainApplication, Domain, User, AuditLog, HostingApplication } from '../types';

// Application specific services
export const getApplications = async (): Promise<SubdomainApplication[]> => {
  return Promise.resolve(MOCK_APPLICATIONS);
};

export const getApplicationById = async (id: string): Promise<SubdomainApplication | null> => {
  const application = MOCK_APPLICATIONS.find(app => app.id === id) || null;
  return Promise.resolve(application);
};

export const createApplication = async (data: Omit<SubdomainApplication, 'id' | 'status' | 'submittedDate' | 'documents'>): Promise<string> => {
    const newId = `APP${MOCK_APPLICATIONS.length + 1}`;
    const newApplication: SubdomainApplication = {
        id: newId,
        ...data,
        status: 'pending_review',
        submittedDate: new Date().toISOString().split('T')[0],
        documents: ['surat_permohonan.pdf'],
    };
    MOCK_APPLICATIONS.unshift(newApplication);
    return Promise.resolve(newId);
};

export const updateApplicationStatus = async (id: string, status: SubdomainApplication['status'], reason?: string): Promise<void> => {
  const appIndex = MOCK_APPLICATIONS.findIndex(app => app.id === id);
  if (appIndex !== -1) {
    MOCK_APPLICATIONS[appIndex].status = status;
    if (reason) {
      MOCK_APPLICATIONS[appIndex].rejectionReason = reason;
    }
  }
  return Promise.resolve();
};

export const createDomainFromApplication = async (application: SubdomainApplication): Promise<void> => {
    const existingDomain = MOCK_DOMAINS.find(d => d.hostname === application.domainName);
    if (existingDomain) {
        existingDomain.status = 'pending';
    } else {
        const newDomain: Domain = {
            id: `DOM${MOCK_DOMAINS.length + 1}`,
            hostname: application.domainName,
            parentDomain: 'kalbarprov.go.id',
            status: 'pending',
            opd: application.opd,
            activationDate: new Date().toISOString().split('T')[0],
        };
        MOCK_DOMAINS.push(newDomain);
    }
    return Promise.resolve();
}

// Domain specific services
export const getDomains = async (): Promise<Domain[]> => {
  return Promise.resolve(MOCK_DOMAINS);
};

export const getDomainById = async (id: string): Promise<Domain | null> => {
  const domain = MOCK_DOMAINS.find(d => d.id === id) || null;
  return Promise.resolve(domain);
};

export const updateDomainStatus = async (id: string, status: Domain['status']): Promise<void> => {
    const domainIndex = MOCK_DOMAINS.findIndex(d => d.id === id);
    if (domainIndex !== -1) {
        MOCK_DOMAINS[domainIndex].status = status;
    }
    return Promise.resolve();
};

export const updateDomain = async (id: string, data: Partial<Domain>): Promise<void> => {
    const domainIndex = MOCK_DOMAINS.findIndex(d => d.id === id);
    if (domainIndex !== -1) {
        MOCK_DOMAINS[domainIndex] = { ...MOCK_DOMAINS[domainIndex], ...data };
    }
    return Promise.resolve();
};

export const createDomain = async (data: Omit<Domain, 'id'>): Promise<string> => {
    const newId = `DOM${MOCK_DOMAINS.length + 1}`;
    const newDomain: Domain = {
        id: newId,
        ...data,
    };
    MOCK_DOMAINS.unshift(newDomain);
    return Promise.resolve(newId);
};


// User specific services
export const getUsers = async (): Promise<User[]> => {
  return Promise.resolve(MOCK_USERS);
};

export const getUsersByOpd = async (opd: string): Promise<User[]> => {
    const users = MOCK_USERS.filter(user => user.opd === opd);
    return Promise.resolve(users);
}

export const addUser = async (data: Omit<User, 'id'>): Promise<string> => {
    const newId = `USR${MOCK_USERS.length + 1}`;
    const newUser: User = {
        id: newId,
        status: 'active',
        ...data,
    };
    MOCK_USERS.push(newUser);
    return Promise.resolve(newId);
};

export const updateUser = async (id: string, data: Partial<User>): Promise<void> => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...data };
    }
    return Promise.resolve();
};

export const deleteUser = async (id: string): Promise<void> => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        MOCK_USERS.splice(userIndex, 1);
    }
    return Promise.resolve();
};

// Hosting specific services
export const getHostingApplications = async (): Promise<HostingApplication[]> => {
  return Promise.resolve(MOCK_HOSTING_APPLICATIONS);
};

export const getHostingApplicationById = async (id: string): Promise<HostingApplication | null> => {
    const application = MOCK_HOSTING_APPLICATIONS.find(app => app.id === id) || null;
    return Promise.resolve(application);
}

export const createHostingApplication = async (data: Omit<HostingApplication, 'id'>): Promise<string> => {
    const newId = `HST${MOCK_HOSTING_APPLICATIONS.length + 1}`;
    const newApplication: HostingApplication = {
        id: newId,
        ...data,
    };
    MOCK_HOSTING_APPLICATIONS.unshift(newApplication);
    return Promise.resolve(newId);
};

export const updateHostingApplicationStatus = async (id:string, status: HostingApplication['status'], reason?: string): Promise<void> => {
    const appIndex = MOCK_HOSTING_APPLICATIONS.findIndex(app => app.id === id);
    if (appIndex !== -1) {
        MOCK_HOSTING_APPLICATIONS[appIndex].status = status;
        if (reason) {
            MOCK_HOSTING_APPLICATIONS[appIndex].rejectionReason = reason;
        }
    }
    return Promise.resolve();
}

// Audit Log specific services
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  return Promise.resolve(MOCK_AUDIT_LOGS);
};

export const createAuditLog = async (data: Omit<AuditLog, 'id'>): Promise<void> => {
  const newLog: AuditLog = {
      id: `LOG${MOCK_AUDIT_LOGS.length + 1}`,
      ...data,
  };
  MOCK_AUDIT_LOGS.unshift(newLog);
  return Promise.resolve();
};
