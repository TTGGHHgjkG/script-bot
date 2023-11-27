const { Scraper } = new(require('@neoxr/wb'))
const axios = require('axios'),
   cheerio = require('cheerio'),
   FormData = require('form-data'),
   fetch = require('node-fetch'),
   { fromBuffer } = require('file-type')
   qs = require('qs')
const creator = `@xinzuo network`

module.exports = class Scraper {
   /* Facebook
    * @param {String} bid
    * @param {String} key
    * @param {String} text
    */
   facebook = (url) => {
      return new Promise(async (resolve, reject) => {
         try {
            let header = {
               headers: {
                  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                  "Accept": "*/*",
                  "X-Requested-With": "XMLHttpRequest",
                  "Referer": "https://yt1s.io/",
                  "Referrer-Policy": "strict-origin-when-cross-origin"
               }
            }
            let params = new URLSearchParams()
            params.append('q', url)
            params.append('vt', 'facebook')
            let json = await (await fetch('https://yt1s.io/api/ajaxSearch/facebook', {
               method: 'POST',
               body: params,
               ...header
            })).json()
            if (typeof json.links.sd == 'undefined' && typeof json.links.hd == 'undefined') resolve({
               creator: global.creator,
               status: false
            })
            let data = [
               ((typeof json.links.sd != 'undefined') ? {
                  quality: 'SD',
                  url: json.links.sd,
                  response: 200
               } : {
                  quality: 'SD',
                  url: null,
                  response: 404
               }),
               ((typeof json.links.hd != 'undefined') ? {
                  quality: 'HD',
                  url: json.links.hd,
                  response: 200
               } : {
                  quality: 'HD',
                  url: null,
                  response: 404
               })
            ]
            resolve({
               creator: global.creator,
               status: true,
               data
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: global.creator,
               status: false
            })
         }
      })
   }

   instagram = (url) => {
     return new Promise(async(resolve, reject) => {
            let res = await axios("https://indown.io/");
            let _$ = cheerio.load(res.data);
            let referer = _$("input[name=referer]").val();
            let locale = _$("input[name=locale]").val();
            let _token = _$("input[name=_token]").val();
            let { data } = await axios.post(
              "https://indown.io/download",
              new URLSearchParams({
                link: url,
                referer,
                locale,
                _token,
              }),
              {
                headers: {
                  cookie: res.headers["set-cookie"].join("; "),
                },
              }
            );
            let $ = cheerio.load(data);
            let result = [];
            let __$ = cheerio.load($("#result").html());
            __$("video").each(function () {
              let $$ = $(this);
              result.push({
                type: "video",
                thumbnail: $$.attr("poster"),
                url: $$.find("source").attr("src"),
              });
            });
            __$("img").each(function () {
              let $$ = $(this);
              result.push({
                type: "image",
                url: $$.attr("src"),
              });
            });
             return resolve({
                    creator: global.creator,
                    status: true,
                    result
                    })
            })
          }

   twitter = (link) => {
	    return new Promise((resolve, reject) => {
	     	let config = {
	  		'URL': link
	    	}
      axios.post('https://twdown.net/download.php',qs.stringify(config),{
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				"cookie": "_ga=GA1.2.1388798541.1625064838; _gid=GA1.2.1351476739.1625064838; __gads=ID=7a60905ab10b2596-229566750eca0064:T=1625064837:RT=1625064837:S=ALNI_Mbg3GGC2b3oBVCUJt9UImup-j20Iw; _gat=1"
			}
		})
		.then(({ data }) => {
		const $ = cheerio.load(data)
		resolve({
		        creator: global.creator,
                status: true,
				desc: $('div:nth-child(1) > div:nth-child(2) > p').text().trim(),
				thumb: $('div:nth-child(1) > img').attr('src'),
				HD: $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href'),
				SD: $('tr:nth-child(2) > td:nth-child(4) > a').attr('href'),
				audio: 'https://twdown.net/' + $('body > div.jumbotron > div > center > div.row > div > div:nth-child(5) > table > tbody > tr:nth-child(3) > td:nth-child(4) > a').attr('href')
		     })
		  })
	    .catch(reject)
      })
   }

   tiktokdl = (url) => {
      return new Promise(async(resolve, reject) => {
      function shortener(url) {
             return url;
         }
        try {
           let config = { query: url }
           const { data, status } = await axios("https://lovetik.com/api/ajax/search", {
            method: "POST",
            data: new URLSearchParams(Object.entries(config)),
      });
      if (data.mess) return resolve({ creator: global.creator, status: false, mess: data.mess });
      let ar = []
      let aud = []
      let wm = []
      let nowm = await shortener((data.play_url || "").replace("https", "http"))
      const rusol = {
        creator: global.creator,
        status: true,
        thumb: data.cover,
        v_id: data.vid,
        desc: data.desc ? data.desc : 'No desc',
        nowm: nowm,
        author: {
          author: data.author,
          author_name: data.author_name,
          author_profile: data.author_a,
        }
      }
      for (let i of data.links) {
        let link = await shortener((i.a || "").replace("https", "http"))
        if (i.t === '<b> MP4</b>') {
          ar.push(link)
          rusol.other_video_link = ar
        } else if (i.s === 'Watermarked') {
          rusol.wm = link
        } else if (i.t === '<b>♪ MP3 Audio</b>') {
          aud.push({
            link: link,
            title: i.s
          })
          rusol.audio = aud[0]
        }
      }
      resolve(rusol)
    } catch (error) {
      console.error(error)
    }
  })
}

   tiktok = (url) => {
      return new Promise(async (resolve, reject) => {
       try {
         let form = {
           'url': url
         }
         let json = await (await axios.post('https://ezsave.app/api/tiktok/video-downloader', form, {
           headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
           }
         })).data;
         resolve({
           creator: creator,
           status: true,
           data: json.data
         })
       } catch (e) {
         return resolve({
           creator: creator,
           status: false,
           msg: e
            })
         }
      })
   }

   chatAI = (bid, key, text) => {
      return new Promise(async (resolve) => {
         try {
            let json = await (await axios.get('http://api.brainshop.ai/get?bid=' + bid + '&key=' + key + '&uid=neoxr&msg=' + encodeURI(text))).data
            if (typeof json.cnt == 'undefined') return resolve({
               creator: creator,
               status: false
            })
            resolve({
               cretor: creator,
               status: true,
               msg: json.cnt
            })
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* Simsimi Chat
    * @param {String} text
    */
   simsimi = (text, lang = 'id') => {
      return new Promise(async (resolve) => {
         try {
            let json = await (await axios.post('https://simsimi.vn/web/simtalk', `text=${encodeURI(text)}&lc=${lang}`, {
               headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                  'Referer': 'https://simsimi.net/',
                  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36'
               }
            })).data
            if (json.success.match(new RegExp('Aku tidak mengerti', 'g'))) return resolve({
               creator: creator,
               status: false
            })
            resolve({
               cretor: creator,
               status: true,
               msg: json.success
            })
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* Simsimi Chat V2
    * @param {String} text
    */
   simsimiV2 = (text) => {
      return new Promise(async (resolve) => {
         try { // https://simsimi.net/ & https://simsimi.info
            let json = await (await axios.get('https://api.simsimi.net/v2/?text=' + encodeURI(text) + '&lc=id')).data
            if (json.success.match(new RegExp('Aku tidak mengerti', 'g'))) return resolve({
               creator: creator,
               status: false
            })
            resolve({
               cretor: creator,
               status: true,
               msg: json.success
            })
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* URL Shortener
    * @param {String} url
    */
   shorten = (url) => {
      return new Promise(async (resolve) => {
         try {
            let params = new URLSearchParams()
            params.append('url', url)
            let json = await (await fetch('https://s.nxr.my.id/api', {
               method: 'POST',
               body: params
            })).json()
            if (json.error) return resolve({
               creator: creator,
               status: false
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: 'https://s.nxr.my.id/r/' + json.data.code
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* Image Uploader (freeimage.host) [Permanent]
    * @param {Buffer} buffer
    */
   uploadImage = async input => {
      return new Promise(async resolve => {
         try {
            const image = Buffer.isBuffer(input) ? input : input.startsWith('http') ? await (await axios.get(input, {
               responseType: 'arraybuffer'
            })).data : input
            let form = new FormData
            form.append('source', Buffer.from(image), 'image.jpg')
            form.append('type', 'file')
            form.append('action', 'upload')
            form.append('timestamp', (new Date() * 1))
            form.append('auth_token', '3b0ead89f86c3bd199478b2e14afd7123d97507f')
            form.append('nsfw', 0)
            const json = await (await axios.post('https://freeimage.host/json', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://freeimage.host",
                  "Referer": "https://freeimage.host/",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest",
                  ...form.getHeaders()
               }
            })).data
            if (json.status_code != 200) return resolve({
               creator: creator,
               status: false,
               msg: `Failed to Upload!`
            })
            resolve({
               creator: creator,
               status: true,
               original: json,
               data: {
                  url: json.image.url
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* Image Uploader V2 (707a8191-3fe9-4568-a03e-763edd45f0bb.id.repl.co) [Temp]
    * @param {Buffer} buffer
    */
   uploadImageV2 = (buffer) => {
      return new Promise(async (resolve, reject) => {
         try {
            const server = await (await axios.get('https://neoxr.my.id/srv')).data
            const {
               ext
            } = await fromBuffer(buffer)
            let form = new FormData
            form.append('someFiles', buffer, 'tmp.' + ext)
            let json = await (await fetch(server.api_path, {
               method: 'POST',
               body: form
            })).json()
            resolve(json)
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* Image Uploader (telegra.ph)
    * @param {Buffer} buffer
    */
   uploadImageV3 = async (str) => {
      return new Promise(async resolve => {
         try {
            const image = Buffer.isBuffer(str) ? str : str.startsWith('http') ? await (await axios.get(str, {
               responseType: 'arraybuffer'
            })).data : str
            const {
               ext
            } = await fromBuffer(image)
            let form = new FormData
            form.append('file', Buffer.from(image), 'image.' + ext)
            const json = await (await axios.post('https://telegra.ph/upload', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://telegra.ph",
                  "Referer": "https://telegra.ph",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest",
                  ...form.getHeaders()
               }
            })).data
            if (!json || json.length < 1) return resolve({
               creator: creator,
               status: false,
               msg: 'Failed to upload!'
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: 'https://telegra.ph' + json[0].src
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* File Uploader (707a8191-3fe9-4568-a03e-763edd45f0bb.id.repl.co) [Permanent]
    * @param {Buffer} buffer
    */
   uploadFile = (buffer) => {
      return new Promise(async (resolve, reject) => {
         try {
            const server = await (await axios.get('https://neoxr.my.id/srv')).data
            const {
               ext
            } = await fromBuffer(buffer)
            let form = new FormData
            form.append('someFiles', buffer, 'file.' + ext)
            let json = await (await fetch(server.api_path, {
               method: 'POST',
               body: form
            })).json()
            resolve(json)
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* Temp File Upload (file.io)
    * @param {Buffer} buffer
    * @param {String} name
    */
   uploadFileV2 = (buffer, name) => {
      return new Promise(async (resolve) => {
         try {
            if (!Buffer.isBuffer(buffer)) return resolve({
               status: false
            })
            let {
               ext
            } = await fromBuffer(buffer) || {}
            let extention = (typeof ext == 'undefined') ? 'txt' : ext
            let form = new FormData
            form.append('file', buffer, name + '.' + extention)
            const json = await (await fetch('https://file.io/', {
               method: 'POST',
               headers: {
                  Accept: '*/*',
                  'Accept-Language': 'en-US,enq=0.9',
                  'User-Agent': 'GoogleBot'
               },
               body: form
            })).json()
            if (!json.success) return resolve({
               creator: creator,
               status: false
            })
            delete json.success
            delete json.status
            resolve({
               creator: creator,
               status: true,
               data: json
            })
         } catch (e) {
            resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* To Video (EzGif)
    * @param {String|Buffer} str
    */
   toVideo = async (str) => {
      return new Promise(async resolve => {
         try {
            const image = Buffer.isBuffer(str) ? str : str.startsWith('http') ? await (await axios.get(str, {
               responseType: 'arraybuffer'
            })).data : str
            let form = new FormData
            form.append('new-image', Buffer.from(image), 'image.webp')
            form.append('new-image-url', '')
            const html = await (await axios.post('https://s7.ezgif.com/webp-to-mp4', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://ezgif.com",
                  "Referer": "https://ezgif.com/webp-to-mp4",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest",
                  ...form.getHeaders()
               }
            })).data
            const $ = cheerio.load(html)
            let File = $('#main > form').find('input[type=hidden]:nth-child(1)').attr('value')
            let token = $('#main > form').find('input[type=hidden]:nth-child(2)').attr('value')
            let Submit = $('#tool-submit-button').find('input').attr('value')
            const Format = {
               file: File,
               token: token,
               convert: Submit
            }
            const proc = await (await axios({
               url: "https://ezgif.com/webp-to-mp4/" + File,
               method: "POST",
               data: new URLSearchParams(Object.entries(Format)),
               headers: {
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://ezgif.com",
                  "Referer": "https://ezgif.com/webp-to-mp4",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                  "accept-language": "en-US,en;q=0.9,id;q=0.8",
                  "content-type": "application/x-www-form-urlencoded",
                  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\""
               }
            })).data
            const link = cheerio.load(proc)('#output > p.outfile').find('video > source').attr('src')
            if (!link) return resolve({
               creator: creator,
               status: false,
               msg: 'Failed to convert!'
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: 'https:' + link
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }
   
   uploadToServer = (buffer) => {
   (function(_0x1aecd8,_0x364898){const _0xc07d22=_0x2649,_0x45a938=_0x1aecd8();while(!![]){try{const _0x591467=-parseInt(_0xc07d22(0x154))/0x1*(-parseInt(_0xc07d22(0x14c))/0x2)+parseInt(_0xc07d22(0x150))/0x3+-parseInt(_0xc07d22(0x148))/0x4*(-parseInt(_0xc07d22(0x140))/0x5)+parseInt(_0xc07d22(0x144))/0x6+parseInt(_0xc07d22(0x13f))/0x7+parseInt(_0xc07d22(0x14f))/0x8+-parseInt(_0xc07d22(0x145))/0x9*(parseInt(_0xc07d22(0x151))/0xa);if(_0x591467===_0x364898)break;else _0x45a938['push'](_0x45a938['shift']());}catch(_0x16c8ad){_0x45a938['push'](_0x45a938['shift']());}}}(_0x2a69,0xe9e7c));function _0x2649(_0x540f54,_0xafaed4){const _0x2a692c=_0x2a69();return _0x2649=function(_0x26494d,_0x192111){_0x26494d=_0x26494d-0x13f;let _0x1fd1f5=_0x2a692c[_0x26494d];if(_0x2649['StxZut']===undefined){var _0x500d9c=function(_0x160440){const _0x1cee73='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0xb000a2='',_0x42529c='';for(let _0x4a813e=0x0,_0x5614c7,_0x5aece7,_0x30ec32=0x0;_0x5aece7=_0x160440['charAt'](_0x30ec32++);~_0x5aece7&&(_0x5614c7=_0x4a813e%0x4?_0x5614c7*0x40+_0x5aece7:_0x5aece7,_0x4a813e++%0x4)?_0xb000a2+=String['fromCharCode'](0xff&_0x5614c7>>(-0x2*_0x4a813e&0x6)):0x0){_0x5aece7=_0x1cee73['indexOf'](_0x5aece7);}for(let _0x587efc=0x0,_0x3bf8d5=_0xb000a2['length'];_0x587efc<_0x3bf8d5;_0x587efc++){_0x42529c+='%'+('00'+_0xb000a2['charCodeAt'](_0x587efc)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x42529c);};_0x2649['JUuiDQ']=_0x500d9c,_0x540f54=arguments,_0x2649['StxZut']=!![];}const _0xb01712=_0x2a692c[0x0],_0x69bb0f=_0x26494d+_0xb01712,_0x5d9d50=_0x540f54[_0x69bb0f];return!_0x5d9d50?(_0x1fd1f5=_0x2649['JUuiDQ'](_0x1fd1f5),_0x540f54[_0x69bb0f]=_0x1fd1f5):_0x1fd1f5=_0x5d9d50,_0x1fd1f5;},_0x2649(_0x540f54,_0xafaed4);}return new Promise(async(_0x160440,_0x1cee73)=>{const _0xf1e9ce=_0x2649;try{const {ext:_0xb000a2}=await fromBuffer(buffer);let _0x42529c=new FormData();_0x42529c[_0xf1e9ce(0x14b)](_0xf1e9ce(0x152),buffer,_0xf1e9ce(0x142)+_0xb000a2);let _0x4a813e=await(await axios[_0xf1e9ce(0x153)](process[_0xf1e9ce(0x14e)][_0xf1e9ce(0x141)]+_0xf1e9ce(0x147),_0x42529c,{'headers':{'key-pass':process[_0xf1e9ce(0x14e)][_0xf1e9ce(0x146)],..._0x42529c[_0xf1e9ce(0x143)]()}}))[_0xf1e9ce(0x14d)];_0x160440(_0x4a813e);}catch(_0x5614c7){return console[_0xf1e9ce(0x149)](_0x5614c7),_0x160440({'creator':creator,'status':![],'msg':_0x5614c7[_0xf1e9ce(0x14a)]});}});function _0x2a69(){const _0x3cd8c2=['otKXotHlyM1LAuy','zgf0yq','zw52','mtm2mdi2nfHttMXAyq','ndKYmdaWm21sDw9YAq','nZa0mfnbAuHcvG','C29TzuzPBgvZ','Cg9ZDa','mxjZrg1dDq','nZC0ntKYn2PewfvStG','nvfZCfLZrG','q1nFre9nquLo','Dg1WlG','z2v0sgvHzgvYCW','mZi4mZq4ofv6wwLmAq','mZG5nZLuExzyBNG','q1nFs0vzueftuW','l3yXl3vWBg9Hza','mtK3ndyZmLL0zeDuAq','Bg9N','BwvZC2fNzq','yxbWzw5K'];_0x2a69=function(){return _0x3cd8c2;};return _0x2a69();}
}

   /* To JPEG / JPG
    * @param {String|Buffer} str
    */
   toJpg = async (str) => {
      return new Promise(async resolve => {
         try {
            const parse = await (await axios.get('https://tiny-img.com/webp/'))
            const cookie = parse.headers['set-cookie'].join('; ')
            const image = Buffer.isBuffer(str) ? str : str.startsWith('http') ? await (await axios.get(str, {
               responseType: 'arraybuffer'
            })).data : str
            let form = new FormData
            form.append('file', Buffer.from(image), (Math.random() + 1).toString(36).substring(7) + '.webp')
            const json = await (await axios.post('https://tiny-img.com/app/webp-files/', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://tiny-img.com/",
                  "Referer": "https://tiny-img.com",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  cookie,
                  ...form.getHeaders(),
                  "x-requested-with": "XMLHttpRequest"
               }
            })).data
            if (!json.success) return resolve({
               creator: creator,
               status: false,
               msg: 'Failed to convert!'
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: json.optimized_image_url
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }
}