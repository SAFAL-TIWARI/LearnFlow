import express from 'express';
import { fetchResourceStats, fetchUserEngagementStats, calculateAccuracyRate, getRealTimeVisitors } from '../utils/analyticsUtils.js';
import googleAnalyticsService from '../services/googleAnalyticsService.js';

const router = express.Router();

/**
 * Get comprehensive analytics data
 */
router.get('/stats', async (req, res) => {
  try {
    const [resourceStats, engagementStats, accuracyRate, visitorData] = await Promise.all([
      fetchResourceStats(),
      fetchUserEngagementStats(),
      calculateAccuracyRate(),
      getRealTimeVisitors()
    ]);

    const response = {
      success: true,
      data: {
        resources: resourceStats,
        engagement: engagementStats,
        accuracy: accuracyRate,
        visitors: visitorData,
        lastUpdated: new Date().toISOString()
      }
    };

    // Cache for 30 seconds
    res.set('Cache-Control', 'public, max-age=30');
    res.json(response);
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: error.message
    });
  }
});

/**
 * Get real-time visitor count
 */
router.get('/visitors', async (req, res) => {
  try {
    const visitorData = await getRealTimeVisitors();

    res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    res.json({
      success: true,
      data: visitorData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch visitor data',
      message: error.message
    });
  }
});

/**
 * Get resource statistics
 */
router.get('/resources', async (req, res) => {
  try {
    const resourceStats = await fetchResourceStats();

    res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    res.json({
      success: true,
      data: resourceStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resource statistics',
      message: error.message
    });
  }
});

/**
 * Track user interaction
 */
router.post('/track', async (req, res) => {
  try {
    const { actionType, details, userId } = req.body;

    if (!actionType) {
      return res.status(400).json({
        success: false,
        error: 'actionType is required'
      });
    }

    // In a real implementation, you would store this in a database
    // For now, we'll just log it
    console.log('User interaction tracked:', {
      actionType,
      details,
      userId,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track interaction',
      message: error.message
    });
  }
});

/**
 * Get engagement metrics
 */
router.get('/engagement', async (req, res) => {
  try {
    const engagementStats = await fetchUserEngagementStats();

    res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    res.json({
      success: true,
      data: engagementStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching engagement stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch engagement statistics',
      message: error.message
    });
  }
});

/**
 * Get real Google Analytics data
 */
router.get('/google-analytics', async (req, res) => {
  try {
    if (!googleAnalyticsService.isInitialized()) {
      return res.status(503).json({
        success: false,
        error: 'Google Analytics service not available',
        message: 'Service account credentials not configured'
      });
    }

    const analyticsData = await googleAnalyticsService.getComprehensiveAnalytics();

    res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    res.json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Google Analytics data',
      message: error.message
    });
  }
});

/**
 * Get top pages from Google Analytics
 */
router.get('/top-pages', async (req, res) => {
  try {
    if (!googleAnalyticsService.isInitialized()) {
      return res.status(503).json({
        success: false,
        error: 'Google Analytics service not available'
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const topPages = await googleAnalyticsService.getTopPages(limit);

    res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    res.json({
      success: true,
      data: topPages,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top pages',
      message: error.message
    });
  }
});

/**
 * Get user demographics from Google Analytics
 */
router.get('/demographics', async (req, res) => {
  try {
    if (!googleAnalyticsService.isInitialized()) {
      return res.status(503).json({
        success: false,
        error: 'Google Analytics service not available'
      });
    }

    const demographics = await googleAnalyticsService.getUserDemographics();

    res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
    res.json({
      success: true,
      data: demographics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user demographics',
      message: error.message
    });
  }
});

export default router;
