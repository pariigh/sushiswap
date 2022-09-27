// @ts-check
/** @type {import('next-seo').DefaultSeoProps} */
export default {
  titleTemplate: '%s | Sushi',
  title: 'Invest',
  defaultTitle: 'Invest',
  description: 'Earn fees by providing liquidity and staking SUSHI into xSUSHI.',
  //   canonical: 'https://sushi.com/pool',
  //   mobileAlternate: {
  //     media: '',
  //     href: '',
  //   },
  //   languageAlternates: [{ hrefLang: "en", href: "https://sushi.com/pool" }],
  twitter: {
    handle: '@sushiswap',
    site: '@sushiswap',
    cardType: 'summary_large_image',
  },
  openGraph: {
    url: 'https://www.sushi.com/invest',
    type: 'website',
    title: 'Invest',
    description: 'Earn fees by providing liquidity and staking SUSHI into xSUSHI.',
    images: [
      {
        url: 'https://www.sushi.com/invest/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sushi Invest',
      },
    ],
    // videos: [],
    // locale: 'en_IE',
    site_name: 'Sushi',
  },
}
