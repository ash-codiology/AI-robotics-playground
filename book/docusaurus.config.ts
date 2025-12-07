import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const GITHUB_USERNAME = 'physical-ai-community';
const GITHUB_REPO_NAME = 'physical-ai-robotics-textbook';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'From Digital Minds to Physical Robots',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: `https://${GITHUB_USERNAME}.github.io`,
  baseUrl: `/${GITHUB_REPO_NAME}/`,

  organizationName: GITHUB_USERNAME,
  projectName: GITHUB_REPO_NAME,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/tree/main/book`,
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Robotics',
      logo: {
        alt: 'Physical AI & Humanoid Robotics Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'defaultSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {
          href: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/introduction',
            },
            {
              label: 'ROS 2',
              to: '/module-1-ros2',
            },
            {
              label: 'Simulation',
              to: '/module-2-simulation',
            },
            {
              label: 'Isaac',
              to: '/module-3-isaac',
            },
            {
              label: 'VLA',
              to: '/module-4-vla',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/ros2',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/robotics',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}`,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI Community. Built with Docusaurus.`,
    },
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'physical-ai-robotics',
      contextualSearch: true,
      searchParameters: {
        facetFilters: ['language:en'],
      },
      searchPagePath: 'search',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

