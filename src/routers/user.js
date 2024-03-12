const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const { default: mongoose } = require('mongoose')
const multer = require('multer')
// const sharp = require('sharp')
const {sendWelcomeEmail,sendCanceledEmail} = require('../emails/account')



router.post('/user', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        // sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
      

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        console.log(error);
        res.status(500).send()
    }
})



router.get('/user/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdate.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid update" })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {

        res.status(404).send(error)
    }
})

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCanceledEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})
const upload = multer({
    limits: {
        fileSize: 1000000
    }, fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an images'))
        }
        cb(undefined, true)
    }
})
// router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
//     try {
//         // const buffer = await sharp(req.file.buffer).resize({ height: 250, width: 250 }).png().toBuffer()
//         req.user.avatar = buffer
//         await req.user.save()
//         res.send()
//     } catch (error) {
//         res.status(500).send()
//     }
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })

router.delete('/user/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        console.log(error);
        res.status(500).send()
    }
})

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(400).send()
    }
})

module.exports = router