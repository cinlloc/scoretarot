import type { Config } from "@react-router/dev/config";

const mode = process.env.NODE_ENV || 'development';

export default {
  ssr: false,
  basename: mode === 'development' ? '/' : '/scoretarot/',
} satisfies Config;
