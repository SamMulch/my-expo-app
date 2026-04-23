import { db } from './client';
import { applications, categories, applicationStatusLogs, targets } from './schema';

export async function seedDataIfEmpty() {
  const existingApplications = await db.select().from(applications);
  if (existingApplications.length > 0) {
    console.log('Seed skipped, applications data already exists');
    return;
  }

  console.log('🌱 Seeding database...');

  const insertedCategories = await db.insert(categories).values([
    { name: 'Tech', colour: '#3B82F6', icon: '💻' },
    { name: 'Finance', colour: '#10B981', icon: '🏦' },
    { name: 'Marketing', colour: '#F59E0B', icon: '📣' },
    { name: 'Graduate Roles', colour: '#8B5CF6', icon: '🎓' },
  ]).returning();

  const techId = insertedCategories[0].id;
  const financeId = insertedCategories[1].id;
  const marketingId = insertedCategories[2].id;
  const gradId = insertedCategories[3].id;

  const insertedApplications = await db.insert(applications).values([
    {
      company: 'Google',
      role: 'Software Engineer Intern',
      dateApplied: '2026-04-01',
      applicationCount: 1,
      categoryId: techId,
      currentStatus: 'Interview',
      location: 'Dublin',
      extraContext: 'Applied via careers site',
    },
    {
      company: 'Meta',
      role: 'Frontend Developer',
      dateApplied: '2026-03-28',
      applicationCount: 1,
      categoryId: techId,
      currentStatus: 'Rejected',
      location: 'Remote',
    },
    {
      company: 'Deloitte',
      role: 'Graduate Consultant',
      dateApplied: '2026-03-20',
      applicationCount: 2,
      categoryId: gradId,
      currentStatus: 'Assessment Centre',
      location: 'Dublin',
    },
    {
      company: 'Goldman Sachs',
      role: 'Summer Analyst',
      dateApplied: '2026-03-10',
      applicationCount: 1,
      categoryId: financeId,
      currentStatus: 'Applied',
      location: 'London',
    },
    {
      company: 'HubSpot',
      role: 'Marketing Intern',
      dateApplied: '2026-04-05',
      applicationCount: 1,
      categoryId: marketingId,
      currentStatus: 'Interview',
      location: 'Dublin',
    },
  ]).returning();

  await db.insert(applicationStatusLogs).values([
    {
      applicationId: insertedApplications[0].id,
      status: 'Applied',
      changedAt: '2026-04-01',
      notes: 'Submitted CV',
    },
    {
      applicationId: insertedApplications[0].id,
      status: 'Interview',
      changedAt: '2026-04-10',
      notes: 'Technical interview scheduled',
    },
    {
      applicationId: insertedApplications[1].id,
      status: 'Applied',
      changedAt: '2026-03-28',
    },
    {
      applicationId: insertedApplications[1].id,
      status: 'Rejected',
      changedAt: '2026-04-02',
      notes: 'No feedback provided',
    },
    {
      applicationId: insertedApplications[2].id,
      status: 'Applied',
      changedAt: '2026-03-20',
    },
    {
      applicationId: insertedApplications[2].id,
      status: 'Assessment Centre',
      changedAt: '2026-04-12',
    },
  ]);

  await db.insert(targets).values([
    {
      timespan: 'weekly',
      targetCount: 10,
      categoryId: null,
      startDate: '2026-04-01',
      endDate: '2026-04-07',
    },
    {
      timespan: 'monthly',
      targetCount: 40,
      categoryId: techId,
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    },
    {
      timespan: 'weekly',
      targetCount: 5,
      categoryId: financeId,
      startDate: '2026-04-01',
      endDate: '2026-04-07',
    },
  ]);

  // default weekly target of 10 applications
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // finding whenever sunday is 
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);     // this would then be saturday

  await db.insert(targets).values([
    {
      timespan: 'weekly',
      targetCount: 10,
      categoryId: null,
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
    },
  ]);

  console.log('✅ Seeding complete!');
}