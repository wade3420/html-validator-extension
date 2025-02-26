import express, { RequestHandler } from 'express'
import fetch from 'node-fetch'


const router = express.Router()
// eslint-disable-next-line @typescript-eslint/no-require-imports
const  validate = require('html-validator')


const proxyHandler: RequestHandler = async (req, res) => {
  const { port } = req.query
  
  if (!port) {
    res.status(400).json({ error: '포트 번호가 필요합니다.' })
    return
  }
 
  try {
    const response = await fetch(`http://localhost:${port}`)
    const html = await response.text()

    const result = await validate({
      data: html,
      format: 'text'
    })

    res.send(result)
  } catch (e: unknown) {
    console.error(e)
    res.status(500).json({ error: '서버 접속 중 오류가 발생했습니다.' })
  }
}

router.get('/proxy', proxyHandler)

const app = express()
app.use('/api', router)
 
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`프록시 서버가 포트 ${PORT}에서 실행 중입니다.`)
}) 