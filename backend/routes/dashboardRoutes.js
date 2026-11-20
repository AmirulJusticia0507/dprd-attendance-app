const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const { restrictTo } = require('../middlewares/roleMiddleware');

router.use(authMiddleware);

router.get('/anggota', restrictTo('anggota'), controller.getAnggotaDashboard);
router.get('/admin', restrictTo('admin'), controller.getAdminDashboard);

module.exports = router;
