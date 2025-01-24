// Add Teams to the navigation items
const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Users', href: '/users', icon: Users, adminOnly: true },
    { name: 'Teams', href: '/teams', icon: Users, staffOnly: true },
    { name: 'Settings', href: '/settings', icon: Settings }
]; 