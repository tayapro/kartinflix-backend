express = require('express')
morgan = require('morgan')
mongoose = require('mongoose')
aws = require('aws-sdk')
require('dotenv').config() // add values from .env file
Picture = require('./models/picture')

const app = express()
const port = 3002

aws.config.update({ region: process.env.REGION })

//in order to parse POST JSON
app.use(express.json({ limit: '50mb' }))

//to log requests
app.use(morgan('combined'))

mongoose.connect(process.env.MONGO_URL).catch(function (err) {
    console.log(err)
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
        const picture = new Picture({
            pictb64: req.body.pict,
            imgtype: req.body.imgtype,
        })
        const { id } = await picture.save()
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
        s3 = new aws.S3({ apiVersion: '2022-08-23' })
        const s3params = {
            Bucket: process.env.BUCKET_NAME,
            Key: req.params.id,
        }
        const { Body } = await s3.getObject(s3params).promise()
        const pictb64 = Body.toString()
        const pic = Buffer.from(pictb64, 'base64')
        console.log('pic>>>>>>>', pic)

        const { imgtype } = await Picture.findById(req.params.id)
        console.log('type of picture>>>>>>>>>>>>', imgtype)
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
        const s3params = {
            Bucket: process.env.BUCKET_NAME,
            Key: req.params.id,
        }
        s3 = new aws.S3({ apiVersion: '2022-08-23' })
        s3.deleteObject(s3params).promise()

        res.status(200).send()
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})
