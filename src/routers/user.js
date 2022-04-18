const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer');
const sharp = require('sharp')

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken();
        let response = {
            success: true,
            user,
            token
        }
        res.status(201).send(response)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(400).send(response)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken();
        let response = {
            success: true,
            user,
            token
        }
        res.status(201).send(response)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(400).send(response)
    }
})

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save()
        let response = {
            success: true
        }
        res.status(201).send(response)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(400).send(response)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        let response = {
            success: true
        }
        res.status(201).send(response)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(400).send(response)
    }
})

router.get('/users/profile', auth, async (req, res) => {
    try {
        let response = {
            success: true,
            user: req.user
        }
        res.send(response)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(500).send(response)
    }
})

router.patch('/users/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        let response = {
            success: false,
            error: 'Invalid updates!'
        }
        return res.status(400).send(response)
    }

    try {
        //const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save();
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        let response = {
            success: true,
            user: req.user
        }
        res.status(200).send(response)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(400).send(response)
    }
})

router.delete('/users/profile', auth, async (req, res) => {
    try {
        //const user = await User.findByIdAndDelete(req.user._id)
        await req.user.remove()
        let response = {
            success: true
        }
        res.send(response)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(500).send(response)
    }
})

const upload = multer({
    /*  dest: 'avatars', */
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload image'))
        }
        callback(undefined, true)
    }
})
/* <img src="data:image/jpg;base64, avatar" */
router.post('/users/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({
            width: 500,
            height: 500
        }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        let response = {
            success: true
        }
        res.send(response)
    } catch (e) {
        throw new Error('Unable to find file')
        /* let response = {
            success: false,
            error: error.message
        }
        res.status(400).send(response) */
    }

}, (error, req, res, next) => {
    let response = {
        success: false,
        error: error.message
    }
    res.status(400).send(response)
})

router.delete('/users/profile/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    let response = {
        success: true
    }
    res.send(response)
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        let response = {
            success: true,
            avatar: user.avatar
        }
        res.send(user.avatar)
    } catch (e) {
        let response = {
            success: false,
            error: e
        }
        res.status(400).send(response)
    }
})


module.exports = router