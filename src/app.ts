import express from 'express';
const app: any = express();

app.get('/', (req: any, res: any) => {
  res.send('Hello World!');
});

export default app;
