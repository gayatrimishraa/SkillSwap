import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Job from './models/Job.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';

const INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Goa', 'Kashmir'
];

// Provider companies per city
const PROVIDERS_PER_CITY = {
  'Delhi': { name: 'Delhi BuildTech Pvt. Ltd.', email: 'provider-delhi@skillswap.in' },
  'Mumbai': { name: 'Mumbai Infra Solutions', email: 'provider-mumbai@skillswap.in' },
  'Bangalore': { name: 'Bangalore Digital Works', email: 'provider-bangalore@skillswap.in' },
  'Hyderabad': { name: 'Hyderabad Tech Services', email: 'provider-hyderabad@skillswap.in' },
  'Chennai': { name: 'Chennai Industrial Corp.', email: 'provider-chennai@skillswap.in' },
  'Kolkata': { name: 'Kolkata Heritage Builders', email: 'provider-kolkata@skillswap.in' },
  'Pune': { name: 'Pune Innovation Hub', email: 'provider-pune@skillswap.in' },
  'Goa': { name: 'Goa Coastal Services', email: 'provider-goa@skillswap.in' },
  'Kashmir': { name: 'Kashmir Valley Enterprises', email: 'provider-kashmir@skillswap.in' },
};

// Worker users per city
const WORKERS_PER_CITY = {
  'Delhi': [
    { name: 'Aarav Sharma', email: 'aarav.delhi@skillswap.in', skills: ['electrical', 'wiring', 'safety'] },
    { name: 'Priya Gupta', email: 'priya.delhi@skillswap.in', skills: ['react', 'javascript', 'frontend'] },
  ],
  'Mumbai': [
    { name: 'Rohan Patil', email: 'rohan.mumbai@skillswap.in', skills: ['plumbing', 'pipe-fitting', 'residential'] },
    { name: 'Sneha Desai', email: 'sneha.mumbai@skillswap.in', skills: ['design', 'ui', 'ux', 'figma'] },
  ],
  'Bangalore': [
    { name: 'Kiran Reddy', email: 'kiran.blr@skillswap.in', skills: ['node', 'express', 'backend'] },
    { name: 'Meera Nair', email: 'meera.blr@skillswap.in', skills: ['react', 'typescript', 'frontend'] },
  ],
  'Hyderabad': [
    { name: 'Vikram Rao', email: 'vikram.hyd@skillswap.in', skills: ['carpentry', 'wood', 'cabinetry'] },
    { name: 'Anjali Singh', email: 'anjali.hyd@skillswap.in', skills: ['data', 'typing', 'admin'] },
  ],
  'Chennai': [
    { name: 'Suresh Kumar', email: 'suresh.chennai@skillswap.in', skills: ['electrical', 'solar', 'installation'] },
    { name: 'Deepa Iyer', email: 'deepa.chennai@skillswap.in', skills: ['writing', 'blog', 'tech'] },
  ],
  'Kolkata': [
    { name: 'Arjun Banerjee', email: 'arjun.kol@skillswap.in', skills: ['landscaping', 'gardening', 'labor'] },
    { name: 'Ritika Sen', email: 'ritika.kol@skillswap.in', skills: ['design', 'graphic', 'illustration'] },
  ],
  'Pune': [
    { name: 'Omkar Joshi', email: 'omkar.pune@skillswap.in', skills: ['node', 'express', 'backend'] },
    { name: 'Kavita Kulkarni', email: 'kavita.pune@skillswap.in', skills: ['driving', 'logistics', 'delivery'] },
  ],
  'Goa': [
    { name: 'Ravi Naik', email: 'ravi.goa@skillswap.in', skills: ['plumbing', 'pipe-fitting', 'residential'] },
    { name: 'Sunita D\'Souza', email: 'sunita.goa@skillswap.in', skills: ['cooking', 'hospitality', 'catering'] },
  ],
  'Kashmir': [
    { name: 'Faisal Mir', email: 'faisal.kashmir@skillswap.in', skills: ['carpentry', 'wood', 'handicraft'] },
    { name: 'Zaira Bhat', email: 'zaira.kashmir@skillswap.in', skills: ['embroidery', 'textile', 'handloom'] },
  ],
};

// 6 jobs per city — realistic Indian job postings
const JOBS_PER_CITY = {
  'Delhi': [
    { title: 'Commercial Wiring Specialist', description: 'Need an experienced electrician to upgrade wiring for a new commercial space in Connaught Place. Must adhere to BIS safety standards.', budget: 8000, skillsRequired: ['electrical', 'wiring', 'safety'] },
    { title: 'React Developer for E-commerce Portal', description: 'Build a responsive e-commerce dashboard with React and Redux for a Karol Bagh retailer.', budget: 18000, skillsRequired: ['react', 'javascript', 'frontend'] },
    { title: 'Office Interior Painter', description: 'Paint and finish 3 floors of a Nehru Place office complex. Must bring own equipment.', budget: 6000, skillsRequired: ['painting', 'interior', 'labor'] },
    { title: 'AC Installation & Repair Technician', description: 'Install split ACs across a new residential complex in Dwarka. 20+ units.', budget: 12000, skillsRequired: ['electrical', 'hvac', 'installation'] },
    { title: 'Data Entry Operator', description: 'Digitize 2000+ government records for a Lajpat Nagar office. Fast typing required.', budget: 4500, skillsRequired: ['data', 'typing', 'admin'] },
    { title: 'Delivery Driver - South Delhi Route', description: 'Dedicated daily delivery route covering South Delhi zones. Must have own two-wheeler.', budget: 5000, skillsRequired: ['driving', 'logistics', 'delivery'] },
  ],
  'Mumbai': [
    { title: 'Plumbing System Overhaul', description: 'Complete plumbing renovation for a Bandra residential society. 50 flats need pipe replacement.', budget: 15000, skillsRequired: ['plumbing', 'pipe-fitting', 'residential'] },
    { title: 'Lead UI/UX Designer', description: 'Revamp the dashboard for a Powai-based fintech startup. Figma expertise mandatory.', budget: 20000, skillsRequired: ['design', 'ui', 'ux', 'figma'] },
    { title: 'Construction Site Supervisor', description: 'Supervise a 12-floor building project in Thane. 6-month contract.', budget: 15000, skillsRequired: ['construction', 'supervision', 'safety'] },
    { title: 'Content Writer for Real Estate Blog', description: 'Write property market analysis articles for a Worli real estate firm.', budget: 6000, skillsRequired: ['writing', 'blog', 'real-estate'] },
    { title: 'Electrician for Film Set', description: 'Temporary electrical setup for a Bollywood film shoot in Goregaon Film City.', budget: 7500, skillsRequired: ['electrical', 'wiring', 'temporary'] },
    { title: 'Restaurant Kitchen Helper', description: 'Assist in a busy Colaba restaurant kitchen. Evening shifts. Experience preferred.', budget: 4000, skillsRequired: ['cooking', 'hospitality', 'labor'] },
  ],
  'Bangalore': [
    { title: 'Full Stack Developer', description: 'Build microservices with Node.js and React for a Whitefield tech startup. Remote-friendly within Bangalore.', budget: 25000, skillsRequired: ['node', 'react', 'fullstack'] },
    { title: 'Mobile App Developer (React Native)', description: 'Develop a cross-platform delivery app for a Koramangala-based logistics company.', budget: 22000, skillsRequired: ['react-native', 'javascript', 'mobile'] },
    { title: 'Office Network Setup', description: 'Configure LAN, WiFi, and server room for a new office in Electronic City.', budget: 10000, skillsRequired: ['networking', 'it', 'installation'] },
    { title: 'Graphic Designer for Branding', description: 'Create brand identity for a HSR Layout café chain. Logo, menu, and social media kit.', budget: 8000, skillsRequired: ['design', 'graphic', 'branding'] },
    { title: 'Carpenter for Co-working Space', description: 'Custom desks and partitions for a new co-working space in Indiranagar.', budget: 12000, skillsRequired: ['carpentry', 'wood', 'furniture'] },
    { title: 'Security System Installation', description: 'Install CCTV and access control for a gated community in Sarjapur Road.', budget: 9000, skillsRequired: ['electrical', 'security', 'installation'] },
  ],
  'Hyderabad': [
    { title: 'Custom Furniture Maker', description: 'Build bespoke teak furniture for a Jubilee Hills villa. Must have portfolio.', budget: 14000, skillsRequired: ['carpentry', 'wood', 'cabinetry'] },
    { title: 'Python Data Analyst', description: 'Analyze sales data for a HITEC City retail chain. 3-month contract.', budget: 18000, skillsRequired: ['python', 'data', 'analytics'] },
    { title: 'House Painting - Full Interior', description: 'Asian Paints finish for a 4BHK flat in Gachibowli. Premium quality expected.', budget: 7000, skillsRequired: ['painting', 'interior', 'residential'] },
    { title: 'Catering for Corporate Event', description: 'Provide vegetarian and non-veg catering for a 200-person event in Banjara Hills.', budget: 12000, skillsRequired: ['cooking', 'catering', 'hospitality'] },
    { title: 'Civil Engineering Surveyor', description: 'Land survey for a new township project near Shamshabad airport.', budget: 10000, skillsRequired: ['civil', 'surveying', 'engineering'] },
    { title: 'Backend Developer (Java/Spring)', description: 'Maintain and extend REST APIs for a Madhapur-based SaaS company.', budget: 20000, skillsRequired: ['java', 'spring', 'backend'] },
  ],
  'Chennai': [
    { title: 'Solar Panel Installation', description: 'Install 15kW rooftop solar system for a factory in Ambattur Industrial Estate.', budget: 12000, skillsRequired: ['solar', 'electrical', 'installation'] },
    { title: 'Tamil-English Content Writer', description: 'Write bilingual tech articles for a T. Nagar media agency.', budget: 5000, skillsRequired: ['writing', 'blog', 'tech'] },
    { title: 'Marine Engine Mechanic', description: 'Repair and maintain outboard motors at Royapuram fishing harbour.', budget: 8000, skillsRequired: ['mechanical', 'engine', 'marine'] },
    { title: 'Warehouse Manager', description: 'Oversee inventory and shipping at a Guindy logistics warehouse.', budget: 10000, skillsRequired: ['logistics', 'inventory', 'management'] },
    { title: 'Residential Electrical Re-wiring', description: 'Complete re-wiring of a heritage house in Mylapore. Must follow safety codes.', budget: 6500, skillsRequired: ['electrical', 'wiring', 'residential'] },
    { title: 'Web Developer for Temple Website', description: 'Build an informational site with donation gateway for a Triplicane temple trust.', budget: 5000, skillsRequired: ['html', 'javascript', 'frontend'] },
  ],
  'Kolkata': [
    { title: 'Garden Landscaping Designer', description: 'Design and execute terrace garden for a Salt Lake City apartment block.', budget: 7000, skillsRequired: ['landscaping', 'gardening', 'design'] },
    { title: 'Illustration Artist for Book', description: 'Create 30 watercolor illustrations for a children\'s book publisher in College Street.', budget: 9000, skillsRequired: ['illustration', 'art', 'design'] },
    { title: 'Plumbing for Heritage Building', description: 'Careful plumbing work in a heritage mansion in North Kolkata. Preservation rules apply.', budget: 8000, skillsRequired: ['plumbing', 'pipe-fitting', 'heritage'] },
    { title: 'Event Decorator - Durga Puja', description: 'Decorate a pandal in Gariahat for the upcoming festival season. Creative flair needed.', budget: 10000, skillsRequired: ['decoration', 'event', 'creative'] },
    { title: 'Bengali Food Blogger', description: 'Write weekly food reviews and recipes for a Park Street food magazine.', budget: 3500, skillsRequired: ['writing', 'food', 'blog'] },
    { title: 'AC Duct Cleaning Specialist', description: 'Clean and service central AC ducts in a Rajarhat IT park.', budget: 5500, skillsRequired: ['hvac', 'cleaning', 'maintenance'] },
  ],
  'Pune': [
    { title: 'Node.js API Developer', description: 'Migrate REST APIs to GraphQL for a Hinjewadi IT company. 2-month contract.', budget: 20000, skillsRequired: ['node', 'express', 'graphql'] },
    { title: 'Courier Delivery Partner', description: 'Handle daily last-mile deliveries across Kothrud and Shivaji Nagar zones.', budget: 4500, skillsRequired: ['driving', 'logistics', 'delivery'] },
    { title: 'Gym Equipment Installer', description: 'Assemble and install commercial gym equipment at a new fitness center in Viman Nagar.', budget: 6000, skillsRequired: ['mechanical', 'installation', 'labor'] },
    { title: 'Digital Marketing Executive', description: 'Run social media campaigns for a Koregaon Park restaurant chain.', budget: 8000, skillsRequired: ['marketing', 'social-media', 'digital'] },
    { title: 'Waterproofing Contractor', description: 'Apply waterproof coating to terraces of a 3-tower housing society in Wakad.', budget: 11000, skillsRequired: ['construction', 'waterproofing', 'labor'] },
    { title: 'DevOps Engineer', description: 'Set up CI/CD pipelines and K8s clusters for a Magarpatta tech firm.', budget: 22000, skillsRequired: ['devops', 'docker', 'kubernetes'] },
  ],
  'Goa': [
    { title: 'Beach Shack Plumber', description: 'Fix water supply and drainage for 5 shacks along Baga Beach before tourist season.', budget: 5500, skillsRequired: ['plumbing', 'pipe-fitting', 'commercial'] },
    { title: 'Resort Chef - Continental Cuisine', description: 'Seasonal chef needed for a boutique resort in Calangute. 4-month contract.', budget: 12000, skillsRequired: ['cooking', 'hospitality', 'culinary'] },
    { title: 'Housekeeping Staff Trainer', description: 'Train housekeeping teams at 3 Panjim hotels for premium service standards.', budget: 7000, skillsRequired: ['hospitality', 'training', 'management'] },
    { title: 'Boat Engine Mechanic', description: 'Service and repair outboard motors for a Dona Paula water sports company.', budget: 6500, skillsRequired: ['mechanical', 'engine', 'marine'] },
    { title: 'Villa Interior Designer', description: 'Design interiors for a luxury villa in Assagao. Portuguese-Goan aesthetic.', budget: 18000, skillsRequired: ['design', 'interior', 'architecture'] },
    { title: 'Event DJ & Sound Setup', description: 'Provide DJ and sound system for beach parties in Anjuna. Weekend gigs.', budget: 5000, skillsRequired: ['audio', 'dj', 'event'] },
  ],
  'Kashmir': [
    { title: 'Traditional Woodcarving Artisan', description: 'Carve walnut wood panels for a new houseboat in Dal Lake. Traditional motifs required.', budget: 10000, skillsRequired: ['carpentry', 'wood', 'handicraft'] },
    { title: 'Pashmina Embroiderer', description: 'Hand-embroider 50 pashmina shawls for an export order. Highest quality needlework.', budget: 12000, skillsRequired: ['embroidery', 'textile', 'handloom'] },
    { title: 'Trekking Guide - Gulmarg', description: 'Lead trekking groups on Gulmarg trails. Must be certified and know local terrain.', budget: 6000, skillsRequired: ['guiding', 'trekking', 'outdoor'] },
    { title: 'Apple Orchard Worker', description: 'Seasonal harvesting and packaging at a Shopian apple farm. October-November.', budget: 3500, skillsRequired: ['agriculture', 'harvesting', 'labor'] },
    { title: 'Houseboat Electrician', description: 'Upgrade electrical wiring on 3 houseboats in Nigeen Lake. Solar + inverter setup.', budget: 8000, skillsRequired: ['electrical', 'solar', 'wiring'] },
    { title: 'Saffron Farm Assistant', description: 'Assist with saffron cultivation and processing at a Pampore farm.', budget: 4000, skillsRequired: ['agriculture', 'farming', 'processing'] },
  ],
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // --- Step 1: Update ALL existing users' locations to Indian cities ---
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} existing users. Updating locations...`);
    
    for (let i = 0; i < allUsers.length; i++) {
      const city = INDIAN_CITIES[i % INDIAN_CITIES.length];
      await User.updateOne({ _id: allUsers[i]._id }, { $set: { location: city } });
    }
    console.log('All existing user locations updated to Indian cities.');

    // --- Step 2: Create seed providers (one per city) ---
    const providerMap = {};
    for (const city of INDIAN_CITIES) {
      const pData = PROVIDERS_PER_CITY[city];
      let provider = await User.findOne({ email: pData.email });
      if (!provider) {
        provider = await User.create({
          name: pData.name,
          email: pData.email,
          password: 'password123',
          role: 'provider',
          location: city,
        });
        console.log(`  Created provider: ${pData.name} (${city})`);
      } else {
        await User.updateOne({ _id: provider._id }, { $set: { location: city } });
        console.log(`  Updated provider: ${pData.name} -> ${city}`);
      }
      providerMap[city] = provider;
    }

    // --- Step 3: Create seed workers (2 per city) ---
    for (const city of INDIAN_CITIES) {
      const workers = WORKERS_PER_CITY[city];
      for (const wData of workers) {
        let worker = await User.findOne({ email: wData.email });
        if (!worker) {
          worker = await User.create({
            name: wData.name,
            email: wData.email,
            password: 'password123',
            role: 'worker',
            location: city,
            skills: wData.skills,
          });
          console.log(`  Created worker: ${wData.name} (${city})`);
        } else {
          await User.updateOne({ _id: worker._id }, { $set: { location: city, skills: wData.skills } });
        }
      }
    }

    // --- Step 4: Clear old jobs and seed city-based jobs ---
    await Job.deleteMany({});
    console.log('Cleared all existing jobs.');

    let totalJobs = 0;
    for (const city of INDIAN_CITIES) {
      const provider = providerMap[city];
      const cityJobs = JOBS_PER_CITY[city].map(job => ({
        ...job,
        location: city,
        provider: provider._id,
        providerName: provider.name,
        status: 'Open',
      }));
      await Job.insertMany(cityJobs);
      totalJobs += cityJobs.length;
      console.log(`  Seeded ${cityJobs.length} jobs in ${city}`);
    }

    console.log(`\n✅ Successfully seeded ${totalJobs} jobs across ${INDIAN_CITIES.length} cities.`);
    console.log('✅ All user locations set to Indian cities.');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
