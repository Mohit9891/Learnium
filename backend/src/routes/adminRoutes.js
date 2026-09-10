const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');
const { validateObjectIdParam } = require('../middleware/validate');
const admin = require('../controllers/adminController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) cb(null, true);
    else cb(new Error('Only CSV files are allowed'));
  },
});

// All admin routes require a valid JWT with role=admin.
router.use(authMiddleware, requireRole('admin'));

router.get('/overview', admin.overview);
router.get('/stats/chapters', admin.chapterStats);

router.get('/users', admin.listUsers);
router.patch('/users/:id/role', validateObjectIdParam('id'), admin.updateUserRole);
router.delete('/users/:id', validateObjectIdParam('id'), admin.deleteUser);

router.post('/exams', admin.createExam);
router.delete('/exams/:id', validateObjectIdParam('id'), admin.deleteExam);
router.post('/subjects', admin.createSubject);
router.delete('/subjects/:id', validateObjectIdParam('id'), admin.deleteSubject);
router.post('/chapters', admin.createChapter);
router.patch('/chapters/:id', validateObjectIdParam('id'), admin.updateChapter);
router.delete('/chapters/:id', validateObjectIdParam('id'), admin.deleteChapter);

router.get('/questions', admin.listQuestions);
router.post('/questions', admin.createQuestion);
router.patch('/questions/:id', validateObjectIdParam('id'), admin.updateQuestion);
router.delete('/questions/:id', validateObjectIdParam('id'), admin.deleteQuestion);
router.post('/questions/bulk', admin.bulkQuestions);
router.post('/questions/import', upload.single('file'), admin.importCsv);

module.exports = router;
