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
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save()

        res.status(201).send({ logout: 'success' })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()

        res.status(201).send({ logoutAll: 'success' })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/profile', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        //const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save();
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        res.status(200).send({ status: 'success', msg: 'Updates Successfully' })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/profile', auth, async (req, res) => {
    try {
        //const user = await User.findByIdAndDelete(req.user._id)
        await req.user.remove()
        res.send({ status: 'success', meg: 'User removed' })
    } catch (e) {
        res.status(500).send()
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
    const buffer = await sharp(req.file.buffer).resize({
        width: 500,
        height: 500
    }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/profile/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.remove()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(400).send()
    }
})


module.exports = router