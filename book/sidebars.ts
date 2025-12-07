import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  defaultSidebar: [
    {
      type: 'doc',
      id: 'introduction/index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Modules',
      link: {
        type: 'generated-index',
        title: 'Modules Overview',
        description: 'An overview of all the modules in the course.',
        slug: '/category/modules',
      },
      items: [
        'module-1-ros2/index',
        'module-2-simulation/index',
        'module-3-isaac/index',
        'module-4-vla/index',
        'module-5-foundations-of-embodied-intelligence/index',
        'module-6-cognitive-motion-planning-autonomous-behavior/index',
        'module-7-human-robot-interaction-safety-frameworks/index',
        'module-8-whole-body-kinematics-dynamics-control-systems/index',
      ],
    },
    {
      type: 'category',
      label: 'Appendices',
      items: [
        'appendix/decisions',
        'appendix/tradeoffs',
      ],
    },
    {
      type: 'doc',
      id: 'capstone/capstone',
      label: 'Capstone Project',
    },
    {
      type: 'category',
      label: 'See Also',
      items: [
        {
          type: 'link',
          label: 'Awesome Robotics List',
          href: 'https://github.com/ahundt/awesome-robotics'
        },
        {
          type: 'link',
          label: 'The Robotics Forum',
          href: 'https://robotics.stackexchange.com/'
        },
        {
          type: 'link',
          label: 'Open Robotics',
          href: 'https://www.openrobotics.org/'
        },
      ],
    }
  ],
};

export default sidebars;

