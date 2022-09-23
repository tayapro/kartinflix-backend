express = require('express')
morgan = require('morgan')
mongoose = require('mongoose')
aws = require('aws-sdk')
axios = require('axios')
jwt = require('jsonwebtoken')
jwkToPem = require('jwk-to-pem')
cors = require('cors')
require('dotenv').config() // add values from .env file
Picture = require('./models/picture')

const app = express()
const port = 3002

aws.config.update({ region: process.env.REGION })

//in order to parse POST JSON
app.use(express.json({ limit: '5mb' }))

app.use(
    cors({
        origin: process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(' ')
            : '*',
        credentials: true,
    })
)

//to log requests
app.use(morgan('combined'))

mongoose.connect(process.env.MONGO_URL).catch(function (err) {
    console.log(err)
})

let myIDkeys = null
axios.get(process.env.MYID_URL).then((resp) => {
    myIDkeys = resp.data
})

app.listen(port, function () {
    console.log(`...Server started on port ${port}...`)
})

app.get('/ping', async function (req, res) {
    res.status(200).send()
})

// Create picture
app.post('/picture', async function (req, res) {
    try {
        const decoded_token = verifyToken(req.headers)
        if (!decoded_token) return res.status(401).send()

        const picture = new Picture({
            author: decoded_token.username,
            imgtype: req.body.imgtype,
            uploadedAt: Date.now(),
        })
        const { id } = await picture.save()
        console.log('author>>>>>>', picture.author)
        console.log("picture's id>>>>>>>>>", id)

        const s3params = {
            Bucket: process.env.BUCKET_NAME,
            Key: id,
            Body: req.body.pict,
        }

        // Create S3 service object
        s3 = new aws.S3({ apiVersion: '2022-08-21' })
        await s3.putObject(s3params).promise()

        res.status(200).json({ id: picture.id })
    } catch (e) {
        console.error(e)
        res.status(400).send()
    }
})

// Read picture
app.get('/picture/:id', async function (req, res) {
    try {
        const decoded_token = verifyToken(req.headers)
        if (!decoded_token) return res.status(401).send()

        const username = decoded_token.username
        //console.log('username >>>>>>>>> ', username)
        const { author } = await Picture.findById(req.params.id)
        //console.log('author >>>>>>>>>> ', author)

        if (author !== username) {
            return res.status(403).send()
        }

        s3 = new aws.S3({ apiVersion: '2022-08-23' })
        const s3params = {
            Bucket: process.env.BUCKET_NAME,
            Key: req.params.id,
        }
        const { Body } = await s3.getObject(s3params).promise()
        const pictb64 = Body.toString()
        const pic = Buffer.from(pictb64, 'base64')
        // console.log('pic>>>>>>>', pic)

        const { imgtype } = await Picture.findById(req.params.id)
        // console.log('type of picture>>>>>>>>>>>>', imgtype)
        res.type(imgtype)
        res.status(200).send(pic)
    } catch (e) {
        //TODO: расширить класс ошибки и добавить статус
        console.error(e)
        res.status(404).send()
    }
})

// Delete picture
app.delete('/picture/:id', async function (req, res) {
    try {
        const decoded_token = verifyToken(req.headers)
        if (!decoded_token) return res.status(401).send()

        const username = decoded_token.username
        console.log('username >>>>>>>>> ', username)
        const { author } = await Picture.findById(req.params.id)
        console.log('author >>>>>>>>>> ', author)

        if (author !== username) {
            return res.status(403).send()
        }

        const s3params = {
            Bucket: process.env.BUCKET_NAME,
            Key: req.params.id,
        }
        s3 = new aws.S3({ apiVersion: '2022-08-23' })
        s3.deleteObject(s3params).promise() //delete in S3 bucket

        await Picture.deleteOne({ _id: req.params.id }) //delete in DB

        res.status(200).send()
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

//list of pictures IDs
app.get('/pictures', async function (req, res) {
    try {
        const decoded_token = verifyToken(req.headers)
        if (!decoded_token) return res.status(401).send()

        const username = decoded_token.username

        const all_pictures = await Picture.find({ author: username })
        // console.log('pictures lenght = ', all_pictures.length)
        let result = []
        for (let i = 0; i < all_pictures.length; i++) {
            result.push(all_pictures[i].id)
            console.log('pictureID = ', all_pictures[i].id)
        }

        res.status(200).json(result)
    } catch (e) {
        //TODO: расширить класс ошибки и добавить статус
        console.error(e)
        res.status(404).send()
    }
})

function verifyToken(headers) {
    try {
        console.log('headers>>>>> ', headers)
        const auth = headers['authorization']
        if (!auth) {
            throw new Error('No auth header')
        }
        const token = auth.split(' ')[1]
        //console.log('token>>>>>>>>>', token)
        //console.log('myIDkeys>>>>>> ', myIDkeys)
        const { header } = jwt.decode(token, { complete: true })
        //console.log('key ID = ', header.kid)
        const decoded_token = jwt.verify(token, jwkToPem(myIDkeys.keys[0]), {
            algirithms: ['RS256'],
        })
        //console.log(decoded_token)
        return decoded_token
    } catch (e) {
        console.log('ERROR::', e)
        return undefined
    }
}
