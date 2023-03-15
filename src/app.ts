import express from 'express';
const app: any = express();

app.get('/', (req: any, res: any) => {
  console.log('Hello World!');
  res.send('Hello World!');
});

export default app;
