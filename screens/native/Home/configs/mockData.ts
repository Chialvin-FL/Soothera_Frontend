import { SpecialDeal, Service, TopRatedSalon } from '../types/Home';
import { SalonDetails } from '../types/SalonDetails';

// Mock data for special deals
export const specialDeals: SpecialDeal[] = [
  { id: '1', title: 'Get Special Discount.', discount: '40', tag: 'Limited time!' },
  { id: '2', title: 'Summer Sale', discount: '30', tag: 'New' },
  { id: '3', title: 'Weekend Special', discount: '25', tag: 'Hot' },
];

// Mock data for services
export const services: Service[] = [
  { 
    id: '1', 
    name: 'Hilot', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 200,
    description: 'Traditional Filipino healing massage using warmed banana leaves and virgin coconut oil to soothe muscles and relieve tension.',
    duration: ['30 mins', '60 mins', '90 mins']
  },
  { 
    id: '2', 
    name: 'Dagdagay', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 200,
    description: 'An ancient Filipino foot massage technique that uses bamboo sticks to stimulate pressure points.',
    duration: ['30 mins', '45 mins']
  },
  { 
    id: '3', 
    name: 'Bentosa (Cupping)', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 400,
    description: 'A traditional method using heated cups to create suction on the skin, drawing out toxins and improving blood flow.',
    duration: ['30 mins', '60 mins']
  },
  { 
    id: '4', 
    name: 'Swedish Massage', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 250,
    description: 'The most common type of massage, known for relaxation and improving circulation with long, flowing strokes.',
    duration: ['30 mins', '60 mins', '90 mins']
  },
  { 
    id: '5', 
    name: 'Shiatsu', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 300,
    description: 'A Japanese massage that uses pressure with fingers, thumbs, and palms on acupuncture points to balance energy flow.',
    duration: ['60 mins', '90 mins']
  },
  { 
    id: '6', 
    name: 'Thai Massage', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 350,
    description: 'An ancient healing system combining acupressure, Indian Ayurvedic principles, and assisted yoga postures.',
    duration: ['60 mins', '90 mins', '120 mins']
  },
  { 
    id: '7', 
    name: 'Aromatherapy Massage', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 600,
    description: 'Uses essential oils in conjunction with a gentle massage to enhance relaxation and therapeutic benefits.',
    duration: ['60 mins', '75 mins']
  },
  { 
    id: '8', 
    name: 'Hot Stone Massage', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 650,
    description: 'Smooth, heated stones are placed on the body and used as massage tools to deeply relax muscles.',
    duration: ['60 mins', '75 mins']
  },
  { 
    id: '9', 
    name: 'Combination Massage', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 750,
    description: 'Combines techniques from multiple massage styles to address individual needs and preferences.',
    duration: ['60 mins', '90 mins']
  },
  { 
    id: '10', 
    name: 'Head, Neck, and Shoulder Massage', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 350,
    description: 'Focused relief for tension and stress in the upper body, ideal for quick relaxation.',
    duration: ['30 mins', '45 mins']
  },
  { 
    id: '11', 
    name: 'Foot Massage / Reflexology', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 200,
    description: 'Therapeutic massage focusing on pressure points in the feet to promote overall body wellness.',
    duration: ['35 mins', '45 mins']
  },
  { 
    id: '12', 
    name: 'Deep Tissue Therapy', 
    image: require('../../../../assets/home-massage-spain.jpg'),
    price: 700,
    description: 'A focused massage technique that targets deeper layers of muscles and connective tissue to relieve chronic tension.',
    duration: ['60 mins', '90 mins']
  },
];

// Mock data for top rated salons
export const topRatedSalons: TopRatedSalon[] = [
  { 
    id: '1', 
    name: 'Salon Elite', 
    rating: 4.8, 
    location: 'Talamban, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Swedish Massage', 'Thai Massage', 'Aromatherapy', 'Hot Stone Massage']
  },
  { 
    id: '2', 
    name: 'Beauty Haven', 
    rating: 4.9, 
    location: 'Banilad, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Hilot', 'Shiatsu', 'Foot Massage', 'Head, Neck, and Shoulder Massage']
  },
  { 
    id: '3', 
    name: 'Style Studio', 
    rating: 4.7, 
    location: 'Mandaue City, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Dagdagay', 'Bentosa (Cupping)', 'Combination Massage', 'Swedish Massage']
  },
  { 
    id: '4', 
    name: 'Glamour House', 
    rating: 4.8, 
    location: 'Lapu-Lapu City, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Thai Massage', 'Aromatherapy', 'Hot Stone Massage', 'Shiatsu']
  },
  { 
    id: '5', 
    name: 'Serenity Spa', 
    rating: 4.9, 
    location: 'IT Park, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Aromatherapy', 'Hot Stone Massage', 'Swedish Massage', 'Thai Massage']
  },
  { 
    id: '6', 
    name: 'Zen Wellness Center', 
    rating: 4.6, 
    location: 'Ayala Center, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Shiatsu', 'Combination Massage', 'Head, Neck, and Shoulder Massage', 'Foot Massage']
  },
  { 
    id: '7', 
    name: 'Tranquil Touch', 
    rating: 4.8, 
    location: 'SM City, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Hilot', 'Dagdagay', 'Bentosa (Cupping)', 'Swedish Massage']
  },
  { 
    id: '8', 
    name: 'Blissful Retreat', 
    rating: 4.7, 
    location: 'Robinsons, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Thai Massage', 'Aromatherapy', 'Hot Stone Massage', 'Combination Massage']
  },
  { 
    id: '9', 
    name: 'Harmony Spa', 
    rating: 4.9, 
    location: 'Crossroads, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Shiatsu', 'Swedish Massage', 'Foot Massage', 'Head, Neck, and Shoulder Massage']
  },
  { 
    id: '10', 
    name: 'Elegance Salon', 
    rating: 4.8, 
    location: 'JY Square, Cebu', 
    image: require('../../../../assets/salon.jpg'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
  },
];

// Helper function to get salon details by ID
export const getSalonDetails = (salonId: string): SalonDetails | null => {
  const salon = topRatedSalons.find(s => s.id === salonId);
  if (!salon) return null;

  // Mock therapist data
  const therapists = [
    {
      id: '1',
      name: 'Kathryn Murphy',
      title: 'Hair Stylist',
      image: require('../../../../assets/pfp.jpg'),
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Esther Howard',
      title: 'Nail Artist',
      image: require('../../../../assets/pfp.jpg'),
      rating: 4.9,
    },
    {
      id: '3',
      name: 'Jane Smith',
      title: 'Massage Therapist',
      image: require('../../../../assets/pfp.jpg'),
      rating: 4.7,
    },
    {
      id: '4',
      name: 'John Doe',
      title: 'Beauty Specialist',
      image: require('../../../../assets/pfp.jpg'),
      rating: 4.8,
    },
  ];

  // Mock reviews
  const reviews = [
    {
      userName: 'Sarah Johnson',
      rating: 5.0,
      comment: 'Excellent service! The staff was very professional and the atmosphere was relaxing.',
      date: new Date(Date.now() - 11 * 30 * 24 * 60 * 60 * 1000), // 11 months ago
    },
    {
      userName: 'Michael Chen',
      rating: 4.5,
      comment: 'Great experience overall. Would definitely come back again.',
      date: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000), // 3 months ago
    },
    {
      userName: 'Emily Davis',
      rating: 4.8,
      comment: 'The therapists are skilled and the facility is clean and well-maintained.',
      date: new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000), // 7 months ago
    },
    {
      userName: 'David Wilson',
      rating: 4.7,
      comment: 'Good value for money. Highly recommend this salon.',
      date: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000), // 2 months ago
    },
  ];

  // Hardcode all details for each salon
  if (salonId === '1') {
    return {
      ...salon,
      description: 'Salon Elite is a luxury wellness destination specializing in premium massage therapies. Our award-winning therapists combine traditional techniques with modern innovations to deliver unparalleled relaxation experiences. With over a decade of excellence, we\'ve perfected the art of therapeutic massage.',
      address: '8502 Preston Rd. Inglewood, Maine 98380',
      latitude: 10.3500,
      longitude: 123.9167,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/SalonElite',
    };
  }

  if (salonId === '2') {
    return {
      ...salon,
      description: 'Beauty Haven offers a holistic approach to beauty and wellness. Our team of certified specialists provides personalized treatments using organic products and time-tested Filipino healing traditions. Experience authentic Hilot and rejuvenating therapies in our tranquil, modern facility.',
      address: '123 Banilad Road, Cebu City 6000',
      latitude: 10.3300,
      longitude: 123.9000,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/BeautyHaven',
    };
  }

  if (salonId === '3') {
    return {
      ...salon,
      description: 'Style Studio brings contemporary spa experiences to Mandaue City. We blend traditional Dagdagay foot therapy with modern combination massages, creating unique treatment protocols tailored to your needs. Our innovative approach has made us a favorite among wellness enthusiasts.',
      address: '456 Mandaue Avenue, Mandaue City 6014',
      latitude: 10.3333,
      longitude: 123.9333,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/StyleStudio',
    };
  }

  if (salonId === '4') {
    return {
      ...salon,
      description: 'Glamour House is where elegance meets relaxation. Located in the heart of Lapu-Lapu City, we specialize in Thai massage and aromatherapy treatments. Our beautifully designed space and expert therapists create an atmosphere of pure luxury and tranquility.',
      address: '789 Lapu-Lapu Street, Lapu-Lapu City 6015',
      latitude: 10.3103,
      longitude: 123.9494,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/GlamourHouse',
    };
  }

  if (salonId === '5') {
    return {
      ...salon,
      description: 'Serenity Spa at IT Park offers a peaceful escape from the urban hustle. Our signature hot stone massages and aromatherapy sessions are designed to melt away stress and tension. With convenient location and flexible hours, we make wellness accessible to busy professionals.',
      address: '321 IT Park Boulevard, Cebu City 6000',
      latitude: 10.3200,
      longitude: 123.9100,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/SerenitySpa',
    };
  }

  if (salonId === '6') {
    return {
      ...salon,
      description: 'Zen Wellness Center combines Eastern healing wisdom with Western therapeutic techniques. Our Shiatsu specialists and combination massage therapists work together to restore balance to your body and mind. Experience true harmony in the heart of Ayala Center.',
      address: '654 Ayala Center, Cebu City 6000',
      latitude: 10.3158,
      longitude: 123.8854,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/ZenWellnessCenter',
    };
  }

  if (salonId === '7') {
    return {
      ...salon,
      description: 'Tranquil Touch specializes in traditional Filipino healing therapies. Our expert practitioners offer authentic Hilot, Dagdagay, and Bentosa treatments passed down through generations. Experience the healing power of traditional medicine in a modern, comfortable setting.',
      address: '987 SM City Cebu, North Reclamation Area, Cebu City 6000',
      latitude: 10.3150,
      longitude: 123.8850,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/TranquilTouch',
    };
  }

  if (salonId === '8') {
    return {
      ...salon,
      description: 'Blissful Retreat is your sanctuary for complete relaxation. Our comprehensive spa menu includes Thai massage, aromatherapy, and hot stone therapies. Each treatment is customized to address your specific wellness goals, ensuring you leave feeling refreshed and renewed.',
      address: '147 Robinsons Place, Cebu City 6000',
      latitude: 10.3200,
      longitude: 123.8900,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/BlissfulRetreat',
    };
  }

  if (salonId === '9') {
    return {
      ...salon,
      description: 'Harmony Spa at Crossroads brings together the best of multiple massage traditions. Our skilled therapists excel in Shiatsu, Swedish, and specialized foot massage techniques. We believe in creating harmony between body, mind, and spirit through expert touch.',
      address: '258 Crossroads Mall, Banilad, Cebu City 6000',
      latitude: 10.3250,
      longitude: 123.9050,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/HarmonySpa',
    };
  }

  if (salonId === '10') {
    return {
      ...salon,
      description: 'Elegance Salon combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists. Experience refined luxury and exceptional service in our beautifully appointed JY Square location.',
      address: '369 JY Square, Lahug, Cebu City 6000',
      latitude: 10.3350,
      longitude: 123.8950,
      operatingHours: 'Mon - Sun | 11 am - 11pm',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '+63 912 345 6789',
      facebookUrl: 'https://www.facebook.com/EleganceSalon',
    };
  }

  return null;
};
