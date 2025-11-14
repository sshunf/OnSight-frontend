// Employee/Worker Management System

export const POSITION_TYPES = {
  MAINTENANCE: 'Maintenance Technician',
  JANITORIAL: 'Janitorial Staff',
  FRONT_DESK: 'Front Desk',
  MANAGEMENT: 'Management',
  TRAINER: 'Personal Trainer',
  GENERAL: 'General Staff'
};

export const EMPLOYEES = [
  {
    id: 'emp_001',
    name: 'Soorya',
    position: POSITION_TYPES.MAINTENANCE,
    certifications: ['HVAC', 'Electrical', 'Equipment Repair'],
    availability: 'Full-time',
    email: 'soorya@onsight.com',
    phone: '555-0101',
    avatar: null
  },
  {
    id: 'emp_002',
    name: 'Angel',
    position: POSITION_TYPES.MAINTENANCE,
    certifications: ['Equipment Repair', 'Plumbing'],
    availability: 'Full-time',
    email: 'angel@onsight.com',
    phone: '555-0102',
    avatar: null
  },
  {
    id: 'emp_003',
    name: 'Matt',
    position: POSITION_TYPES.MANAGEMENT,
    certifications: ['Safety Inspector', 'First Aid'],
    availability: 'Full-time',
    email: 'matt@onsight.com',
    phone: '555-0103',
    avatar: null
  },
  {
    id: 'emp_004',
    name: 'Shun',
    position: POSITION_TYPES.MAINTENANCE,
    certifications: ['Equipment Repair', 'Electronics'],
    availability: 'Full-time',
    email: 'shun@onsight.com',
    phone: '555-0104',
    avatar: null
  },
  {
    id: 'emp_005',
    name: 'Kevin',
    position: POSITION_TYPES.JANITORIAL,
    certifications: ['Cleaning', 'Sanitization'],
    availability: 'Part-time',
    email: 'kevin@onsight.com',
    phone: '555-0105',
    avatar: null
  },
  {
    id: 'emp_006',
    name: 'Matias',
    position: POSITION_TYPES.MAINTENANCE,
    certifications: ['Equipment Repair', 'Welding'],
    availability: 'Full-time',
    email: 'matias@onsight.com',
    phone: '555-0106',
    avatar: null
  },
  {
    id: 'emp_007',
    name: 'Sarah',
    position: POSITION_TYPES.FRONT_DESK,
    certifications: ['Customer Service', 'First Aid'],
    availability: 'Full-time',
    email: 'sarah@onsight.com',
    phone: '555-0107',
    avatar: null
  },
  {
    id: 'emp_008',
    name: 'Marcus',
    position: POSITION_TYPES.JANITORIAL,
    certifications: ['Cleaning', 'Sanitization', 'Waste Management'],
    availability: 'Full-time',
    email: 'marcus@onsight.com',
    phone: '555-0108',
    avatar: null
  },
  {
    id: 'emp_009',
    name: 'Lisa',
    position: POSITION_TYPES.TRAINER,
    certifications: ['CPR', 'Personal Training', 'Equipment Safety'],
    availability: 'Full-time',
    email: 'lisa@onsight.com',
    phone: '555-0109',
    avatar: null
  }
];

// Helper functions
export function getEmployeeByName(name) {
  return EMPLOYEES.find(emp => emp.name.toLowerCase() === name?.toLowerCase());
}

export function getEmployeesByPosition(position) {
  if (!position) return EMPLOYEES;
  return EMPLOYEES.filter(emp => emp.position === position);
}

export function getAllPositions() {
  return Object.values(POSITION_TYPES);
}

export function getPositionColor(position) {
  switch(position) {
    case POSITION_TYPES.MAINTENANCE:
      return '#7c3aed'; // Purple
    case POSITION_TYPES.JANITORIAL:
      return '#22c55e'; // Green
    case POSITION_TYPES.FRONT_DESK:
      return '#3b82f6'; // Blue
    case POSITION_TYPES.MANAGEMENT:
      return '#f59e0b'; // Orange
    case POSITION_TYPES.TRAINER:
      return '#ec4899'; // Pink
    case POSITION_TYPES.GENERAL:
    default:
      return '#94a3b8'; // Gray
  }
}

export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

