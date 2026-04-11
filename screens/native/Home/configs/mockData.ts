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
    name: 'Grand Royal Spa',
    rating: 4.8,
    location: 'Crowne Garden Hotel, 360 Salinas Dr, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/grand.png'),
    services: ['Thai Massage', 'Aromatherapy', 'Hot Stone Massage', 'Shiatsu']
  },
  {
    id: '2',
    name: 'Serene Wellness Spa',
    rating: 4.6,
    location: '2F, Li center, F. Cabahug St, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/serene.png'),
    services: ['Shiatsu', 'Combination Massage', 'Head, Neck, and Shoulder Massage', 'Foot Massage']
  },
  {
    id: '3',
    name: 'Dream Spa',
    rating: 4.7,
    location: 'F.Cabahug Mabolo, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/dream.png'),
    services: ['Dagdagay', 'Bentosa (Cupping)', 'Combination Massage', 'Swedish Massage']
  },
  {
    id: '4',
    name: '108 SPA',
    rating: 4.8,
    location: 'T. Borces St., Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/108.png'),
    services: ['Swedish Massage', 'Thai Massage', 'Aromatherapy', 'Hot Stone Massage']
  },
  {
    id: '5',
    name: 'Green Orkid Wellness Spa',
    rating: 4.9,
    location: 'Tres Borces Ext, Mabolo, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/green.png'),
    services: ['Aromatherapy', 'Hot Stone Massage', 'Swedish Massage', 'Thai Massage']
  },
  {
    id: '6',
    name: 'Angel\'s Paradise',
    rating: 4.9,
    location: '2nd floor, Allprime Ventures Building, La Guardia St, Salinas Dr, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/angels.png'),
    services: ['Hilot', 'Shiatsu', 'Foot Massage', 'Head, Neck, and Shoulder Massage']
  },
  {
    id: '7',
    name: 'Young Hands Spa',
    rating: 4.8,
    location: 'PADRE ST, 180 TRES BORCES, Mabolo, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/young.png'),
    services: ['Hilot', 'Dagdagay', 'Bentosa (Cupping)', 'Swedish Massage']
  },
  {
    id: '8',
    name: 'Olle Spa',
    rating: 4.7,
    location: 'Paseo Saturnino, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/olle.png'),
    services: ['Thai Massage', 'Aromatherapy', 'Hot Stone Massage', 'Combination Massage']
  },
  {
    id: '9',
    name: 'Selene Spa',
    rating: 4.9,
    location: 'Crossroads, Cebu',
    image: require('../../../../assets/spas/selene.png'),
    services: ['Shiatsu', 'Swedish Massage', 'Foot Massage', 'Head, Neck, and Shoulder Massage']
  },
  {
    id: '10',
    name: 'Spa Del Sur',
    rating: 4.8,
    location: '8VJX+9Q5, SSY BUSINESS CENTER, Salinas Dr, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/spadelsur.png'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
  },
  {
    id: '11',
    name: 'PISIL Traditional Filipino Massage',
    rating: 4.8,
    location: 'Unit 3, Galleria Fuente, Cebu City, 6000',
    image: require('../../../../assets/spas/pisil.png'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
  },
  {
    id: '12',
    name: 'Healing Hands Wellness Spa',
    rating: 4.8,
    location: 'Ground Floor, Mango Square, Gen. Maxilom Ave., Cebu City',
    image: require('../../../../assets/spas/healinghands.png'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
  },
  {
    id: '13',
    name: 'The First Spa and Asian Healing',
    rating: 4.8,
    location: 'Unit 4, ESY bldg, MP Yap st, cor Juana Osmeña St, Cebu City',
    image: require('../../../../assets/spas/first.png'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
  },
  {
    id: '14',
    name: 'Thai Cha Massage',
    rating: 4.8,
    location: '2-14 J. Solon Dr, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/thaicha.png'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
  },
  {
    id: '15',
    name: 'Noble Spa Massage',
    rating: 4.8,
    location: '2nd floor, Archbishop Reyes Ave, Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/noble.png'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
  }
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
      title: 'Massage Specialist',
      image: require('../../../../assets/user.jpg'),
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Esther Howard',
      title: 'Massage Therapist',
      image: require('../../../../assets/user.jpg'),
      rating: 4.9,
    },
    {
      id: '3',
      name: 'Jane Smith',
      title: 'Massage Therapist',
      image: require('../../../../assets/user.jpg'),
      rating: 4.7,
    },
    {
      id: '4',
      name: 'John Doe',
      title: 'Wellness Specialist',
      image: require('../../../../assets/user.jpg'),
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
      comment: 'Good value for money. Highly recommend this massage spa.',
      date: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000), // 2 months ago
    },
  ];

  // Hardcode all details for each salon
  if (salonId === '1') {
    return {
      ...salon,
      description: 'Grand Royal Spa is where elegance meets relaxation. Located in the heart of Cebu City, we specialize in Thai massage and aromatherapy treatments. Our beautifully designed space and expert therapists create an atmosphere of pure luxury and tranquility.',
      address: 'Crowne Garden Hotel, 360 Salinas Dr, Cebu City, 6000 Cebu',
      latitude: 10.3103,
      longitude: 123.9494,
      operatingHours: 'Mon - Sun | 11:00 AM - 01:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09173080192',
      facebookUrl: 'https://www.facebook.com/GlamourHouse',
    };
  }

  if (salonId === '2') {
    return {
      ...salon,
      description: 'Serene Wellness Spa combines Eastern healing wisdom with Western therapeutic techniques. Our Shiatsu specialists and combination massage therapists work together to restore balance to your body and mind. Experience true harmony in the heart of Ayala Center.',
      address: '2F, Li center, F. Cabahug St, Cebu City, 6000 Cebu',
      latitude: 10.3158,
      longitude: 123.8854,
      operatingHours: 'Mon - Sun | 2:00 PM - 12:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09681051515',
      facebookUrl: 'https://www.facebook.com/ZenWellnessCenter',
    };
  }

  if (salonId === '3') {
    return {
      ...salon,
      description: 'Dream Spa brings contemporary spa experiences to Mandaue City. We blend traditional Dagdagay foot therapy with modern combination massages, creating unique treatment protocols tailored to your needs. Our innovative approach has made us a favorite among wellness enthusiasts.',
      address: 'F.Cabahug Mabolo, Cebu City, 6000 Cebu',
      latitude: 10.3333,
      longitude: 123.9333,
      operatingHours: 'Mon - Sun | 24 Hours',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09664905094',
      facebookUrl: 'https://www.facebook.com/StyleStudio',
    };
  }

  if (salonId === '4') {
    return {
      ...salon,
      description: '108 Spa is a luxury wellness destination specializing in premium massage therapies. Our award-winning therapists combine traditional techniques with modern innovations to deliver unparalleled relaxation experiences. With over a decade of excellence, we\'ve perfected the art of therapeutic massage.',
      address: 'T. Borces St., Cebu City, 6000 Cebu',
      latitude: 10.3500,
      longitude: 123.9167,
      operatingHours: 'Mon - Sun | 10:00 AM - 05:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09285555651',
      facebookUrl: 'https://www.facebook.com/MassageSpaElite',
    };
  }

  if (salonId === '5') {
    return {
      ...salon,
      description: 'Green Orkid Wellness Spa offers a peaceful escape from the urban hustle. Our signature hot stone massages and aromatherapy sessions are designed to melt away stress and tension. With convenient location and flexible hours, we make wellness accessible to busy professionals.',
      address: 'Tres Borces Ext, Mabolo, Cebu City, 6000 Cebu',
      latitude: 10.3200,
      longitude: 123.9100,
      operatingHours: 'Mon - Sun | 24 Hours',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09658957058',
      facebookUrl: 'https://www.facebook.com/SerenitySpa',
    };
  }

  if (salonId === '6') {
    return {
      ...salon,
      description: 'Angel\'s Paradise offers a holistic approach to beauty and wellness. Our team of certified specialists provides personalized treatments using organic products and time-tested Filipino healing traditions. Experience authentic Hilot and rejuvenating therapies in our tranquil, modern facility.',
      address: '2nd floor, Allprime Ventures Building, La Guardia St, Salinas Dr, Cebu City, 6000 Cebu',
      latitude: 10.3300,
      longitude: 123.9000,
      operatingHours: 'Mon - Sun | 10:00 AM - 05:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09393362667',
      facebookUrl: 'https://www.facebook.com/BeautyHaven',
    };
  }

  if (salonId === '7') {
    return {
      ...salon,
      description: 'Young Hands Spa specializes in traditional Filipino healing therapies. Our expert practitioners offer authentic Hilot, Dagdagay, and Bentosa treatments passed down through generations. Experience the healing power of traditional medicine in a modern, comfortable setting.',
      address: 'PADRE ST, 180 TRES BORCES, Mabolo, Cebu City, 6000 Cebu',
      latitude: 10.3150,
      longitude: 123.8850,
      operatingHours: 'Mon - Sun | 24 Hours',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09665261602',
      facebookUrl: 'https://www.facebook.com/TranquilTouch',
    };
  }

  if (salonId === '8') {
    return {
      ...salon,
      description: 'Olle Spa is your sanctuary for complete relaxation. Our comprehensive spa menu includes Thai massage, aromatherapy, and hot stone therapies. Each treatment is customized to address your specific wellness goals, ensuring you leave feeling refreshed and renewed.',
      address: 'Paseo Saturnino, Cebu City, 6000 Cebu',
      latitude: 10.3200,
      longitude: 123.8900,
      operatingHours: 'Mon - Sun | 10 AM - 12:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09562206222',
      facebookUrl: 'https://www.facebook.com/BlissfulRetreat',
    };
  }

  if (salonId === '9') {
    return {
      ...salon,
      description: 'Selene Spa at Crossroads brings together the best of multiple massage traditions. Our skilled therapists excel in Shiatsu, Swedish, and specialized foot massage techniques. We believe in creating harmony between body, mind, and spirit through expert touch.',
      address: '8WR9+V75, Banilad, Cebu',
      latitude: 10.3250,
      longitude: 123.9050,
      operatingHours: 'Mon - Sun | 1:00 PM - 12:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09959171277',
      facebookUrl: 'https://www.facebook.com/SeleneSpaOfficial',
    };
  }

  if (salonId === '10') {
    return {
      ...salon,
      description: 'Spa Del Sur combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists. Experience refined luxury and exceptional service in our beautifully appointed JY Square location.',
      address: '8VJX+9Q5, SSY BUSINESS CENTER, Salinas Dr, Cebu City, 6000 Cebu',
      latitude: 10.3350,
      longitude: 123.8950,
      operatingHours: 'Mon - Sun | 1:00 PM - 1:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09618742873',
      facebookUrl: 'https://www.facebook.com/EleganceMassageSpa',
    };
  }

  if (salonId === '11') {
    return {
      ...salon,
      description: 'Pisil Traditional Filipino Massage combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists. Experience refined luxury and exceptional service in our beautifully appointed JY Square location.',
      address: 'Unit 3, Galleria Fuente, Cebu City, 6000',
      latitude: 10.3350,
      longitude: 123.8950,
      operatingHours: 'Mon - Sun | 12:00 PM - 3:00 AM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09694056575',
      facebookUrl: 'https://www.facebook.com/EleganceMassageSpa',
    };
  }

  if (salonId === '12') {
    return {
      ...salon,
      description: 'Healing Hands combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists. Experience refined luxury and exceptional service in our beautifully appointed JY Square location.',
      address: 'Ground Floor, Mango Square, Gen. Maxilom Ave., Cebu City',
      latitude: 10.3350,
      longitude: 123.8950,
      operatingHours: 'Mon - Sun | 24 Hours',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09150441354',
      facebookUrl: 'https://www.facebook.com/EleganceMassageSpa',
    };
  }

  if (salonId === '13') {
    return {
      ...salon,
      description: 'The First Spa and Asian Healing combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists. Experience refined luxury and exceptional service in our beautifully appointed JY Square location.',
      address: 'Unit 4, ESY bldg, MP Yap st, cor Juana Osmeña St, Cebu City',
      latitude: 10.3350,
      longitude: 123.8950,
      operatingHours: 'Mon - Sun | 2:00 PM - 11:30 PM',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09623314535',
      facebookUrl: 'https://www.facebook.com/EleganceMassageSpa',
    };
  }

  if (salonId === '14') {
    return {
      ...salon,
      description: 'Thai Cha Massage combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists. Experience refined luxury and exceptional service in our beautifully appointed JY Square location.',
      address: '2-14 J. Solon Dr, Cebu City, 6000 Cebu',
      latitude: 10.3350,
      longitude: 123.8950,
      operatingHours: 'Mon - Sun | 24 Hours',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09277112292',
      facebookUrl: 'https://www.facebook.com/EleganceMassageSpa',
    };
  }

  if (salonId === '15') {
    return {
      ...salon,
      description: 'Noble Spa Massage combines sophistication with therapeutic excellence. Our Thai massage and hot stone treatments are performed by internationally trained therapists. Experience refined luxury and exceptional service in our beautifully appointed JY Square location.',
      address: '2nd floor, Archbishop Reyes Ave, Cebu City, 6000 Cebu',
      latitude: 10.3350,
      longitude: 123.8950,
      operatingHours: 'Mon - Sun | 24 Hours',
      distance: '15 min • 1.5km',
      reviewCount: 1200,
      therapists: therapists.slice(0, 4),
      reviews: reviews,
      phoneNumber: '09056651615',
      facebookUrl: 'https://www.facebook.com/EleganceMassageSpa',
    };
  }

  return null;
};
