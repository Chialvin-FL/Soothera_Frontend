export interface FinancialReport {
    dailySales: number;
    weeklySales: number;
    monthlySales: number;
    paymentMethods: {
        cash: number;
        gcash: number;
    };
    topSpenders: Array<{
        id: string;
        name: string;
        amountSpent: number;
        avatar?: string;
    }>;
}

export interface BookingAnalytics {
    cancellations: number;
    noShows: number;
    walkIn: number;
    online: number;
    topCustomers: Array<{
        id: string;
        name: string;
        visitCount: number;
        avatar?: string;
    }>;
    peakTimes: Array<{
        timeRange: string;
        bookingCount: number;
    }>;
    popularServices: Array<{
        serviceId: string;
        serviceName: string;
        bookingCount: number;
    }>;
}

export interface StaffPerformance {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    rating: number;
    servicesCompleted: number;
    revenueGenerated: number;
}

export interface AdminDashboardData {
    financial: FinancialReport;
    analytics: BookingAnalytics;
    staff: StaffPerformance[];
}
