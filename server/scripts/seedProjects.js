import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.js';
import User from '../models/User.js';

dotenv.config();

const seedProjects = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find some users to assign to projects
    const users = await User.find({ role: { $in: ['manager', 'team_lead', 'employee'] } }).limit(5);
    
    if (users.length === 0) {
      console.log('No users found. Please run the main seed script first.');
      return;
    }

    // Import Team model
    const Team = (await import('../models/Team.js')).default;
    
    // Find existing teams or create a default one
    let teams = await Team.find({});
    
    if (teams.length === 0) {
      console.log('No teams found. Creating a default team...');
      const defaultTeam = new Team({
        name: 'Development Team',
        description: 'Default development team for projects',
        teamLead: users.find(u => u.role === 'team_lead')?._id || users[0]._id,
        manager: users.find(u => u.role === 'manager')?._id || users[0]._id,
        members: users.map(user => ({
          user: user._id,
          role: user.role === 'manager' ? 'lead' : user.role === 'team_lead' ? 'senior' : 'junior',
          status: 'active'
        })),
        department: 'Engineering',
        status: 'active'
      });
      
      await defaultTeam.save();
      teams = [defaultTeam];
      console.log('Created default team');
    }

    // Create default projects (without code to let the pre-save middleware generate it)
    const projects = [
      {
        name: 'General Work',
        description: 'General work activities and tasks',
        client: {
          name: 'Internal',
          email: 'internal@lifeboxnextgen.com',
          company: 'LifeBox NextGen Pvt. Ltd.'
        },
        manager: users.find(u => u.role === 'manager')?._id || users[0]._id,
        team: teams[0]._id,
        assignedMembers: users.map(user => ({
          user: user._id,
          role: user.role === 'manager' ? 'lead' : 'developer'
        })),
        status: 'active',
        priority: 'medium',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: {
          estimated: 100000,
          actual: 0,
          currency: 'INR'
        },
        progress: 0
      },
      {
        name: 'Employee Portal Development',
        description: 'Development and maintenance of the employee portal system',
        client: {
          name: 'LifeBox NextGen',
          email: 'tech@lifeboxnextgen.com',
          company: 'LifeBox NextGen Pvt. Ltd.'
        },
        manager: users.find(u => u.role === 'manager')?._id || users[0]._id,
        team: teams[0]._id,
        assignedMembers: users.filter(u => u.role === 'employee').slice(0, 3).map(user => ({
          user: user._id,
          role: 'developer'
        })),
        status: 'active',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        budget: {
          estimated: 50000,
          actual: 25000,
          currency: 'INR'
        },
        progress: 75
      },
      {
        name: 'Training and Development',
        description: 'Employee training programs and skill development initiatives',
        client: {
          name: 'HR Department',
          email: 'hr@lifeboxnextgen.com',
          company: 'LifeBox NextGen Pvt. Ltd.'
        },
        manager: users.find(u => u.role === 'manager')?._id || users[0]._id,
        team: teams[0]._id,
        assignedMembers: users.map(user => ({
          user: user._id,
          role: 'developer'
        })),
        status: 'active',
        priority: 'medium',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: {
          estimated: 25000,
          actual: 5000,
          currency: 'INR'
        },
        progress: 20
      }
    ];

    // Clear existing projects and drop indexes to avoid conflicts
    await Project.collection.drop().catch(() => console.log('Projects collection did not exist'));
    console.log('Cleared existing projects');

    // Create new projects
    const createdProjects = await Project.create(projects);
    console.log(`Created ${createdProjects.length} projects`);

    console.log('\n✅ Projects seeded successfully!');
    console.log('\n📋 Created Projects:');
    createdProjects.forEach(project => {
      console.log(`- ${project.name} (ID: ${project._id})`);
    });

  } catch (error) {
    console.error('Error seeding projects:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
seedProjects();