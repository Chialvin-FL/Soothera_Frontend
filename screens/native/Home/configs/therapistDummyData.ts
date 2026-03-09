export const therapistPerformanceMockData = {
    totalSessions: 142,
    averageRating: 4.9,
    totalEarnings: 28400,
    completionRate: 98,
    recentReviews: [
        {
            id: '1',
            clientName: 'Alice Johnson',
            rating: 5,
            comment: 'Amazing session, very professional!',
            date: '2024-03-08',
            avatar: 'https://i.pravatar.cc/150?u=alice'
        },
        {
            id: '2',
            clientName: 'Bob Smith',
            rating: 4,
            comment: 'Great technique, helped a lot with my back pain.',
            date: '2024-03-07',
            avatar: 'https://i.pravatar.cc/150?u=bob'
        },
        {
            id: '3',
            clientName: 'Charlie Brown',
            rating: 5,
            comment: 'Best therapist I have had so far.',
            date: '2024-03-05',
            avatar: 'https://i.pravatar.cc/150?u=charlie'
        }
    ],
    sessionStats: [
        { label: 'Mon', count: 4 },
        { label: 'Tue', count: 6 },
        { label: 'Wed', count: 3, isHighlighted: true },
        { label: 'Thu', count: 7 },
        { label: 'Fri', count: 5 },
        { label: 'Sat', count: 8 },
        { label: 'Sun', count: 2 },
    ]
};
