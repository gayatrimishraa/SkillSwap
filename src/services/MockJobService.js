/**
 * Mock Job Service
 * Handles the "Skill Matching" algorithm and mock DB operations for jobs.
 */

const DUMMY_JOBS = [
    {
      id: 1,
      title: "Commercial Wiring Upgrade",
      skillsRequired: ["electrical", "wiring"],
      locationGeo: { lat: 40.7128, lng: -74.0060 }, // Mock coordinates
      budget: 1500,
      status: "Open"
    },
    {
      id: 2,
      title: "Community Center Renovation",
      skillsRequired: ["carpentry", "general"],
      locationGeo: { lat: 40.7300, lng: -73.9900 },
      budget: 5000,
      status: "Open"
    }
  ];
  
  // Haversine formula mock to calculate distance between two lat/lng points
  const calculateDistance = (loc1, loc2) => {
    // Math logic goes here in a real app
    // Mocking distance returning a semi-random value between 1 and 20 km
    return Math.floor(Math.random() * 20) + 1;
  };
  
  export const getRecommendations = (workerProfile) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recommendations = DUMMY_JOBS.map(job => {
          // 1. Calculate Skill Overlap
          const overlap = job.skillsRequired.filter(skill => 
            workerProfile.skills.includes(skill)
          );
          const skillScore = (overlap.length / job.skillsRequired.length) * 100;
  
          // 2. Calculate Distance Radius
          const distance = calculateDistance(workerProfile.locationGeo, job.locationGeo);
  
          // 3. Combine Score Logic (e.g., must have > 50% skill match and within 25km radius)
          const isValidMatch = skillScore >= 50 && distance <= 25;
  
          return {
            ...job,
            skillMatchRate: skillScore,
            distanceKm: distance,
            isValidMatch
          };
        }).filter(job => job.isValidMatch).sort((a, b) => b.skillMatchRate - a.skillMatchRate);
  
        resolve(recommendations);
      }, 500); // Network delay mock
    });
  };
  
