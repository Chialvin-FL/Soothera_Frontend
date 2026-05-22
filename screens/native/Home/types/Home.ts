import { ImageSourcePropType } from 'react-native';

export interface SpecialDeal {
  id: string;
  title: string;
  discount: string;
  tag: string;
}

export interface Service {
  id: string;
  name: string;
  image: ImageSourcePropType;
  price: number;
  description: string;
  duration: string[]; // e.g., ['30 mins', '60 mins']
}

export interface TopRatedSalon {
  id: string;
  name: string;
  rating: number;
  location: string;
  image: ImageSourcePropType;
  services: string[]; // e.g., ['Swedish Massage', 'Thai Massage', 'Aromatherapy']
  description?: string;
  contactNumber?: string;
  businessHours?: string;
  socials?: string[];
}
