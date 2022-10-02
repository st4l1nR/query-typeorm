import express from 'express'
import typeormQuery from './lib/typeormQuery' 
const app = express()
app.get('/query', async () => {
  typeormQuery('status=ACTIVE&range[]=0&range[]=10')
})
app.listen(3000, ()  =>  "Server ready at port 3000")