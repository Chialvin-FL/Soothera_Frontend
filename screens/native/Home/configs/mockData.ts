import { SpecialDeal, Service, TopRatedSalon } from '../types/Home';
import { SalonDetails } from '../types/SalonDetails';
import { getSalonById as apiGetSalonById } from '@/api/endpoints/apiSalonEstablishment';
import type { SalonEstablishment } from '@/api/types';

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
    name: 'The First Spa and Asian Healing',
    rating: 4.8,
    location: 'Unit 4, ESY bldg, MP Yap st, cor Juana Osmeña St, Cebu City',
    image: require('../../../../assets/spas/first.png'),
    services: ['Thai Massage', 'Hot Stone Massage', 'Aromatherapy', 'Hilot']
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
    name: '108 SPA',
    rating: 4.8,
    location: 'T. Borces St., Cebu City, 6000 Cebu',
    image: require('../../../../assets/spas/108.png'),
    services: ['Swedish Massage', 'Thai Massage', 'Aromatherapy', 'Hot Stone Massage']
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
export const getSalonDetails = async (salonId: string): Promise<SalonDetails | null> => {
  try {
    // Prefer real API lookup
    const res = await apiGetSalonById(salonId);
    if (res && res.success && res.data) {
      const est = res.data as SalonEstablishment;
      // Map SalonEstablishment -> SalonDetails (best-effort)
      const mapped: SalonDetails = {
        id: est.id,
        name: est.name ?? 'Unnamed Salon',
        rating: est.rating ?? 0,
        location: est.address ?? '',
        image: est.salonPicture ? { uri: est.salonPicture } : require('../../../../assets/spas/grand.png'),
        services: est.services ?? [],
        description: est.description ?? '',
        address: est.address ?? '',
        latitude: typeof est.latitude === 'number' ? est.latitude : 0,
        longitude: typeof est.longitude === 'number' ? est.longitude : 0,
        operatingHours: est.businessHours ?? 'Hours not available',
        distance: est.distance ?? '',
        reviewCount: est.reviewCount ?? 0,
        therapists: est.therapists ?? [],
        reviews: est.reviews ?? [],
        phoneNumber: est.contactNumber ?? undefined,
        facebookUrl: (est.socials && est.socials.length > 0) ? est.socials[0] : undefined,
      };
      return mapped;
    }
  } catch (err) {
    // fall through to return null so callers can handle
    console.warn('[getSalonDetails] API lookup failed for id=', salonId, err);
  }

  // If API fails or returns nothing, try to fall back to local mock entry
  const salon = topRatedSalons.find(s => s.id === salonId) ?? null;
  if (!salon) return null;

  // Minimal mapping from mock entry
  const fallback: SalonDetails = {
    id: salon.id,
    name: salon.name,
    rating: salon.rating ?? 0,
    location: salon.location ?? '',
    image: salon.image,
    services: salon.services ?? [],
    description: '',
    address: salon.location ?? '',
    latitude: 0,
    longitude: 0,
    operatingHours: 'Hours not available',
    distance: '',
    reviewCount: 0,
    therapists: [],
    reviews: [],
    phoneNumber: undefined,
    facebookUrl: undefined,
  };
  return fallback;
};
