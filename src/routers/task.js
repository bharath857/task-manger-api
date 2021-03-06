const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        let response ={
            success: true,
            task:task
        }
        res.status(201).send(response)
    } catch (e) {
        let response ={
            success: false,
            error:e
        }
        res.status(400).send(response)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({owner:req.user._id})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        let response ={
            success:true,
            tasks:req.user.tasks
        }
        res.send(response)
    } catch (e) {
        let response ={
            success:false,
            error:e
        }
        res.status(500).send(response)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        let response = {
            success:false,
            error:'Invalid updates!'
        }
        return res.status(400).send(response)
    }

    try {
        //  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        //const task = await Task.findById(req.params.id)

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update => task[update] = req.body[update]))
        await task.save();
        let response = {
            success:true,
            task
        }
        res.send(response)
    } catch (e) {
        let response = {
            success:false,
            error:e
        }
        res.status(401).send(response)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router