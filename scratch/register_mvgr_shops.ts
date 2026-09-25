import { db } from '../lib/db'
import { jobs } from '../lib/db/schema'

async function registerShops() {
  try {
    const demoEmployerId = 'employer_demo_1'
    const now = Date.now()

    console.log('Registering active MVGR campus shops into database...')

    const newShops = [
      {
        id: `job_active_mvgr_${now}_1`,
        userId: demoEmployerId,
        title: 'MVGR Tech Campus Store & Photocopy Center',
        description: 'Assisting engineering students with lab manual printing, stationery sales, and project report binding at MVGR Main Gate.',
        location: 'Main Gate Shopping Arcade, MVGR Campus, Vizianagaram',
        latitude: 18.0603,
        longitude: 83.4004,
        hourlyRate: '16.00',
        jobType: 'part-time',
        skills: JSON.stringify(['Print Management', 'Customer Service', 'Cashier']),
        status: 'active',
        applicantCount: 2,
      },
      {
        id: `job_active_mvgr_${now}_2`,
        userId: demoEmployerId,
        title: 'MVGR Hostel Coffee & Juice Hub',
        description: 'Managing evening fresh juice preparations, espresso orders, and snack counter billing for hostel residents.',
        location: 'Boys Hostel Ground Floor Arcade, MVGR College',
        latitude: 18.0607,
        longitude: 83.4009,
        hourlyRate: '15.50',
        jobType: 'part-time',
        skills: JSON.stringify(['Barista', 'Beverage Prep', 'Billing']),
        status: 'active',
        applicantCount: 5,
      },
      {
        id: `job_active_mvgr_${now}_3`,
        userId: demoEmployerId,
        title: 'MVGR Central Library Digital Helpdesk',
        description: 'Helping students query IEEE journals, check out library reference laptops, and catalog technical textbooks.',
        location: 'Central Library Block 2nd Floor, MVGR Campus',
        latitude: 18.0597,
        longitude: 83.4014,
        hourlyRate: '19.00',
        jobType: 'part-time',
        skills: JSON.stringify(['Database Search', 'Library Systems', 'Student Support']),
        status: 'active',
        applicantCount: 3,
      },
      {
        id: `job_active_mvgr_${now}_4`,
        userId: demoEmployerId,
        title: 'Chinakondepudi Student Food Court',
        description: 'Managing evening tiffin counters, student order queue management, and digital UPI payment collection.',
        location: 'Chinakondepudi Junction, Near MVGR Main Arch',
        latitude: 18.0588,
        longitude: 83.4022,
        hourlyRate: '17.00',
        jobType: 'part-time',
        skills: JSON.stringify(['UPI Payments', 'Food Counter', 'Order Management']),
        status: 'active',
        applicantCount: 1,
      },
      {
        id: `job_active_mvgr_${now}_5`,
        userId: demoEmployerId,
        title: 'MVGR Robotics & Maker Space Assistant',
        description: 'Supervising 3D printing equipment, IoT hardware component kits, and student project prototypes.',
        location: 'Mechanical & Mechatronics Block, MVGR Campus',
        latitude: 18.0594,
        longitude: 83.3998,
        hourlyRate: '22.50',
        jobType: 'contract',
        skills: JSON.stringify(['3D Printing', 'Arduino', 'Raspberry Pi', 'Prototyping']),
        status: 'active',
        applicantCount: 7,
      },
    ]

    await db.insert(jobs).values(newShops)
    console.log('Successfully registered 5 interactive shops around MVGR Hostel!')
    process.exit(0)
  } catch (error) {
    console.error('Error inserting MVGR shops:', error)
    process.exit(1)
  }
}

registerShops()
