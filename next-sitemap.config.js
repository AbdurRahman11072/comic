/** @type {import('next-sitemap').IConfig} */
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');

module.exports = {
  siteUrl: siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
    additionalSitemaps: siteUrl ? [`${siteUrl}/sitemap.xml`] : []
  }
};
