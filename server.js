//
// tracker 2020.08.30 
//

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')


// upg: reverse... let others tell you where they are. .. (uses web geo)
// 	geome? .. what to use to know where others are. 
//
// 	radar?  (shows direction and distance of people

;(async n=>{
	// server
	//
	const config = require('./config')
	console.log(process.env,config)

	let {PORT} = config

	let {APIKEY,MAPKEY} = process.env

	APIKEY = APIKEY || 0
	MAPKEY = MAPKEY || 1

	console.log({APIKEY,MAPKEY})

	let app = express()
	app.use(express.static(path.join(__dirname,'www')))

	app.use('/config',async (req,res)=>{ // upg: require apikey? 
  		res.contentType('text/javascript')
		res.send(`export default ${JSON.stringify({MAPKEY})}`)
		})

	app.use(bodyParser.urlencoded({ extended: false }))


	app.all('/api/:key/where/:id',async (req,res)=>{
	
		let {key,id} = req.params

		let r = {status:'unknown'}

		if(update){
			let {data,udate} = update

			if(
				((Date.now()/1000)-udate) < (60*60*4)
				){
				let lat = data.latitude
				let lon = data.longitude
				r = {geo:{
					udate,
					lat,
					lon,
					data //optional
					}}
				}//if
			}///if

		//res.send(r)
		res.json(log.filter(v=>v.id==id))
		})


	let update = {} // for now .. update to memory
	let log = []
	app.all('/api/update/:id',async (req,res)=>{ // note: key in post
		// http post of your location
		// upg: check secret
		// upg: allow multiple format (convert to standard (incls org))

		let {id} = req.params
		console.log('update',id)
	
		let udate = Date.now()/1000
		let data = req.body

		//data = {
		//  latitude: '12.345678',
		//  longitude: '-123.23124',
		//  accuracy: '20.0',
		//  altitude: '0.0',
		//  provider: 'network',
		//  bearing: '0.0',
		//  speed: '0.0',
		//  time: '2020-04-28T22:14:00.63Z',
		//  battlevel: '95',
		//  charging: '0',
		//  secret: 'test',
		//  deviceid: 'null',
		//  subscriberid: 'null'
		//}

		let {secret} = data

		update = {udate,id,data}

		console.log('update',update)
		log.push(update)
		res.send('Update success. '+(new Date()))
		})


	/////////////////////////////
	app.listen(PORT,async n=>{
		console.log('port ready',PORT)

		setInterval(n=>{ // clean: update clean if dirty.
			console.log('clean')
			let limit = (Date.now()/1000)-(60*60*24*2) // two days ago.
			log = log.filter(n=>{
				console.log('n',n)
				return n.udate >= limit
				})
			},30000)

		//setTimeout(test,1500)
		})


	let test = n=>{
		let data = {
		  latitude: '12.345678',
		  longitude: '-123.23124',
		  accuracy: '20.0',
		  altitude: '0.0',
		  provider: 'network',
		  bearing: '0.0',
		  speed: '0.0',
		  time: '2020-04-28T22:14:00.63Z',
		  battlevel: '95',
		  charging: '0',
		  secret: 'test',
		  deviceid: 'null',
		  subscriberid: 'null'
		}

		fetch('http://localhost:3010/api/update/abc',{
			method:'POST',
			data: JSON.stringify(data) // upg: as a url encoded form post
			})
		}
	})()


	/*
	
		body [Object: null prototype] {
		  latitude: '12.345678',
		  longitude: '-123.23124',
		  accuracy: '20.0',
		  altitude: '0.0',
		  provider: 'network',
		  bearing: '0.0',
		  speed: '0.0',
		  time: '2020-04-28T22:14:00.63Z',
		  battlevel: '95',
		  charging: '0',
		  secret: 'test',
		  deviceid: 'null',
		  subscriberid: 'null'
		}


			accuracy 	: "20.297"
			altitude 	: "187.5"
			battlevel 	: "91"
			bearing 	: "0.0"
			charging 	: "0"
			latitude 	: "15.0369191"
			longitude 	: "-55.1568333"
			provider 	: "network"
			secret 		: "tomato"
			speed 		: "0.0"
			time 		: "2018-08-13T19:45:27.360Z"

		*/
