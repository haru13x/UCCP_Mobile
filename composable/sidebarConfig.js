// Mobile sidebar config mirroring web structure; all items public (rule=null)
// Icons use Ionicons/MaterialIcons and routes map to existing mobile screens

export const sidebarConfig = [
    // Management group
       { label: 'Event Map', icon: { type: 'Ionicons', name: 'map-outline', color: '#4c669f' }, route: 'Map', rule: null },
       { label: 'Calendar', icon: { type: 'Ionicons', name: 'calendar-outline', color: '#4c669f' }, route: 'MyCalendar', rule: null },
       { label: 'My Event', icon: { type: 'Ionicons', name: 'calendar', color: '#4c669f' }, route: 'My Event', rule: null },

    // Notifications (replacing Events in Management)
    { label: 'Notifications', icon: { type: 'Ionicons', name: 'notifications-outline', color: '#4c669f' }, route: 'Notifications', rule: null },

    {
        label: 'Management',
        icon: { type: 'Ionicons', name: 'settings-outline', color: '#4c669f' },
        rule: null,
        children: [
            { label: 'Event', icon: { type: 'Ionicons', name: 'calendar-outline', color: '#4c669f' }, route: 'EventManage', rule: null },
            { label: "User's Request", icon: { type: 'Ionicons', name: 'people-outline', color: '#4c669f' }, route: 'RequestRegistration', rule: null },
            // { label: 'Users', icon: { type: 'Ionicons', name: 'people-circle-outline', color: '#4c669f' }, route: null, rule: null, disabled: true },
        ],
    },

    // Settings group
    // {
    //     label: 'Settings',
    //     icon: { type: 'Ionicons', name: 'settings-outline', color: '#4c669f' },
    //     rule: null,
    //     children: [
    //         { label: 'Roles', icon: { type: 'Ionicons', name: 'shield-outline', color: '#4c669f' }, route: null, rule: null, disabled: true },
    //         { label: 'Account Group', icon: { type: 'Ionicons', name: 'people-circle-outline', color: '#4c669f' }, route: null, rule: null, disabled: true },
    //         { label: 'Civil Status', icon: { type: 'Ionicons', name: 'person-outline', color: '#4c669f' }, route: null, rule: null, disabled: true },
    //         { label: 'Nationality', icon: { type: 'Ionicons', name: 'flag-outline', color: '#4c669f' }, route: null, rule: null, disabled: true },
    //         { label: 'Church Location', icon: { type: 'Ionicons', name: 'location-outline', color: '#4c669f' }, route: null, rule: null, disabled: true },
    //     ],
    // },

    // Convenience items (Messenger-style quick access)
    { label: 'Logout', action: 'logout', icon: { type: 'MaterialIcons', name: 'logout', color: '#dc3545' }, rule: null, destructive: true },
];

export default sidebarConfig;