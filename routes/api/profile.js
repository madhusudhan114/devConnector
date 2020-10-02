const express = require('express');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');


const router = express.Router();

// get profile
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const profie = await Profile.findOne({ user: userId }).populate('user', ['name', 'avatar', 'email']);
        console.log(`profile is ${profie}`);
        if (profie) {
            return res.send(profie);
        } else {
            return res.status(402).send({ msg: 'Profile does not exist' });
        }

    } catch(err) {
        return res.status(500).send({ msg: 'Server Error' });
    }
});

// create or update profile
const validationForProfile = [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
];
router.post('/', [auth, validationForProfile], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

      const profileFields = {
        user: req.user.id,
        company,
        location,
        website: website && website !== '' ? normalize(website, { forceHttps: true }) : '',
        bio,
        skills: Array.isArray(skills)
          ? skills
          : skills.split(',').map((skill) => ' ' + skill.trim()),
        status,
        githubusername
      };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
    if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route - GET 
// @desc - 
// @access - Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar', 'email']);
        res.send(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route
// @desc
// @access
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const profile = await Profile.findOne({ user: userId }).populate('user', ['name', 'avatar', 'eamil']);
        if (!profile) {
            return res.status(400).send({ msg: 'Profile Not Found' });
        }
        res.send(profile);
    } catch(err) {
        console.error('Error is ', err.message);
        if (err.kind === 'ObjectId') return res.status(400).send({ msg: 'Profile Not Found' });
        return res.status(500).send({ msg: 'Server Error' });
    }
});

// @route  - DELETE
// @desc - Delete user and profile
// @access - Private
router.delete('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        // delete posts
        // delete profile
        await Profile.findOneAndRemove({ user: userId });
        // delete user
        await User.findOneAndRemove({ _id: userId });
        return res.send('User Deeted');
    } catch(err) {
        return res.status(500).send({ msg: 'Server Error' });
    }
});


// @route
// @desc
// @access
const updateExperienceCheck = [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty()
];
router.put('/experience', [auth, updateExperienceCheck], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ msg: errors.array() });
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
          } = req.body;
      
          const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
          };

        const userId = req.user.id;
        const profile = await Profile.findOne({ user: userId });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send({ msg: err.message });
    }
});

// @route
// @desc
// @access
router.delete('/experience/:expId', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await Profile.findOne({ user: userId });
        const index = profile.experience.map(item => item.id).indexOf(req.params.expId);
        profile.experience.splice(index, 1);
        await profile.save();
        return res.json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send({ msg: err.message });
    }
});



//
// @route - PUT - '/education'
// @desc - Add and Update Education
// @access - Private
const updateEducationCheck = [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty()
];
router.put('/education', [auth, updateEducationCheck], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ msg: errors.array() });
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
          } = req.body;
      
          const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
          };

        const userId = req.user.id;
        const profile = await Profile.findOne({ user: userId });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch(err) {
        console.error(err.message);
        res.status(500).send({ msg: err.message });
    }
});

// @route - DELTE - '/education/:eduId'
// @desc - Delete education
// @access - Private
router.delete('/education/:eduId', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await Profile.findOne({ user: userId });
        const index = profile.education.map(item => item.id).indexOf(req.params.eduId);
        profile.education.splice(index, 1);
        await profile.save();
        return res.json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send({ msg: err.message });
    }
});


module.exports = router;