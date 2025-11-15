
import type { Scenario } from './types';
import { HeartIcon, CrossIcon, UsersIcon, BookOpenIcon, HospitalIcon, ShieldIcon } from './components/icons';

export const SCENARIOS: Scenario[] = [
  {
    id: 'spiritual_care',
    title: 'Spiritual Care',
    description: 'Holistic health and spiritual well-being',
    icon: HeartIcon,
  },
  {
    id: 'biblical_counseling',
    title: 'Biblical Counseling',
    description: 'Guidance rooted in Scripture',
    icon: BookOpenIcon,
  },
  {
    id: 'crisis_intervention',
    title: 'Crisis Intervention',
    description: 'Grief, illness, and spiritual distress',
    icon: ShieldIcon,
  },
  {
    id: 'family_conflict',
    title: 'Family Conflict',
    description: 'Conflict mediation and family systems',
    icon: UsersIcon,
  },
  {
    id: 'health_ministry',
    title: 'Health Ministry',
    description: 'Health evangelism and addiction recovery',
    icon: HospitalIcon,
  },
    {
    id: 'ethical_dilemmas',
    title: 'Ethical Dilemmas',
    description: 'Applying SDA Church Manual and biblical ethics',
    icon: CrossIcon,
  },
];
