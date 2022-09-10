const express = require('express')
const User = require('./models/user')
const auth = require('./middleware/auth')

const app = express()
const port = process.env.PORT

app.use(express.json())

app.post('/users/signup', async (req, res) => {
    try{
        await User.create(req.body)
        const token = await User.genToken(req.body.email)
        const signup = await User.findOne({where: {email:req.body.email}, attributes: ['id','name','email','phone']})
        res.status(201).send({signup, token})
        console.log('user added')
    } catch(e) {
        console.log('Signup unsuccessful')
        res.status(400).send({error:e.message})
    }
})

app.post('/users/login', async (req, res) => {
    try{
        const token = await User.genToken(req.body.email)
        const user = await User.findByCred(req.body.email, req.body.password)
        res.status(202).send({user, token})
        console.log('logged in')
    } catch(e) {
        console.log('Login unsuccessful')
        res.status(401).send('Login unsuccessful')
    }
})

app.get('/users/me', auth, async(req, res) => {
    try{
        res.status(202).send({profile})
    } catch(e) {
        res.send(e)
    }
})

app.get('/users/logout', auth, async (req, res) => {
    try{
        await User.update({tokens:''}, {
            where: {
                email:profile.email
            }
        })
        res.status(200).send('logged out')
    } catch(e) {
        res.status(400).send(e)
    }
})

app.patch('/users/update', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password', 'phone', 'country']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if (isValidUpdate===false) {
        return res.status(400).send(`error: update can't be done, check parameters to be updated`)
    }
    try {    
        for (field in updates) {
            await User.update({[updates[field]]:req.body[updates[field]]}, {
                where: {
                    email: profile.email
                }
            })        
        }
        console.log('update done')
        res.status(201).send('Update successful')            
    } catch(e) {
        console.log('update unsuccessful')
        res.status(400).send({error:'unsuccessful', error:e.message})
    }
})

app.delete('/users/del', auth, async (req, res) => {
    try{
        User.destroy({where: {
            email:profile.email
        }})
        res.status(200).send('Profile deleted')
    } catch(e) {
        res.status(400).send(e)
    }
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})