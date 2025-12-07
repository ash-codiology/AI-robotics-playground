import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'From Digital Minds to Physical Robots',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://GITHUB_USERNAME.github.io', // Placeholder: Update with actual GitHub Pages URL
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/physical-ai-robotics-textbook/', // Placeholder: Update with actual GitHub repository name

  // GitHub pages deployment config.
  organizationName: 'GITHUB_USERNAME', // Placeholder: Update with your GitHub org/user name.
  projectName: 'physical-ai-robotics-textbook', // Placeholder: Update with your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
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
          editUrl:
            'https://github.com/GITHUB_USERNAME/physical-ai-robotics-textbook/tree/main/book', // Placeholder: Update with your repo
          routeBasePath: '/', // Serve docs from the root
        },
        blog: false, // Disable blog plugin
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
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
        src: 'img/logo.svg', // TODO: Replace with project logo
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'defaultSidebar', // Changed from tutorialSidebar to the actual sidebar ID
          position: 'left',
          label: 'Textbook',
        },
        {
          href: 'https://github.com/GITHUB_USERNAME/physical-ai-robotics-textbook', // Placeholder: Update with your repo
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
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/GITHUB_USERNAME/physical-ai-robotics-textbook',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics. Built with Docusaurus.`,
    },
    // algolia: {
    //   appId: 'YOUR_APP_ID', // TODO: Replace with your Algolia App ID
    //   apiKey: 'YOUR_SEARCH_API_KEY', // TODO: Replace with your Algolia Search API Key
    //   indexName: 'YOUR_INDEX_NAME', // TODO: Replace with your Algolia Index Name
    //   contextualSearch: true,
    //   externalUrlRegex: 'external\.com|domain\.com',
    //   searchParameters: {
    //     facetFilters: ['language:en'],
    //   },
    //   searchPagePath: 'search',
    // },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
