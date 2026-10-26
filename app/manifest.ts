import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MAGMATI',
    short_name: 'MAGMATI',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#D12929',
    icons: [
      {
        src: '/magmati-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
