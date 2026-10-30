import express from 'express';
import { getWeatherData } from '../services/weatherService.ts';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const location = (req.query.location as string) || 'Nashik';
    const state = (req.query.state as string) || 'Maharashtra';

    const weather = await getWeatherData(location, state);
    return res.json({
      success: true,
      data: weather
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Unable to retrieve agricultural weather forecast.'
    });
  }
});

export default router;
