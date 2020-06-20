declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    TEMPLATE_FILE?: string;
    TELEGRAM_TOKEN: string;
    TELEGRAM_ADMINS: string;
    EXTERNAL_URL?: string;
    INTERNAL_URL?: string;
  }
}
