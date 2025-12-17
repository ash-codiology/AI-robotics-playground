import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';

const GITHUB_USERNAME = 'ash-codiology';
const GITHUB_REPO_NAME = 'AI-robotics-playground';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics Course',
  tagline: 'From Digital Minds to Physical Robots',
  favicon: 'img/favicon.ico',

  url: `https://${GITHUB_USERNAME}.github.io`,
  baseUrl: `/${GITHUB_REPO_NAME}/`,

  organizationName: GITHUB_USERNAME,
  projectName: GITHUB_REPO_NAME,

  onBrokenLinks: 'warn',
  markdown: {
    mermaid: true,
    mdx1Compat: {
      comments: true,
      admonitions: true,
      headingIds: true,
    },
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}/edit/main/book`,
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Physical AI & Robotics',
      logo: { alt: 'Logo', src: 'img/logo.svg' },
      items: [
        {
          type: 'dropdown',
          label: 'Tools',
          position: 'left',
          items: [{ label: 'System Test', to: '/system-test' }],
        },
        {
          type: 'dropdown',
          label: 'Account',
          position: 'right',
          items: [
            { label: 'Sign In', to: '/login' },
            { label: 'Sign Up', to: '/login' },
          ],
        },
        { href: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}`, label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Features',
          items: [
            { label: 'Smart Search', to: '/' },
            { label: 'Source Citations', to: '/' },
            { label: 'AI Answers', to: '/' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO_NAME}` },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Documentation', to: '/' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} RAG Chatbot Project. Built with Docusaurus.`,
    },
    algolia: {
      appId: process.env.ALGOLIA_APP_ID || 'YOUR_APP_ID',
      apiKey: process.env.ALGOLIA_SEARCH_API_KEY || 'YOUR_SEARCH_API_KEY',
      indexName: 'rag-chatbot-books',
      contextualSearch: true,
      searchParameters: { facetFilters: ['language:en'] },
      searchPagePath: null,
      searchResultLimits: 8,
      searchResultContextLength: 250,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'diff', 'json'],
    },
  },
};

export default config;
