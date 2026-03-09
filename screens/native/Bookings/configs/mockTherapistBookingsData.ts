import { Booking, BOOKING_STATUS } from '../types/Booking';

export const therapistBookings: Booking[] = [
    {
        id: 'tb1',
        serviceName: 'Aromatherapy Massage',
        spaName: 'Tranquil Touch',
        customerName: 'Sarah Jenkins',
        customerImage: require('../../../../assets/user.jpg'),
        status: BOOKING_STATUS.CONFIRMED,
        date: '03/09/2026', // Today
        time: '10:00 AM - 11:00 AM',
        price: 150.00,
    },
    {
        id: 'tb2',
        serviceName: 'Swedish Massage',
        spaName: 'Tranquil Touch',
        customerName: 'James Wilson',
        customerImage: require('../../../../assets/user.jpg'),
        status: BOOKING_STATUS.CONFIRMED,
        date: '03/09/2026', // Today
        time: '01:00 PM - 02:00 PM',
        price: 95.00,
    },
    {
        id: 'tb3',
        serviceName: 'Deep Tissue Therapy',
        spaName: 'Tranquil Touch',
        customerName: 'Michael Chen',
        customerImage: require('../../../../assets/user.jpg'),
        status: BOOKING_STATUS.PENDING,
        date: '03/10/2026', // Tomorrow
        time: '09:00 AM - 10:30 AM',
        price: 180.00,
    },
    {
        id: 'tb4',
        serviceName: 'Hot Stone Massage',
        spaName: 'Tranquil Touch',
        customerName: 'Emma Watson',
        customerImage: require('../../../../assets/user.jpg'),
        status: BOOKING_STATUS.COMPLETED,
        date: '03/08/2026', // Yesterday
        time: '03:00 PM - 04:00 PM',
        price: 120.00,
    },
    {
        id: 'tb5',
        serviceName: 'Foot Reflexology',
        spaName: 'Tranquil Touch',
        customerName: 'Robert Tan',
        customerImage: require('../../../../assets/user.jpg'),
        status: BOOKING_STATUS.CONFIRMED,
        date: '03/12/2026',
        time: '11:00 AM - 12:00 PM',
        price: 80.00,
    },
    {
        id: 'tb6',
        serviceName: 'Aromatherapy Massage',
        spaName: 'Tranquil Touch',
        customerName: 'Anna Garcia',
        customerImage: require('../../../../assets/user.jpg'),
        status: BOOKING_STATUS.CANCELLED,
        date: '03/05/2026',
        time: '10:00 AM - 11:00 AM',
        price: 150.00,
    }
];
