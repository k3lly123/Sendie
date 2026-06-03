import dotenv from 'dotenv';

dotenv.config();

if (process.env.DATABASE_URL?.includes('supabase.co') || process.env.DIRECT_URL?.includes('supabase.co')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || '0.0.0.0';

const start = async () => {
  const [{ app }, { closeStore, initStore }] = await Promise.all([
    import('./app'),
    import('./store'),
  ]);

  await initStore();

  const server = app.listen(port, host, () => {
    console.log(`Sendie API listening on http://${host}:${port}`);
  });

  const shutdown = async () => {
    server.close();
    await closeStore();
  };

  process.once('SIGINT', () => {
    void shutdown().finally(() => process.exit(0));
  });

  process.once('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0));
  });
};

void start();
