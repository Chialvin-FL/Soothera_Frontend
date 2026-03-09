import { AdminDashboardData } from '../types/adminDashboard';

export const adminDashboardMockData: AdminDashboardData = {
    financial: {
        dailySales: 15450,
        weeklySales: 89200,
        monthlySales: 345000,
        paymentMethods: {
            cash: 125000,
            gcash: 220000,
        },
        topSpenders: [
            {
                id: 'u1',
                name: 'Sarah Johnson',
                amountSpent: 25000,
                avatar: 'https://i.pravatar.cc/150?u=sarah',
            },
            {
                id: 'u2',
                name: 'Michael Chen',
                amountSpent: 18500,
                avatar: 'https://i.pravatar.cc/150?u=michael',
            },
            {
                id: 'u3',
                name: 'Emma Davis',
                amountSpent: 15200,
                avatar: 'https://i.pravatar.cc/150?u=emma',
            },
        ],
    },
    analytics: {
        cancellations: 12,
        noShows: 4,
        walkIn: 85,
        online: 215,
        topCustomers: [
            {
                id: 'u4',
                name: 'David Wilson',
                visitCount: 15,
                avatar: 'https://i.pravatar.cc/150?u=david',
            },
            {
                id: 'u5',
                name: 'Jessica Taylor',
                visitCount: 12,
                avatar: 'https://i.pravatar.cc/150?u=jessica',
            },
            {
                id: 'u1',
                name: 'Sarah Johnson',
                visitCount: 10,
                avatar: 'https://i.pravatar.cc/150?u=sarah',
            },
        ],
        peakTimes: [
            { timeRange: '10:00 AM - 12:00 PM', bookingCount: 45 },
            { timeRange: '02:00 PM - 04:00 PM', bookingCount: 60 },
            { timeRange: '05:00 PM - 07:00 PM', bookingCount: 85 },
        ],
        popularServices: [
            { serviceId: 's1', serviceName: 'Swedish Massage', bookingCount: 120 },
            { serviceId: 's2', serviceName: 'Deep Tissue Massage', bookingCount: 95 },
            { serviceId: 's3', serviceName: 'Hot Stone Therapy', bookingCount: 65 },
            { serviceId: 's4', serviceName: 'Aromatherapy', bookingCount: 40 },
        ],
    },
    staff: [
        {
            id: 't1',
            name: 'Maria Garcia',
            role: 'Senior Therapist',
            avatar: 'https://i.pravatar.cc/150?u=maria',
            rating: 4.9,
            servicesCompleted: 145,
            revenueGenerated: 125000,
        },
        {
            id: 't2',
            name: 'John Smith',
            role: 'Massage Therapist',
            avatar: 'https://i.pravatar.cc/150?u=john',
            rating: 4.7,
            servicesCompleted: 112,
            revenueGenerated: 98000,
        },
        {
            id: 't3',
            name: 'Lisa Wong',
            role: 'Specialist',
            avatar: 'https://i.pravatar.cc/150?u=lisa',
            rating: 4.8,
            servicesCompleted: 130,
            revenueGenerated: 115000,
        },
        {
            id: 't4',
            name: 'James Brown',
            role: 'Therapist',
            avatar: 'https://i.pravatar.cc/150?u=james',
            rating: 4.5,
            servicesCompleted: 85,
            revenueGenerated: 65000,
        },
    ],
};
