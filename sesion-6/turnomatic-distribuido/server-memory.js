const redis = require('redis')
const http = require('http')

const hostname = '0.0.0.0'
const port = 7017
const redisHost = 'localhost'

const server = http.createServer(answer)
let client = null
let turno = 0

function answer(request, response) {
	const paths = request.url.split('/')
	if (paths.length < 3 || paths[0] !== '' || paths[1] != 'turno') {
		response.statusCode = 400
		response.end(JSON.stringify({error: `Invalid URL ${request.url}`}, null, '\t'))
		return
	}
	const id = paths[2]
	getResult(id).then(result => {
		response.statusCode = 200
		response.setHeader('Content-Type', 'application/json')
		response.end(JSON.stringify(result, null, '\t'))
	}).catch(error => {
		response.statusCode = 500
		response.end(JSON.stringify({error}))
	})
}

async function getResult(id) {
	turno += 1
	return {id, turno}
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

function getRedisResult(id) {
	return new Promise((resolve, reject) => {
		if (!client) {
			initRedis()
		}
		client.incr(id, (error, result) => {
			if (error) return reject(error)
			console.log(`Read ${id}: ${result}`)
			resolve({id, turno: result})
		})
	})
}

function initRedis() {
	client = redis.createClient({
		host: 'clusterturnomatic.wkblaq.0001.euw3.cache.amazonaws.com',
		port: 6379,
	})
	client.on('error', function(error) {
		console.error(error)
	})
}

