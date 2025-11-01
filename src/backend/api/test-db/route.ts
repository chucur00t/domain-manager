import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/backend/database/services/user.service';
import { DomainService } from '@/backend/database/services/domain.service';
import { ApplicationService } from '@/backend/database/services/application.service';
import { query } from '@/backend/database/utils';

// Test endpoint untuk verify MySQL connection dan services
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    status: 'testing',
    tests: {}
  };

  try {
    // 1. Test MySQL Connection
    console.log('Testing MySQL connection...');
    try {
      const connectionTest = await query('SELECT 1 as test');
      results.tests.mysqlConnection = {
        status: 'success',
        message: 'MySQL connection successful',
        result: connectionTest
      };
    } catch (error: any) {
      results.tests.mysqlConnection = {
        status: 'error',
        message: 'MySQL connection failed',
        error: error.message
      };
    }

    // 2. Test Database Exists
    console.log('Testing database existence...');
    try {
      const dbTest = await query('SELECT DATABASE() as db_name');
      results.tests.databaseExists = {
        status: 'success',
        database: dbTest[0],
        message: 'Database connected'
      };
    } catch (error: any) {
      results.tests.databaseExists = {
        status: 'error',
        error: error.message
      };
    }

    // 3. Test Tables Exist
    console.log('Testing tables...');
    try {
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY table_name
      `);
      results.tests.tablesExist = {
        status: 'success',
        count: tables.length,
        tables: tables.map((t: any) => t.table_name || t.TABLE_NAME)
      };
    } catch (error: any) {
      results.tests.tablesExist = {
        status: 'error',
        error: error.message
      };
    }

    // 4. Test Table Data
    console.log('Testing table data...');
    try {
      const opdCount = await query('SELECT COUNT(*) as count FROM opds');
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      const appCount = await query('SELECT COUNT(*) as count FROM applications');
      const domainCount = await query('SELECT COUNT(*) as count FROM domains');
      
      results.tests.tableData = {
        status: 'success',
        opds: opdCount[0].count,
        users: userCount[0].count,
        applications: appCount[0].count,
        domains: domainCount[0].count
      };
    } catch (error: any) {
      results.tests.tableData = {
        status: 'error',
        error: error.message
      };
    }

    // 5. Test User Service
    console.log('Testing UserService...');
    try {
      const userService = new UserService();
      const usersResult = await userService.getUsers(1, 10);
      results.tests.userService = {
        status: 'success',
        totalUsers: usersResult.total,
        usersReturned: usersResult.users.length,
        sampleUser: usersResult.users[0] || null
      };
    } catch (error: any) {
      results.tests.userService = {
        status: 'error',
        error: error.message,
        stack: error.stack
      };
    }

    // 6. Test Domain Service
    console.log('Testing DomainService...');
    try {
      const domainService = new DomainService();
      const domainsResult = await domainService.getDomains(1, 10);
      results.tests.domainService = {
        status: 'success',
        totalDomains: domainsResult.total,
        domainsReturned: domainsResult.domains.length,
        sampleDomain: domainsResult.domains[0] || null
      };
    } catch (error: any) {
      results.tests.domainService = {
        status: 'error',
        error: error.message,
        stack: error.stack
      };
    }

    // 7. Test Application Service
    console.log('Testing ApplicationService...');
    try {
      const applicationService = new ApplicationService();
      const appsResult = await applicationService.getApplications(1, 10);
      results.tests.applicationService = {
        status: 'success',
        totalApplications: appsResult.total,
        applicationsReturned: appsResult.applications.length,
        sampleApplication: appsResult.applications[0] || null
      };
    } catch (error: any) {
      results.tests.applicationService = {
        status: 'error',
        error: error.message,
        stack: error.stack
      };
    }

    // Determine overall status
    const failedTests = Object.values(results.tests).filter((test: any) => test.status === 'error');
    results.status = failedTests.length === 0 ? 'all_pass' : 'some_failures';
    results.summary = {
      total: Object.keys(results.tests).length,
      passed: Object.keys(results.tests).length - failedTests.length,
      failed: failedTests.length
    };

    console.log('Test Summary:', results.summary);

    return NextResponse.json(results, { 
      status: failedTests.length === 0 ? 200 : 500 
    });

  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
      results
    }, { status: 500 });
  }
}
