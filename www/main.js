import config from './config'
console.log({config})

;(async n=>{
	let {MAPKEY} = config
	let accessToken = MAPKEY

	let apiBase = './api/12345' // pull key from url (for the time being)

	let who = location.hash.replace(/^#/,'')
	console.log('who',who)

	document.body.xonclick = n=>{
		//toggle fullscreen // upg: use polyfill
		if(document.fullscreen)
			document.exitFullscreen()
		else
			document.documentElement.requestFullscreen() 
		}



	let la = false
	let lo = false
	
	let mymap = L.map('mapid')


	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1,
		accessToken}).addTo(mymap);
		//upg: pull from config.js (from server gen)

	let dots = []
	let _timer = false
	let _set = false
	const tick = async n=>{
		let f = await fetch(apiBase+'/where/'+who) // all
		if(f.ok){
			let ff = await f.json()
			console.log({ff})

			ff = ff.filter(v=>{ // upg: server not record if no data
				return v.data && v.data.latitude && v.data.longitude && v.id == who
				})

			ff = ff.slice(-8) // last 8 items // also filter out if too old? (24hrs?)
			ff.reverse()

			clearInterval(_timer)
			dots.forEach(v=>{
				v.circle.removeFrom(mymap)
				})

			let m = ff

			console.log({m})
			if(m.length > 0){
				la = m[0].data.latitude
				lo = m[0].data.longitude
				}
			
			if(!_set && lo && la){
				mymap.setView([la, lo], 13)
				_set = true
				}

			// upg: jump each one indivitually.. _ _ _ ^ _ _ 
			// 				     ---------->
			m.forEach((v,i)=>{
				la = parseFloat(v.data.latitude)
				lo = parseFloat(v.data.longitude)//+(i*0.02)

				let radius = 20
				let rate = -0.01//+(i*0.01)
				let phase = 1-(i*0.1)
				var circle = L.circle([la,lo], {
				    color: 'red',
				    fillColor: '#f03',
				    fillOpacity: 1-(i*0.2),
				    radius
				}).addTo(mymap);
			dots.push({index:i,rate,radius,init_phase:phase,phase,circle})
			})


			//upg: animation frame request
			_timer = setInterval(n=>{
				let _reset = false
				dots.forEach((i,n)=>{
					let {rate,radius,circle,phase,init_phase} = i
					
					let p = phase

					rate = rate * (phase>0.3?phase:1)

					p = p+rate
					let pp = p
					if(p <= 0.1){
						if(p <= 0){
							if(n == 0){
								_reset = true
								}
							if(_reset)
								pp = init_phase
							}//if

						p = 0.1
						}//if
					circle.setRadius(radius*p)
					i.phase = pp
					})
				},16)
			}

		setTimeout(tick,30000) // upg: use network sync method. get updated right away, cache data for later.
		}//func

	tick()
})();
