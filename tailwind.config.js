export default {
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        lavender: {
          50: '#F9F6FB',   // Main background
          100: '#EEDAF6',  // Gradient top
          200: '#E6CFF2',  // Light backgrounds
          300: '#C9A3DD',  // Deeper accent
          400: '#6F5A7E',  // Primary CTA
        },
        // Text Colors
        purple: {
          900: '#3A2F45',  // Primary text
          700: '#6B5E75',  // Secondary text
          500: '#9A8FA6',  // Muted text
        },
        // Status Colors (keep subtle)
        success: {
          light: '#D4EDDA',
          DEFAULT: '#86C896',
        },
        warning: {
          light: '#FFF3CD',
          DEFAULT: '#E6D5A8',
        },
        danger: {
          light: '#F8D7DA',
          DEFAULT: '#E89BA3',
        },
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(111, 90, 126, 0.08)',
        'soft-lg': '0 4px 16px rgba(111, 90, 126, 0.12)',
      },
    },
  },
}