import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all candidates for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    // Parse skills from JSON string
    const formatted = candidates.map(c => ({
      ...c,
      skills: JSON.parse(c.skills)
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error('Get candidates error', err);
    res.status(500).json({ error: 'Error fetching candidates' });
  }
});

// Create multiple candidates (used for sync or mock load)
router.post('/bulk', requireAuth, async (req, res) => {
  try {
    const { candidates } = req.body; // array of candidate objects
    if (!Array.isArray(candidates)) return res.status(400).json({ error: 'Expected an array' });

    // Map to DB structure
    const dbData = candidates.map(c => ({
      userId: req.user.id,
      name: c.name,
      currentRole: c.currentRole,
      yearsOfExperience: c.yearsOfExperience,
      education: c.education || '',
      summary: c.summary || '',
      skills: JSON.stringify(c.skills || []),
      isMock: c.id?.includes('RAND') || false
    }));

    await prisma.candidate.createMany({
      data: dbData
    });

    res.json({ message: 'Saved successfully' });
  } catch (err) {
    console.error('Bulk save error', err);
    res.status(500).json({ error: 'Error saving candidates' });
  }
});

// Toggle shortlist candidate
router.post('/shortlist/:candidateId', requireAuth, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { score, matchedSkills, missingSkills } = req.body;

    const existing = await prisma.shortlist.findUnique({
      where: { userId_candidateId: { userId: req.user.id, candidateId } }
    });

    if (existing) {
      // Remove it
      await prisma.shortlist.delete({ where: { id: existing.id }});
      return res.json({ message: 'Removed from shortlist', isShortlisted: false });
    } else {
      // Add it
      await prisma.shortlist.create({
        data: {
          userId: req.user.id,
          candidateId,
          score,
          matchedSkills: JSON.stringify(matchedSkills || []),
          missingSkills: JSON.stringify(missingSkills || [])
        }
      });
      return res.json({ message: 'Added to shortlist', isShortlisted: true });
    }
  } catch (err) {
    console.error('Shortlist error', err);
    res.status(500).json({ error: 'Error toggling shortlist' });
  }
});

// Get shortlists
router.get('/shortlists', requireAuth, async (req, res) => {
  try {
    const items = await prisma.shortlist.findMany({
      where: { userId: req.user.id },
      include: { candidate: true },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = items.map(s => ({
      ...s.candidate,
      skills: JSON.parse(s.candidate.skills),
      score: s.score,
      matchedSkills: s.matchedSkills ? JSON.parse(s.matchedSkills) : [],
      missingSkills: s.missingSkills ? JSON.parse(s.missingSkills) : [],
      shortlistId: s.id
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Get shortlists err', err);
    res.status(500).json({ error: 'Error fetching shortlists' });
  }
});

export default router;
