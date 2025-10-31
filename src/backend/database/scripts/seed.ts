import { db } from '../config';
import { userService, domainService, applicationService } from '../services';

interface SeedUser {
  username: string;
  email: string;
  role: 'Super Admin' | 'Admin Daerah' | 'Administrator' | 'Operator' | 'Auditor' | 'Kepala Bidang' | 'Pengelola Sistem';
  is_active?: boolean;
  opd_id?: number;
}

interface SeedOPD {
  name: string;
  contact_person: string;
  phone_number: string;
}

interface SeedDomain {
  domain_name: string;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  expires_at: Date;
  application_id?: number;
}

export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed OPDs first
    const opds: SeedOPD[] = [
      { name: 'Dinas Komunikasi dan Informatika', contact_person: 'Budi Santoso', phone_number: '081234567890' },
      { name: 'Dinas Pendidikan', contact_person: 'Siti Nurhaliza', phone_number: '081234567891' },
      { name: 'Dinas Kesehatan', contact_person: 'Dr. Abdul Rahman', phone_number: '081234567892' },
      { name: 'Dinas Sosial', contact_person: 'Maya Sari', phone_number: '081234567893' },
      { name: 'Badan Kepegawaian Daerah', contact_person: 'Agus Prasetyo', phone_number: '081234567894' }
    ];

    console.log('📍 Creating OPDs...');
    for (const opd of opds) {
      try {
        await db.execute(
          'INSERT INTO opds (name, contact_person, phone_number) VALUES (?, ?, ?)',
          [opd.name, opd.contact_person, opd.phone_number]
        );
        console.log(`✅ Created OPD: ${opd.name}`);
      } catch (error) {
        console.log(`⚠️ OPD ${opd.name} may already exist`);
      }
    }

    // Seed Users
    const users: SeedUser[] = [
      { username: 'superadmin', email: 'superadmin@example.com', role: 'Super Admin', is_active: true },
      { username: 'admin_kominfo', email: 'admin.kominfo@example.com', role: 'Admin Daerah', is_active: true },
      { username: 'auditor', email: 'auditor@example.com', role: 'Auditor', is_active: true },
      { username: 'operator_kominfo', email: 'operator.kominfo@example.com', role: 'Operator', is_active: true },
      { username: 'kabid_kominfo', email: 'kabid.kominfo@example.com', role: 'Kepala Bidang', is_active: true }
    ];

    console.log('👥 Creating users...');
    for (const user of users) {
      try {
        await userService.createUser({
          username: user.username,
          email: user.email,
          role: user.role,
          is_active: user.is_active
        });
        console.log(`✅ Created user: ${user.username}`);
      } catch (error) {
        console.log(`⚠️ User ${user.username} may already exist`);
      }
    }

    // Seed Applications
    console.log('📋 Creating sample applications...');
    const sampleApplications = [
      {
        userId: '2', // admin_kominfo
        domainName: 'portal.kominfo.go.id',
        purpose: 'Portal resmi Dinas Komunikasi dan Informatika',
        opd: 'Dinas Komunikasi dan Informatika',
        status: 'pending' as const
      },
      {
        userId: '3', // auditor
        domainName: 'e-learning.kominfo.go.id',
        purpose: 'Platform pembelajaran elektronik',
        opd: 'Dinas Komunikasi dan Informatika',
        status: 'approved' as const
      }
    ];

    for (const app of sampleApplications) {
      try {
        const appData = {
          userId: app.userId,
          domainName: app.domainName,
          purpose: app.purpose,
          opd: app.opd
        };
        const appId = await applicationService.createSubdomainApplication(appData);
        console.log(`✅ Created application: ${app.domainName}`);
        
        // If approved, create domain
        if (app.status === 'approved') {
          await applicationService.updateApplication(parseInt(appId), { status: 'approved' }, 1);
          await domainService.createDomain({
            domain_name: app.domainName,
            status: 'active',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          });
          console.log(`✅ Created domain: ${app.domainName}`);
        }
      } catch (error) {
        console.log(`⚠️ Application ${app.domainName} may already exist`);
      }
    }

    // Seed sample domains
    console.log('🌐 Creating sample domains...');
    const sampleDomains: SeedDomain[] = [
      {
        domain_name: 'covid19.go.id',
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        domain_name: 'info.corona.go.id',
        status: 'inactive',
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      }
    ];

    for (const domain of sampleDomains) {
      try {
        await domainService.createDomain({
          domain_name: domain.domain_name,
          status: domain.status,
          expires_at: domain.expires_at
        });
        console.log(`✅ Created domain: ${domain.domain_name}`);
      } catch (error) {
        console.log(`⚠️ Domain ${domain.domain_name} may already exist`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

export async function testDatabaseOperations(): Promise<void> {
  try {
    console.log('🧪 Testing database operations...');

    // Test User operations
    console.log('👥 Testing UserService...');
    const users = await userService.getUsers(1, 10);
    console.log(`✅ Retrieved ${users.users.length} users`);

    // Test Domain operations
    console.log('🌐 Testing DomainService...');
    const domains = await domainService.getDomains(1, 10);
    console.log(`✅ Retrieved ${domains.domains.length} domains`);

    // Test Application operations
    console.log('📋 Testing ApplicationService...');
    const applications = await applicationService.getApplications(1, 10);
    console.log(`✅ Retrieved ${applications.applications.length} applications`);

    // Test statistics
    console.log('📊 Testing application statistics...');
    const stats = await applicationService.getApplicationStats();
    console.log(`✅ Application stats:`, stats);

    console.log('🎯 All database operations working correctly!');
  } catch (error) {
    console.error('❌ Database operations test failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      await seedDatabase();
      await testDatabaseOperations();
    } catch (error) {
      console.error('Seeding process failed:', error);
      process.exit(1);
    } finally {
      process.exit(0);
    }
  })();
}
