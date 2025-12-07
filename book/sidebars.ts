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
      items: [
        'module-1-ros2/index',
        'module-2-simulation/index',
        'module-3-isaac/index',
        'module-4-vla/index',
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
    }
  ],
};

export default sidebars;

